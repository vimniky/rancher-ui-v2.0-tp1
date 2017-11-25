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

export default Ember.Component.extend({
  logs: null,

  init() {
    this._super();
    this.set('intervals', intervals);
  },
});
