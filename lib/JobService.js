const assignIn = require('lodash.assignin');
const { sorter, AdapterService } = require('@feathersjs/adapter-commons');
const errors = require('@feathersjs/errors');
const sift = require('sift').default;

const { configureJob, transformError, transformJob } = require('./utils');

class JobService extends AdapterService {
  constructor (options = {}) {
    super(assignIn({
      id: 'id',
      matcher: sift,
      sorter,
      paginate: {
        max: 25
      }
    }, options));
  }

  get queue () {
    return this.options.queue;
  }

  async _find (params = {}) {
    const { query, filters, paginate } = this.filterQuery(params);

    const page = {}; const status = params.status || 'waiting';
    switch (status) {
      case 'waiting':
      case 'active':
      case 'delayed':
        page.start = 0;
        page.end = this.options.paginate.max;
        break;

      case 'failed':
      case 'succeeded':
        page.size = this.options.paginate.max;
        break;

      default:
        throw new errors.BadRequest('status is missing or invalid');
    }

    let jobs = [];
    try {
      jobs = await this.queue.getJobs(status, page);
    } catch (e) {
      throw transformError(e);
    }

    const result = {
      total: jobs.length,
      limit: filters.$limit,
      skip: filters.$skip || 0,
      data: jobs.map(job => transformJob(job, params, this.id))
        .filter(this.options.matcher(query))
    };

    if (filters.$sort !== undefined) {
      result.data = result.data.sort(this.options.sorter(filters.$sort));
    }

    if (filters.$skip !== undefined) {
      result.data = result.data.slice(filters.$skip);
    }

    if (filters.$limit !== undefined) {
      result.data = result.data.slice(0, filters.$limit);
    }

    return paginate && paginate.default
      ? result
      : result.data;
  }

  async _get (id, params = {}) {
    const { query } = this.filterQuery(params);

    try {
      const job = await this.queue.getJob(id);
      if (!job) {
        throw new errors.NotFound();
      }

      const value = transformJob(job, params, this.id);
      if (this.options.matcher(query)(value)) {
        return value;
      } else {
        throw new errors.NotFound();
      }
    } catch (e) {
      throw transformError(e);
    }
  }

  async _create (data, params = {}) {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this._create(current, params)));
    }

    try {
      const job = this.queue.createJob(data);
      configureJob(job, params);
      await job.save();
      return transformJob(job, params, this.id);
    } catch (e) {
      throw transformError(e);
    }
  }

  _update (id, data, params = {}) {
    throw new errors.NotImplemented('Update operations are not supported');
  }

  _patch (id, data, params = {}) {
    throw new errors.NotImplemented('Patch operations are not supported');
  }

  async _remove (id, params = {}) {
    if (id === null) {
      const { query } = this.filterQuery(params);
      const jobs = await this._find({
        ...params,
        paginate: false,
        query
      });

      return Promise.all(jobs.map(
        current => this._remove(current[this.id], params))
      );
    }

    try {
      const job = await this._get(id, params);
      await this.queue.removeJob(id);
      return job;
    } catch (e) {
      throw transformError(e);
    }
  }
}

module.exports = JobService;
