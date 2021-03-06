<script>
import Vue from 'vue';
import Utils from '@zhennann/framework7/packages/vue/utils/utils.js';
import Mixins from '@zhennann/framework7/packages/vue/utils/mixins';
const f7Treeview = Vue.options.components['f7-treeview'].extendOptions;

export default {
  meta: {
    global: true,
  },
  name: 'eb-treeview',
  extends: f7Treeview,
  props: {
    root: {
      type: Object,
    },
    onNodePerform: {
      type: Function,
    },
    onLoadChildren: {
      type: Function,
    },
  },
  data() {
    return {
      treeviewId: Vue.prototype.$meta.util.nextId('treeview'),
      treeviewRoot: null,
      selectedItem: null,
    };
  },
  render() {
    //
    const _h = this.$createElement;
    const props = this.props;
    const {
      className,
      id,
      style,
    } = props;
    const classes = Utils.classNames(className, 'treeview', Mixins.colorClasses(props));

    // nodes
    const nodes = this.treeviewRoot ? this._renderNodes(_h, this.treeviewRoot.children, this.treeviewId) : [];

    //
    return _h('div', {
      style,
      class: classes,
      attrs: {
        id,
      },
    }, nodes);
  },
  watch: {
    root() {
      this.reload();
    },
  },
  created() {
    this.reload();
  },
  methods: {
    reload() {
      if (this.root) {
        this._initRootNode();
        this._loadChildren(this.treeviewRoot);
      }
    },
    reloadNode(node, nodeNew) {
      if (node.root) return;
      // empty
      node.children.splice(0, node.children.length);
      // splice
      const nodeParent = node.parent;
      if (nodeNew) {
        const index = nodeParent.children.findIndex(item => item.id === node.id);
        node = this.$utils.extend({}, node, nodeNew);
        nodeParent.children.splice(index, 1, node);
      }
      // load again
      if (node._loaded) {
        node._loaded = false;
        this._loadChildren(node);
      }
    },
    removeNode(node) {
      if (node.root) return;
      // splice
      const nodeParent = node.parent;
      const index = nodeParent.children.findIndex(item => item.id === node.id);
      nodeParent.children.splice(index, 1);
      // selected
      if (this.selectedItem && this.selectedItem.id === node.id) this.selectedItem = null;
    },
    treeUp(nodeStart, cb) {
      nodeStart = nodeStart || this.treeviewRoot;
      if (!nodeStart) return;
      this._treeUp(nodeStart, cb);
    },
    treeDown(nodeStart, cb) {
      nodeStart = nodeStart || this.treeviewRoot;
      if (!nodeStart) return;
      this._treeDown(nodeStart, cb);
    },
    treeParent(nodeStart, cb) {
      if (!nodeStart) return;
      this._treeParent(nodeStart.parent, cb);
    },
    find(nodeStart, cb) {
      let node = null;
      this.treeDown(nodeStart, item => {
        if (cb(item)) {
          node = item;
          return false; // break
        }
      });
      return node;
    },
    selected() {
      return this.selectedItem;
    },
    checked(options) {
      if (!this.treeviewRoot) return this.treeviewRoot.attrs.multiple ? [] : null;

      // single
      if (!this.treeviewRoot.attrs.multiple) {
        let checkedNode = null;
        this.treeDown(null, item => {
          if (item.attrs.checked) {
            checkedNode = item;
            return false; // break
          }
        });
        return checkedNode;
      }

      // multiple
      const checkedNodes = [];
      this.treeDown(null, item => {
        if (item.attrs.checked) {
          // push this
          checkedNodes.push(item);
          // break children
          return true;
        }
      });
      return checkedNodes;
    },
    _treeParent(node, cb) {
      if (!node) return;
      const res = cb(node);
      if (res === false) return false; // return immediately
      return this._treeParent(node.parent, cb);
    },
    _treeUp(nodeParent, cb) {
      // children
      for (const node of nodeParent.children) {
        // children first
        let res = this._treeUp(node, cb);
        if (res === false) return false; // return immediately
        if (res !== true) {
          // current
          res = cb(node, nodeParent);
          if (res === false) return false; // return immediately
        }
      }
    },
    _treeDown(nodeParent, cb) {
      // children
      for (const node of nodeParent.children) {
        // current first
        let res = cb(node, nodeParent);
        if (res === false) return false; // return immediately
        if (res !== true) {
          // children
          res = this._treeDown(node, cb);
          if (res === false) return false; // return immediately
        }
      }
    },
    _initRootNode() {
      const _root = this.$utils.extend({}, this.root);
      // root
      _root.root = true;
      // attrs
      if (!_root.attrs) _root.attrs = {};
      // loadChildren
      if (_root.attrs.loadChildren === undefined && this.onLoadChildren) _root.attrs.loadChildren = true;
      // children
      if (!_root.children) _root.children = [];
      // record parent
      this.treeDown(_root, (item, itemParent) => {
        item.parent = itemParent;
      });
      // ready
      this.treeviewRoot = _root;
    },
    _renderNode(_h, node, attrIdParent) {
      // node
      const _node = { ...node };
      _node.attrs = this.$utils.extend({}, node.attrs);
      // attrs id
      _node.attrs.id = `${attrIdParent}-${node.id}`;
      // attrs
      if (_node.attrs.itemToggle === undefined) _node.attrs.itemToggle = this.treeviewRoot.attrs.itemToggle;
      if (_node.attrs.opened === undefined) _node.attrs.opened = this.treeviewRoot.attrs.opened;
      if (_node.attrs.checkbox === undefined) _node.attrs.checkbox = this.treeviewRoot.attrs.checkbox;
      if (_node.attrs.selectable === undefined) _node.attrs.selectable = this.treeviewRoot.attrs.selectable;
      if (_node.attrs.selectable) _node.attrs.selected = (this.selectedItem && this.selectedItem.id === node.id);
      // attrs onNodePerform
      if (this.onNodePerform && node.attrs.onPerform === undefined) {
        _node.attrs.onPerform = (e, context) => {
          return this.onNodePerform(e, context, node);
        };
      }
      // children
      let children = [];
      // checkbox
      const radio = !this.treeviewRoot.attrs.multiple;
      if (_node.attrs.checkbox && radio) {
        children.push(_h('f7-radio', {
          slot: 'content-start',
          attrs: {
            checked: _node.attrs.checked,
          },
          on: {
            change: e => {
              this._onNodeChange(node, e.target.checked);
            },
          },
        }));
      } else if (_node.attrs.checkbox && !radio) {
        children.push(_h('f7-checkbox', {
          slot: 'content-start',
          attrs: {
            checked: _node.attrs.checked,
            indeterminate: _node.attrs.indeterminate,
          },
          on: {
            change: e => {
              this._onNodeChange(node, !node.attrs.checked);
            },
          },
        }));
      }
      // scopedSlots
      const slots = this._renderScopeSlots(_h, node);
      if (slots && slots.length > 0) children = children.concat(slots);
      // children of node
      const childrenNode = this._renderNodes(_h, node.children, _node.attrs.id);
      if (childrenNode && childrenNode.length > 0) children = children.concat(childrenNode);
      // ok
      return _h('eb-treeview-item', {
        key: _node.id,
        attrs: _node.attrs,
        class: _node.class,
        style: _node.style,
        on: {
          'treeview:loadchildren': (e, done) => {
            this._onNodeLoadChildren(e, done, node);
          },
          click: e => {
            this._onNodeClick(e, node);
          },
        },
      }, children);
    },
    _renderNodes(_h, nodes, attrIdParent) {
      const children = [];
      if (!nodes) return children;
      for (const node of nodes) {
        children.push(this._renderNode(_h, node, attrIdParent));
      }
      return children;
    },
    _renderScopeSlots(_h, node) {
      const slots = [];
      for (const key of Object.keys(this.$scopedSlots)) {
        slots.push(_h('template', {
          slot: key,
        }, [ this.$scopedSlots[key]({ node }) ]));
      }
      return slots;
    },
    _needLoadChildren(node) {
      return (this.onLoadChildren && node.attrs.loadChildren && !node._loaded);
    },
    childrenLoaded(node, children) {
      this.$set(node, '_loaded', true);
      if (!node.children) node.children = [];
      const nodeChildren = node.children;
      for (const item of children) {
        // children
        if (!item.children) item.children = [];
        // checked
        if (this.treeviewRoot.attrs.multiple && node.attrs.checked) {
          item.attrs.checked = true;
        }
        // push
        nodeChildren.push(item);
      }
      // record parent
      for (const item of nodeChildren) {
        item.parent = node;
      }
      return nodeChildren;
    },
    _loadChildren(node) {
      return new Promise((resolve, reject) => {
        if (!this._needLoadChildren(node)) return resolve(node.children);
        this.onLoadChildren(node).then(data => {
          const nodeChildren = this.childrenLoaded(node, data);
          // ok
          return resolve(nodeChildren);
        }).catch(reject);
      });
    },
    _onNodeLoadChildren(e, done, node) {
      this._loadChildren(node).then(() => {
        this.$nextTick(() => {
          return done();
        });
      }).catch(done);
    },
    _onNodeClick(e, node) {
      // target
      const $target = this.$$(e.target);

      // selectable
      const selectable = node.attrs.selectable === undefined ? this.treeviewRoot.attrs.selectable : node.attrs.selectable;
      if (selectable && !$target.is('.treeview-toggle')) {
        this.selectedItem = node;
      }

      // checkbox
      if ($target.is('input') || $target.is('.icon-checkbox') || $target.is('.icon-radio')) {
        e.preventF7Router = true;
        return;
      }

      // ignore
      let ignore = false;

      // checkbox
      const checkbox = node.attrs.checkbox === undefined ? this.treeviewRoot.attrs.checkbox : node.attrs.checkbox;
      const checkOnLabel = node.attrs.checkOnLabel === undefined ? this.treeviewRoot.attrs.checkOnLabel : node.attrs.checkOnLabel;
      if (checkbox && checkOnLabel) {
        const radio = !this.treeviewRoot.attrs.multiple;
        if (radio) {
          if (!node.attrs.checked) this._onNodeChange(node, true);
        } else {
          this._onNodeChange(node, !node.attrs.checked);
        }
        ignore = true;
      }

      if (ignore) {
        e.preventF7Router = true;
        return;
      }

      // node:click
      this.$emit('node:click', e, node);

    },
    _onNodeChange(node, checked) {
      // node current
      this.$set(node.attrs, 'checked', checked);
      this.$set(node.attrs, 'indeterminate', false);
      if (!this.treeviewRoot.attrs.multiple) {
        // single
        if (checked) {
          // uncheckall
          this.treeUp(null, item => {
            if (item.id !== node.id && item.attrs.checked) {
              this.$set(item.attrs, 'checked', false);
              return false; // break
            }
          });
        }
      } else {
        // multiple
        // children to checked
        this.treeUp(node, item => {
          this.$set(item.attrs, 'checked', checked);
          this.$set(item.attrs, 'indeterminate', false);
        });
        // parent to checked/indeterminate
        this.treeParent(node, item => {
          if (!item.attrs.checkbox) return false; // break
          const every = item.children.every(_item => _item.attrs.checked);
          const some = item.children.some(_item => _item.attrs.checked || _item.attrs.indeterminate);
          if (every) {
            this.$set(item.attrs, 'checked', true);
            this.$set(item.attrs, 'indeterminate', false);
          } else if (some) {
            this.$set(item.attrs, 'checked', false);
            this.$set(item.attrs, 'indeterminate', true);
          } else {
            this.$set(item.attrs, 'checked', false);
            this.$set(item.attrs, 'indeterminate', false);
          }
        });
      }
    },

  },
};

</script>
<style scoped>
</style>
