module.exports = app => {

  class Event extends app.Service {

    // register all events
    async registerAllEvents() {
      for (const module of this.app.meta.modulesArray) {
        if (module.main.meta && module.main.meta.event && module.main.meta.event.implementations) {
          this._registerEvents(module, module.main.meta.event.implementations);
        }
      }
    }

    async _registerEvents(module, implementations) {
      const events = this.app.meta.geto('events');
      for (const key in implementations) {
        // bean
        const implementationName = implementations[key];
        let beanFullName;
        if (typeof implementationName === 'string') {
          beanFullName = `${module.info.relativeName}.event.${implementationName}`;
        } else {
          beanFullName = `${implementationName.module || module.info.relativeName}.event.${implementationName.name}`;
        }
        events.geta(key).push(beanFullName);
      }
    }

  }

  return Event;
};
