const _app = require('../../server'); const app = _app.default || _app;
describe('App export', () => {
  it('should be a function', () => {
    console.log('typeof app:', typeof app);
    console.log('app keys:', Object.keys(app || {}));
    if (typeof app !== 'function') {
      console.log('app object:', app);
    }
    expect(typeof app).toBe('function');
  });
});
