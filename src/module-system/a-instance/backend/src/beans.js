const versionManager = require('./bean/version.manager.js');
const beanInstance = require('./bean/bean.instance.js');
const broadcastResetCache = require('./bean/broadcast.resetCache.js');
const middlewareAppReady = require('./bean/middleware.appReady.js');
const middlewareInstance = require('./bean/middleware.instance.js');
const queueInstanceStartup = require('./bean/queue.instanceStartup.js');
const queueRegisterInstance = require('./bean/queue.registerInstance.js');

module.exports = app => {
  const beans = {
    // version
    'version.manager': {
      mode: 'app',
      bean: versionManager,
    },
    // broadcast
    'broadcast.resetCache': {
      mode: 'app',
      bean: broadcastResetCache,
    },
    // middleware
    'middleware.appReady': {
      mode: 'ctx',
      bean: middlewareAppReady,
    },
    'middleware.instance': {
      mode: 'ctx',
      bean: middlewareInstance,
    },
    // queue
    'queue.instanceStartup': {
      mode: 'app',
      bean: queueInstanceStartup,
    },
    'queue.registerInstance': {
      mode: 'app',
      bean: queueRegisterInstance,
    },
    // global
    instance: {
      mode: 'ctx',
      bean: beanInstance,
      global: true,
    },
  };
  return beans;
};
