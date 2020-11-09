const { app, mockUrl, mockInfo, assert } = require('egg-born-mock')(__dirname);

describe.only('flow.set01_atomUserTask', () => {
  it('atomUserTask', async () => {
    app.mockSession({});

    // atomClass info
    const atomClassModule = mockInfo().relativeName;
    const atomClassName = 'purchaseOrder';

    // login as root
    await app.httpRequest().post(mockUrl('/a/authsimple/passport/a-authsimple/authsimple')).send({
      data: {
        auth: 'root',
        password: '123456',
      },
    });

    // create
    let result = await app.httpRequest().post(mockUrl('/a/base/atom/create')).send({
      atomClass: { module: atomClassModule, atomClassName, atomClassIdParent: 0 },
    });
    assert(result.body.code === 0);
    const keyDraft = result.body.data;

    // submit
    result = await app.httpRequest().post(mockUrl('/a/base/atom/writeSubmit')).send({
      key: keyDraft,
      item: {
        atomName: 'startEventAtom-test',
        flowDefKey: 'set01_atomUserTask',
      },
    });
    assert(result.body.code === 0);
    const flowId = result.body.data.flow.id;

    // select nothing of achive
    result = await app.httpRequest().post(mockUrl('/a/base/atom/select')).send({
      atomClass: { module: atomClassModule, atomClassName, atomClassIdParent: 0 },
      options: {
        where: {
          atomFlowId: flowId,
        },
        stage: 'archive',
      },
    });
    assert(result.body.code === 0);
    const archive = result.body.data.list[0];
    // not found
    assert(!archive);

    // select task
    result = await app.httpRequest().post(mockUrl('/a/flownode/task/select')).send({
      options: {
        where: {
          flowId,
          flowTaskStatus: 0,
        },
        history: 0,
      },
    });
    assert(result.body.code === 0);
    const flowTask = result.body.data.list[0];
    assert(!!flowTask);

    // claim


    // const keyArchive = { atomId: archive.atomId };

    // // delete
    // result = await app.httpRequest().post(mockUrl('/a/base/atom/delete')).send({
    //   key: keyArchive,
    // });
    // assert(result.body.code === 0);
  });
});