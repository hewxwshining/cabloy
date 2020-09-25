const { app, mockUrl, mockInfo, assert } = require('egg-born-mock')(__dirname);

describe.only('flow.set00', () => {
  it('simple', async () => {
    app.mockSession({});

    // create
    const result = await app.httpRequest().post(mockUrl('flow/start')).send({
      flowDefKey: {
        module: mockInfo().relativeName,
        name: 'set00_simple',
      },
      flowVars: {
        a: 1, b: 2,
      },
    });
    assert(result.body.code === 0);

  });
});