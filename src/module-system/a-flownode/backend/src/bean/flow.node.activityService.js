module.exports = ctx => {
  class FlowNode extends ctx.app.meta.FlowNodeBase {
    constructor(options) {
      super(ctx, options);
    }

    async onNodeDoing() {
      // super
      await super.onNodeDoing();
      // bean/parameters
      const bean = this.contextNode._nodeRef.options.bean;
      const parametersExpression = this.contextNode._nodeRef.options.parametersExpression;
      await this.flowInstance._executeActivityService({
        bean,
        parametersExpression,
        globals: {
          contextNode: this.contextNode,
        },
      });
      // ok
      return true;
    }
  }

  return FlowNode;
};
