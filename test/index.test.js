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

  describe('pubsub events', () => {
    describe('when enabled', () => {
      let app, queue, service;

      beforeEach(() => {
        app = feathers();
        queue = new Queue('pubsub');
        service = app.use('/pubsub', plugin({
          queue,
          events: [ 'progress' ]
        })).service('/pubsub');
        service.setup(app, '/pubsub');
      });

      afterEach(() => queue.destroy());

      it('emits progress event', done => {
        service.create({})
          .then(job => queue.getJob(job.id))
          .then(job => {
            service.on('progress', event => {
              assert.strictEqual(event.id, job.id);
              assert.strictEqual(event.progress, 50);
              done();
            });
            job.reportProgress(50);
          })
          .catch(done);
      });
    });

    describe('when disabled', () => {
      let app, queue, service;

      beforeEach(() => {
        app = feathers();
        queue = new Queue('pubsub2');
        service = app.use('/pubsub2', plugin({
          queue,
          events: []
        })).service('/pubsub2');
        service.setup(app, '/pubsub2');
      });

      afterEach(() => queue.destroy());

      it('does not emit progress event', done => {
        service.create({})
          .then(job => queue.getJob(job.id))
          .then(job => {
            service.on('progress', () => {
              done(new Error('It should not emit an event'));
            });
            job.reportProgress(50);
            assert.ok(true);
            done();
          })
          .catch(done);
      });
    });
  });

  describe('find', () => {
    it('validates the query status', async () => {
      try {
        await service.find({ query: { status: 'asdf' } });
        throw new Error('Should never get here');
      } catch (error) {
        assert.ok(error instanceof errors.BadRequest,
          'status is missing or invalid'
        );
      }
    });
  });

  describe('update', () => {
    it('not supported', async () => {
      try {
        await service.update(1, {});
        throw new Error('Should never get here');
      } catch (error) {
        assert.ok(error instanceof errors.NotImplemented,
          'Update operations are not supported'
        );
      }
    });
  });

  describe('patch', () => {
    it('not supported', async () => {
      try {
        await service.patch(1, {});
        throw new Error('Should never get here');
      } catch (error) {
        assert.ok(error instanceof errors.NotImplemented,
          'Patch operations are not supported'
        );
      }
    });
  });

  testSuite(app, errors, '/queue');

  after(() => queue.destroy());
});
