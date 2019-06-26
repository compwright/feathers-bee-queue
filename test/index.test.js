const assert = require('assert');
const feathers = require('@feathersjs/feathers');
const errors = require('@feathersjs/errors');
const adapterTests = require('@feathersjs/adapter-tests');
const Queue = require('bee-queue');
const plugin = require('../lib');

const testSuite = adapterTests([
  '.options',
  '.events',
  '._get',
  '._find',
  '._create',
  '._update',
  '._patch',
  '._remove',
  '.get',
  '.get + $select',
  '.get + id + query',
  '.get + NotFound',
  '.get + id + query id',
  '.find',
  '.remove',
  '.remove + $select',
  '.remove + id + query',
  '.remove + multi',
  '.remove + id + query id',
  // '.update',
  // '.update + $select',
  // '.update + id + query',
  // '.update + NotFound',
  // '.update + id + query id',
  // '.patch',
  // '.patch + $select',
  // '.patch + id + query',
  // '.patch multiple',
  // '.patch multi query',
  // '.patch + NotFound',
  // '.patch + id + query id',
  '.create',
  '.create + $select',
  '.create multi',
  'internal .find',
  'internal .get',
  'internal .create',
  // 'internal .update',
  // 'internal .patch',
  'internal .remove',
  '.find + equal',
  '.find + equal multiple',
  '.find + $sort',
  '.find + $sort + string',
  '.find + $limit',
  '.find + $limit 0',
  '.find + $skip',
  '.find + $select',
  '.find + $or',
  '.find + $in',
  '.find + $nin',
  '.find + $lt',
  '.find + $lte',
  '.find + $gt',
  '.find + $gte',
  '.find + $ne',
  '.find + $gt + $lt + $sort',
  '.find + $or nested + $sort',
  '.find + paginate',
  '.find + paginate + $limit + $skip',
  '.find + paginate + $limit 0',
  '.find + paginate + params'
]);

describe('Feathers Bee-Queue Service', () => {
  const queue = new Queue('feathers-test');
  const app = feathers().use('/queue', plugin({
    queue,
    events: [ 'testing' ]
  }));
  const service = app.service('/queue');

  it('is CommonJS compatible', () =>
    assert.strictEqual(typeof require('../lib'), 'function')
  );

  it('.queue', () => {
    assert.strictEqual(service.queue, queue,
      'queue property is set to expected object'
    );
  });

  it('update is not supported', async () => {
    try {
      await service.update(1, {});
      throw new Error('Should never get here');
    } catch (error) {
      assert.ok(error instanceof errors.NotImplemented,
        'Update operations are not supported'
      );
    }
  });

  it('patch is not supported', async () => {
    try {
      await service.patch(1, {});
      throw new Error('Should never get here');
    } catch (error) {
      assert.ok(error instanceof errors.NotImplemented,
        'Patch operations are not supported'
      );
    }
  });

  testSuite(app, errors, '/queue');

  after(() => queue.destroy());
});
