module.exports = app => {
  const moduleInfo = app.meta.mockUtil.parseInfoFromPackage(__dirname);
  const resources = [
    // panels
    {
      atomName: 'Menu',
      atomStaticKey: 'panelMenu',
      atomRevision: 0,
      atomCategoryId: 'a-layoutpc:panel.General',
      resourceType: 'a-layoutpc:panel',
      resourceConfig: JSON.stringify({
        url: '/a/basefront/resource/tree',
      }),
      resourceRoles: 'root',
    },
    {
      atomName: 'Atom',
      atomStaticKey: 'panelAtom',
      atomRevision: 0,
      atomCategoryId: 'a-layoutpc:panel.General',
      resourceType: 'a-layoutpc:panel',
      resourceConfig: JSON.stringify({
        url: '/a/basefront/atom/list',
      }),
      resourceRoles: 'root',
    },
    {
      atomName: 'Search',
      atomStaticKey: 'panelSearch',
      atomRevision: 0,
      atomCategoryId: 'a-layoutpc:panel.General',
      resourceType: 'a-layoutpc:panel',
      resourceConfig: JSON.stringify({
        url: '/a/basefront/atom/searchQuick',
      }),
      resourceRoles: 'root',
    },
    {
      atomName: 'Mine',
      atomStaticKey: 'panelMine',
      atomRevision: 0,
      atomCategoryId: 'a-layoutpc:panel.General',
      resourceType: 'a-layoutpc:panel',
      resourceConfig: JSON.stringify({
        url: '/a/user/user/mine',
      }),
      resourceRoles: 'root',
    },
    // buttons
    {
      atomName: 'Home',
      atomStaticKey: 'buttonHome',
      atomRevision: 0,
      atomCategoryId: 'a-layoutpc:button.General',
      resourceType: 'a-layoutpc:button',
      resourceConfig: JSON.stringify({
        module: moduleInfo.relativeName,
        component: 'buttonLink',
        icon: { material: 'home' },
        actionPath: '/a/dashboard/dashboard?key=home',
        scene: 'dashboard',
        sceneOptions: { name: 'home' },
      }),
      resourceRoles: 'root',
    },
    {
      atomName: 'Dashboard',
      atomStaticKey: 'buttonDashboard',
      atomRevision: 0,
      atomCategoryId: 'a-layoutpc:button.General',
      resourceType: 'a-layoutpc:button',
      resourceConfig: JSON.stringify({
        module: moduleInfo.relativeName,
        component: 'buttonLink',
        icon: { material: 'dashboard' },
        actionPath: '/a/dashboard/dashboard',
        scene: 'dashboard',
        sceneOptions: { name: 'dashboard' },
      }),
      resourceRoles: 'root',
    },
    {
      atomName: 'Fullscreen',
      atomStaticKey: 'buttonFullscreen',
      atomRevision: 0,
      atomCategoryId: 'a-layoutpc:button.General',
      resourceType: 'a-layoutpc:button',
      resourceConfig: JSON.stringify({
        module: moduleInfo.relativeName,
        component: 'buttonFullscreen',
      }),
      resourceRoles: 'root',
    },
    {
      atomName: 'Mine',
      atomStaticKey: 'buttonMine',
      atomRevision: 0,
      atomCategoryId: 'a-layoutpc:button.General',
      resourceType: 'a-layoutpc:button',
      resourceConfig: JSON.stringify({
        module: moduleInfo.relativeName,
        component: 'buttonMine',
        icon: { material: 'person' },
        actionPath: null,
        scene: 'sidebar', sceneOptions: { side: 'right', module: 'a-layoutpc', name: 'panelMine' },
        showSeparator: true,
      }),
      resourceRoles: 'root',
    },
    {
      atomName: 'Clock',
      atomStaticKey: 'buttonClock',
      atomRevision: 0,
      atomCategoryId: 'a-layoutpc:button.General',
      resourceType: 'a-layoutpc:button',
      resourceConfig: JSON.stringify({
        module: moduleInfo.relativeName,
        component: 'buttonClock',
        actionPath: '/a/layoutpc/button/clock/preferences',
        scene: 'sidebar',
        sceneOptions: { side: 'right', name: 'preferences', title: 'Preferences' },
      }),
      resourceRoles: 'root',
    },
    {
      atomName: 'Copyright',
      atomStaticKey: 'buttonCopyright',
      atomRevision: 0,
      atomCategoryId: 'a-layoutpc:button.General',
      resourceType: 'a-layoutpc:button',
      resourceConfig: JSON.stringify({
        module: moduleInfo.relativeName,
        component: 'buttonLink',
        icon: null,
        actionPath: '/a/basefront/base/about',
        scene: 'sidebar',
        sceneOptions: { side: 'right', name: 'about', title: 'About' },
        showLabel: true,
      }),
      resourceRoles: 'root',
    },


  ];
  return resources;
};
