module.exports = function(loader) {

  // use modulesArray
  const ebModulesArray = loader.app.meta.modulesArray;

  // all middlewares
  const ebMiddlewaresAll = loader.app.meta.middlewares = [];
  const ebMiddlewares = {};

  // load middlewares all
  loadMiddlewaresAll(ebMiddlewaresAll, ebModulesArray, loader);

  // load middlewares
  const ebMiddlewaresGlobal = loadMiddlewares(ebMiddlewares, ebMiddlewaresAll);

  return [ ebMiddlewares, ebMiddlewaresGlobal ];
};

function loadMiddlewares(ebMiddlewares, ebMiddlewaresAll) {
  const globals = [];

  // load
  for (const item of ebMiddlewaresAll) {
    // ignore other types, such as: socketio.connection/socketio.packet
    if (!item.options.type) {
      ebMiddlewares[item.name] = item;
      if (item.options.global) globals.push(item.name);
    }
  }

  // global order
  // eslint-disable-next-line
  while (true) {
    if (!swap(ebMiddlewares, globals)) break;
  }

  return globals;
}

function loadMiddlewaresAll(ebMiddlewaresAll, ebModulesArray, loader) {
  for (const module of ebModulesArray) {
    const config = loader.app.meta.configs[module.info.relativeName];
    if (!config.middlewares) continue;
    for (const middlewareKey in config.middlewares) {
      const middlewareConfig = config.middlewares[middlewareKey];
      // bean
      const beanName = middlewareConfig.bean;
      if (!beanName) throw new Error(`bean not set for middleware: ${module.info.relativeName}.${middlewareKey}`);
      let bean;
      if (typeof beanName === 'string') {
        bean = {
          module: module.info.relativeName,
          name: beanName,
        };
      } else {
        bean = {
          module: beanName.module || module.info.relativeName,
          name: beanName.name,
        };
      }
      // push
      ebMiddlewaresAll.push({
        module: module.info.relativeName,
        name: middlewareKey,
        options: middlewareConfig,
        bean,
      });
    }
  }
}

function swap(ebMiddlewares, globals) {
  let result = false;
  const globalsClone = globals.slice(0);
  globalsClone.forEach(key => {
    const item = ebMiddlewares[key];
    let deps = item.options.dependencies || [];
    if (typeof deps === 'string') deps = deps.split(',');
    deps.forEach(dep => {
      if (swapDep(globals, dep, key)) result = true;
    });
  });
  return result;
}

function swapDep(arr, a, b) {
  const indexA = arr.indexOf(a);
  const indexB = arr.indexOf(b);
  if (indexA === -1 || indexB === -1 || indexA < indexB) return false;
  arr.splice(indexB, 0, arr.splice(indexA, 1)[0]);
  return true;
}
