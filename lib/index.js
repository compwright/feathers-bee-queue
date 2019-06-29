const JobService = require('./JobService');

module.exports = (options = {}) => {
  if (!options.queue) {
    throw new Error('Missing queue parameter');
  }
  return new JobService(options);
};
