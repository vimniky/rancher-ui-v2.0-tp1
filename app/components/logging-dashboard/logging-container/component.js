import Ember from 'ember';

// elasticsearch don't suported time units: d, h, m, s, ms, micros, nanos.
// weeky/w, month/M, and year/Y are not suported.
// more: https://www.elastic.co/guide/en/elasticsearch/reference/current/common-options.html#time-units
const INTERVALS = [
  {unit: 'second', label: 'second', values: [1, 5, 10, 15, 30], valueIdx: 0, id: 's'},
  {unit: 'minute', label: 'minute', values: [1, 3, 5, 10, 15, 30], valueIdx: 0, id: 'm'},
  {unit: 'hour', label: 'hourly', values: [1, 3, 5, 10], valueIdx: 0, id: 'h'},
  {unit: 'day', label: 'daily', values: [1, 3, 7, 14], valueIdx: 0, id: 'd'},
  {unit: 'week', label: 'weekly', values: [1, 3, 5, 10].map(v => v * 7), valueIdx: 0, id: 'd'},
  {unit: 'month', label: 'monthly', values: [1, 3, 5].map(v => v * 30), valueIdx: 0, id: 'd'},
].map(item => Ember.Object.create(item));

const QUICKTIMES = [
  {
    label: 'Last 5 minutes',
    value: 5,
    unit: 'm',
  },
  {
    label: 'Last 15 minutes',
    value: 15,
    unit: 'm',
  },
  {
    label: 'Last 30 minutes',
    value: 30,
    unit: 'm',
  },
  {
    label: 'Last 1 hour',
    value: 1,
    unit: 'H',
  },
  {
    label: 'Last 3 hours',
    value: 3,
    unit: 'H',
  },
  {
    label: 'Last 12 hours',
    value: 12,
    unit: 'H',
  },
  {
    label: 'Today',
    value: 24,
    unit: 'H',
  },
  {
    label: 'Last 3 day',
    value: 72,
    unit: 'H',
  },
  {
    label: 'This week',
    value: 1,
    unit: 'w',
  },
  {
    label: 'This month',
    value: 1,
    unit: 'M',
  },
  {
    label: 'Last 3 months',
    value: 3,
    unit: 'M',
  },
  {
    label: 'Last 6 months',
    value: 6,
    unit: 'M',
  },
  {
    label: 'This year',
    value: 1,
    unit: 'y',
  },
  {
    label: 'Last 3 years',
    value: 3,
    unit: 'y',
  },
].map((item, idx) => {
  // must be string
  item.idx = '' + idx;
  return item;
}).map(item => Ember.Object.create(item));
export default Ember.Component.extend({
  logs: null,

  intervals: null,
  intervalId: localStorage.getItem('intervalId') || 's',
  quickTime: null,
  quickTimeIdx: localStorage.getItem('quickTimeIdx') || '1',
  intervalScaleTips: null,

  setLastIntervalId: function() {
    localStorage.setItem('intervalId', this.get('intervalId'));
  }.observes('intervalId'),

  quickTime: function() {
    const idx = this.get('quickTimeIdx');
    localStorage.setItem('quickTimeIdx', idx);
    return this.get('quickTimes').objectAt(idx);
  }.property('quickTimeIdx'),

  init() {
    this._super();
    this.set('intervals', INTERVALS);
    this.set('quickTimes', QUICKTIMES);
  },
});
