import Ember from 'ember';

const intervals = [
  {unit: 'second', label: 'second', values: [1, 5, 10, 15, 30], valueIdx: 0, id: 's'},
  {unit: 'minute', label: 'minute', values: [1, 3, 5, 10, 15, 30], valueIdx: 0, id: 'm'},
  {unit: 'hour', label: 'hourly', values: [1, 3, 5, 10], valueIdx: 0, id: 'h'},
  {unit: 'day', label: 'daily', values: [1, 3, 7, 14], valueIdx: 0, id: 'd'},
  {unit: 'week', label: 'weekly', values: [1, 3, 5, 10], valueIdx: 0, id: 'w'},
  {unit: 'month', label: 'monthly', values: [1, 3, 5], valueIdx: 0, id: 'M'},
  {unit: 'year', label: 'yearly', values: [1, 3, 5], valueIdx: 0, id: 'y'},
].map(item => Ember.Object.create(item));

const quickTimes = [
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
    unit: 'h',
  },
  {
    label: 'Last 3 hours',
    value: 4,
    unit: 'h',
  },
  {
    label: 'Last 12 hours',
    value: 12,
    unit: 'h',
  },
  {
    label: 'Today',
    value: 1,
    unit: 'd',
  },
  {
    label: 'Last 3 day',
    value: 3,
    unit: 'd',
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
  intervalId: 's',
  quickTime: null,
  quickTimeIdx: "1",
  intervalScaleTips: null,

  quickTime: function() {
    return this.get('quickTimes').objectAt(this.get('quickTimeIdx'));
  }.property('quickTimeIdx'),

  init() {
    this._super();
    this.set('intervals', intervals);
    this.set('quickTimes', quickTimes);
  },
});
