module.exports = ctx => {
  const moduleInfo = ctx.app.meta.mockUtil.parseInfoFromPackage(__dirname);
  class FlowNode extends ctx.app.meta.FlowNodeBase {
    constructor(options) {
      super(ctx, options);
    }

    get modelCondition() {
      return ctx.model.module(moduleInfo.relativeName).flowNodeStartEventAtomCondition;
    }

    async deploy({ deploy, flowDefId, node }) {
      if (deploy) {
        await this._addCondition({ flowDefId, node });
      } else {
        // donot delete condition
      }
    }

    async _addCondition({ flowDefId, node }) {
      const atom = node.options && node.options.atom;
      if (!atom) throw new Error(`atom not set for startEventAtom: ${flowDefId}.${node.id}`);
      // atomClass
      const atomClass = await ctx.bean.atomClass.get({
        module: atom.module,
        atomClassName: atom.atomClassName,
        atomClassIdParent: atom.atomClassIdParent || 0,
      });
      const conditionExpression = node.options.conditionExpression;
      // get condition
      const startEventId = node.id;
      const _condition = await this.modelCondition.get({
        flowDefId, startEventId,
      });
      if (_condition) {
        // update
        _condition.atomClassId = atomClass.id;
        _condition.conditionExpression = conditionExpression;
        await this.modelCondition.update(_condition);
      } else {
        // insert
        await this.modelCondition.insert({
          flowDefId, startEventId,
          atomClassId: atomClass.id, conditionExpression,
        });
      }
    }

    async _match({ atom, user }) {
      // order by dynamic/conditionExpression
      const list = await ctx.model.query(`
          select a.* from aFlowNodeStartEventAtomCondition a
            left join aFlowDef b on a.flowDefId=b.id
            where a.iid=? and a.atomClassId=?
            order by b.dynamic desc, a.conditionExpression desc
        `, [ ctx.instance.id, atom.atomClassId ]);
      for (const _condition of list) {
        const res = await this._matchCondition({ _condition, atom, user });
        if (res) return true;
      }
      return false;
    }

    async _matchCondition(context) {
      const { _condition, atom, user } = context;
      // check if valid
      if (!(await this._checkConditionValid(context))) {
        await this._deleteCondition(context);
        return false;
      }
      // match conditionExpression
      const conditionActive = _condition.conditionExpression;
      if (conditionActive) {
        const res = ctx.bean.flow.evaluateExpression({
          expression: conditionActive,
          globals: { atom },
        });
        if (!res) return false;
      }
      // start
      await ctx.bean.flow.startById({
        flowDefId: _condition.flowDefId,
        startEventId: _condition.startEventId,
        flowUserId: user.id,
        flowAtomId: atom.id,
      });
      // ok
      return true;
    }

    async _checkConditionValid(context) {
      const { _condition } = context;
      // flowDef
      const flowDef = await ctx.bean.flowDef.getById({ flowDefId: _condition.flowDefId });
      if (!flowDef) return false;
      // disabled
      if (flowDef.disabled) return false;
      // content
      const content = flowDef.content ? JSON.parse(flowDef.content) : null;
      if (!content) return false;
      const nodeConfig = content.process.nodes.find(item => item.id === _condition.startEventId);
      if (!nodeConfig) return false;
      // check if changed
      const conditionActive = _condition.conditionExpression;
      const conditionConfig = nodeConfig.options && nodeConfig.options.conditionExpression;
      if (conditionActive !== conditionConfig) return false;
      // ok
      return true;
    }

    async _deleteCondition(context) {
      const { _condition } = context;
      await this.modelCondition.delete({ id: _condition.id });
    }

  }

  return FlowNode;
};
