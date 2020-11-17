export default {
  data() {
    return {
      base: {
        ready: false,
        configFlowBase: null,
        config: null,
        //
        data: null,
        notfound: false,
      },
    };
  },
  computed: {
    base_ready() {
      return this.base.ready && this.base.data;
    },
    base_user() {
      return this.$store.state.auth.user.op;
    },
  },
  created() {
  },
  mounted() {
    this.$meta.eventHub.$on('comment:action', this.base_onCommentChanged);
    this.$meta.eventHub.$on('attachment:action', this.base_onAttachmentChanged);
  },
  beforeDestroy() {
    this.$meta.eventHub.$off('comment:action', this.base_onCommentChanged);
    this.$meta.eventHub.$off('attachment:action', this.base_onAttachmentChanged);
  },
  methods: {
    async base_loadData() {
      try {
        // flow data
        this.base.data = await this.$api.post('/a/flowtask/flow/data', {
          flowId: this.container.flowId,
        });
        return true;
      } catch (err) {
        this.base.notfound = true;
        return false;
      }
    },
    base_getCurrentStage() {
      if (!this.base.item) return null;
      const stage = this.base.item.atomStage;
      return stage === 0 ? 'draft' : stage === 1 ? 'archive' : 'history';
    },
    base_onCommentChanged(data) {
      if (!this.base.item || data.atomId !== this.container.atomId) return;
      if (data.action === 'create') this.base.item.commentCount += 1;
      if (data.action === 'delete') this.base.item.commentCount -= 1;
    },
    base_onAttachmentChanged(data) {
      if (!this.base.item || data.atomId !== this.container.atomId) return;
      if (data.action === 'create') this.base.item.attachmentCount += 1;
      if (data.action === 'delete') this.base.item.attachmentCount -= 1;
    },
    base_flowStatusRender() {
      if (!this.base_ready) return null;
      const flow = this.base.data.flow;
      const children = [];
      // flowStatus
      if (flow.flowStatus === 1) {
        const endText = `${this.$text(flow.flowRemark || 'End')}`;
        children.push(
          <f7-badge class="eb-flowstatus" key="flowStatus" color="teal">{endText}</f7-badge>
        );
      } else {
        const currentText = `${this.$text('Current')}: ${this.$text(flow.flowNodeNameCurrent)}`;
        children.push(
          <f7-badge class="eb-flowstatus" key="flowStatus" color="orange">{currentText}</f7-badge>
        );
      }
      //
      return children;
    },
  },
};
