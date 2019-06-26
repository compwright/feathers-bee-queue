const JobService = require('./JobService');

module.exports = (options = {}) => {
  if (!options.queue) {
    throw new Error('Missing queue parameter');
  }

  const { queue } = options;
  const service = new JobService(options);

  // Subscribe the service to the Queue PubSub events
  queue.on('job succeeded',
    (id, result) => service.emit('succeeded', { id, result })
  );
  queue.on('job retrying',
    (id, error) => service.emit('retrying', { id, error })
  );
  queue.on('job failed',
    (id, error) => service.emit('failed', { id, error })
  );
  queue.on('job progress',
    (id, progress) => service.emit('progress', { id, progress })
  );

  return service;
};
