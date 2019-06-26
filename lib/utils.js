const errors = require('@feathersjs/errors');
const { select } = require('@feathersjs/adapter-commons');

function transformError (e) {
  switch (e.message) {
    case 'closed':
      return new errors.Unavailable('Queue closed');
    default:
      return e;
  }
}

function transformJob (job, params, idProp = 'id') {
  return select(params, idProp)({
    ...job.data,
    [idProp]: job.id,
    status: job.status,
    progress: job.progress
  });
}

function configureJob (job, config = {}) {
  let updated = false;

  if (config.id !== undefined) {
    job.setId(config.id);
    updated = true;
  }

  if (config.retries !== undefined) {
    job.retries(config.retries);
    updated = true;
  }

  if (config.backoff !== undefined) {
    const { strategy, delayFactor } = config.backoff;
    job.backoff(strategy, delayFactor);
    updated = true;
  }

  if (config.delayUntil !== undefined) {
    job.delayUntil(config.delayUntil);
    updated = true;
  }

  if (config.timeout !== undefined) {
    job.timeout(config.timeout);
    updated = true;
  }

  return updated;
}

module.exports = {
  transformError,
  transformJob,
  configureJob
};
