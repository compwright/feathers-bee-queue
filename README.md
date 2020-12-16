# feathers-bee-queue

[![Build Status](https://travis-ci.org/compwright/feathers-bee-queue.png?branch=master)](https://travis-ci.org/compwright/feathers-bee-queue)
[![Code Climate](https://codeclimate.com/github/compwright/feathers-bee-queue/badges/gpa.svg)](https://codeclimate.com/github/compwright/feathers-bee-queue)
[![Test Coverage](https://codeclimate.com/github/compwright/feathers-bee-queue/badges/coverage.svg)](https://codeclimate.com/github/compwright/feathers-bee-queue/coverage)
[![Dependency Status](https://img.shields.io/david/compwright/feathers-bee-queue.svg?style=flat-square)](https://david-dm.org/compwright/feathers-bee-queue)
[![Download Status](https://img.shields.io/npm/dm/feathers-bee-queue.svg?style=flat-square)](https://www.npmjs.com/package/feathers-bee-queue)
[![Sponsor on GitHub](https://img.shields.io/static/v1?label=Sponsor&message=❤&logo=GitHub&link=https://github.com/sponsors/compwright)](https://github.com/sponsors/compwright)

A [Feathers](https://feathersjs.com) service adapter for [Bee-Queue](https://www.npmjs.com/package/bee-queue) jobs.

## Installation

```
npm install --save feathers-bee-queue bee-queue
```

## Documentation

### `service([options])`

Returns a new service instance initialized with the given options.

> __Important:__ `feathers-bee-queue` implements the [Feathers Common database adapter API](https://docs.feathersjs.com/api/databases/common.html) and [querying syntax](https://docs.feathersjs.com/api/databases/querying.html).

```js
const queueService = require('feathers-bee-queue');
app.use('/jobs', queueService({ queue, events, paginate, multi }));
```

__Options:__

- `queue` - A Bee-Queue queue instance
- `events` (*optional*) - A list of [custom service events](https://docs.feathersjs.com/api/events.html#custom-events) sent by this service. Must be one or more of the following:
  - `succeeded`
  - `retrying`
  - `failed`
  - `progress`
- `paginate` (*optional*) - A [pagination object](https://docs.feathersjs.com/api/databases/common.html#pagination) containing a `default` and `max` page size
- `multi` (*optional*) - Allow `create` with arrays and `remove` with `id` `null` to change multiple items. Can be `true` for all methods or an array of allowed methods (e.g. `[ 'remove', 'create' ]`)


## Complete Example

Here's an example of a Feathers server that uses `feathers-bee-queue`. 

```js
const feathers = require('@feathersjs/feathers');
const queueService = require('feathers-bee-queue');
const Queue = require('bee-queue');

// Initialize the application
const app = feathers();

// Initialize the plugin
app.use('/my-queue', queueService({
  queue: new Queue('my-queue')
}));
```

## License

Copyright (c) 2018

Licensed under the [MIT license](LICENSE).
