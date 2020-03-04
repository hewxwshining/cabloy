<script>
import SidebarTabs from './sidebarTabs.vue';
import SidebarGroup from './SidebarGroup.vue';
import SidebarToolbar from './SidebarToolbar.vue';

export default {
  components: {
    ebSidebarTabs: SidebarTabs,
    ebSidebarGroup: SidebarGroup,
    ebSidebarToolbar: SidebarToolbar,
  },
  render(c) {
    const children = [];
    // tabs
    const tabs = c('eb-sidebar-tabs', {
      props: {
        side: this.side,
      },
    });
    children.push(tabs);
    // toolbar
    const toolbar = c('eb-sidebar-toolbar', {
      props: {
        side: this.side,
      },
    });
    // panel
    const group = c('eb-sidebar-group', {
      ref: 'sidebarGroup',
      props: {
        side: this.side,
      },
      style: {
        height: `${this.layout.size.height - this.layout.size.top - this.options.toolbarHeight}px`,
        top: `${this.options.toolbarHeight}px`,
      },
    });
    const viewSizeExtent = this.viewSizeExtent;
    const panel = c('f7-panel', {
      staticClass: this.options.opened ? 'panel-show' : 'panel-hide',
      style: {
        width: `${viewSizeExtent.width}px`,
      },
      props: {
        side: this.side,
        visibleBreakpoint: 0,
        effect: 'cover',
        resizable: true,
      },
      on: {
        'panel:resize': this.onPanelResize,
      },
    }, [toolbar, group]);
    children.push(panel);
    // ok
    return c('div', { staticClass: `eb-layout-sidebar eb-layout-sidebar-${this.side}` }, children);
  },
  props: {
    side: {
      type: String,
    },
    options: {
      type: Object,
    }
  },
  data() {
    return {}
  },
  computed: {
    layout() {
      return this.$parent;
    },
    viewSize() {
      let size;
      const width = this.options.panelWidth;
      if (width <= this.$config.layout.size.small * 2) {
        size = 'small';
      } else if (width > this.$config.layout.size.small * 3) {
        size = 'large';
      } else {
        size = 'medium';
      }
      return size;
    },
    viewSizeExtent() {
      const layout = this.layout;
      return {
        width: this.options.panelWidth,
        height: layout.size.height - layout.size.top - this.options.toolbarHeight,
      };
    }
  },
  mounted() {},
  methods: {
    createView({ ctx, panel }) {
      // panelName
      const panelName = this.layout._panelFullName(panel);
      // find by name
      const view = this.options.views.find(item => this.layout._panelFullName(item.panel) === panelName);
      if (view) {
        const $view = this.$$(`#${view.id}`);
        // navigate
        if (panel.url && panel.url !== view.panel.url) {
          $view[0].f7View.router.navigate(panel.url, { reloadAll: true });
        }
        // change zIndex
        view.zIndex = ++this.$refs.sidebarGroup.viewIndex;
        // active
        this._activeView(panel);
        return;
      }
      // new view
      let options = {};
      return this.$refs.sidebarGroup.createView({ ctx, panel }).then(res => {
        if (res) {
          if (res.options) options = this.$utils.extend({}, options, res.options);
          res.view.f7View.router.navigate(panel.url, options);
          // active
          this._activeView(panel);
        }
      });
    },
    closeView(view) {
      // view
      const $view = this.$$(view.$el);
      const viewIndex = parseInt($view.data('index'));
      const _view = this.options.views[viewIndex];
      // top view
      const _viewTop = this._getTopView(_view);
      if (_viewTop) {
        this._activeView(_viewTop.panel);
      }
      // close
      $view.addClass('eb-transition-close').animationEnd(() => {
        // remove
        this.options.views.splice(viewIndex, 1);
        if (this.options.views.length === 0) {
          this.setOpened(false);
        }
        // remove panel
        const panelIndex = this.options.panels.findIndex(item => this.layout._panelFullName(item) === this.layout._panelFullName(_view.panel));
        this.options.panels.splice(panelIndex, 1);
        if (this.options.panels.length === 0) {
          this.layout.onResize();
        }
      });
    },
    setOpened(opened) {
      if (this.options.opened === opened) return;
      this.options.opened = opened;
      if (!this.options.cover) {
        this.layout.onResize();
      }
    },
    setPanelWidth(newPanelWidth) {
      const width = parseInt(newPanelWidth);
      if (this.options.panelWidth === width) return;
      this.options.panelWidth = width;
      if (!this.options.cover) {
        this._onPanelResizeDelay();
      }
    },
    onPanelResize(panel, newPanelWidth) {
      this.setPanelWidth(newPanelWidth);
    },
    _onPanelResizeDelay: Vue.prototype.$meta.util.debounce(function() {
      this.layout.onResize();
    }, 300),
    _getTopView(skip) {
      if (this.options.views.length === 0) return null;
      return this.options.views.reduce((prev, current) => {
        if (skip && current.id === skip.id) return prev;
        if (!prev) return current;
        return prev.zIndex > current.zIndex ? prev : current;
      }, null);
    },
    _activeView(panel) {
      // tab active
      this.options.panelActive = this.layout._panelFullName(panel);
      // opened
      this.setOpened(true);
    },
  }
}

</script>