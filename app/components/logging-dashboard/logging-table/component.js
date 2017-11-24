import Ember from 'ember';
import FilterState from 'ui/mixins/filter-state';

const headers = [
  {
    name: 'expand',
    sort: false,
    searchField: null,
    width: 30
  },
  {
    translationKey: 'loggingDashboardPage.table.timestamp',
    name: 'timestamp',
    sort: ['timestamp'],
    width: '180'
  },
  {
    translationKey: 'loggingDashboardPage.table.log',
    name: 'log',
    sort: ['log'],
  },
  {
    translationKey: 'loggingDashboardPage.table.containerName',
    name: 'containerName',
    sort: ['containerName'],
    width: '140'
  },
];

export default Ember.Component.extend(FilterState, {
  sortBy: 'timestamp',
  alertState: 'all',
  headers,

  init() {
    this._super();
  },
  filteredLogs: function() {
    // todo
    return this.get('model');
  }.property('filtered.[]', 'alertState' ,'targetId'),
});
