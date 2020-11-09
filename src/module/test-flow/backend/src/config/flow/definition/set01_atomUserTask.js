const Listener = require('./listener/set01_atomUserTask.spec.js');

module.exports = app => {
  const moduleInfo = app.meta.mockUtil.parseInfoFromPackage(__dirname);
  const definition = {
    info: {
      title: 'Test_Set01_Atom_UserTask',
      description: 'Test_Set01_Atom_UserTask',
      version: '2020-11-06 00:00:00',
    },
    listener: Listener.toString(),
    process: {
      nodes: [
        {
          id: 'startEvent_1',
          name: 'Start',
          type: 'startEventAtom',
          options: {
            atom: {
              module: moduleInfo.relativeName,
              atomClassName: 'purchaseOrder',
            },
            conditionExpression: 'atom.flowDefKey===\'set01_atomUserTask\'',
          },
        },
        {
          id: 'activity_1',
          name: 'ActivityUserTask',
          type: 'activityUserTask',
          options: {
            assignees: {
              // users: '1,2',
              // roles: '1,2',
              vars: 'flowUser,',
            },
            confirmation: false,
            bidding: false,
            completionCondition: {
              // passed: 1,
              // rejected: '100%',
            },
            // rejectedNode:'startEvent_1',
          },
        },
        {
          id: 'endEvent_1',
          name: 'End',
          type: 'endEventNone',
        },
      ],
      edges: [
        {
          id: 'edge_1',
          source: 'startEvent_1',
          target: 'activity_1',
        },
        {
          id: 'edge_2',
          source: 'activity_1',
          target: 'endEvent_1',
        },
      ],
    },
  };
  return definition;
};