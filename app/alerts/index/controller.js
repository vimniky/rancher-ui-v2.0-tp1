import Ember from 'ember';
import FilterState from 'ui/mixins/filter-state';

const headers = [
  {
    translationKey: 'generic.state',
    name: 'state',
    sort: ['state'],
    width: '125'
  },
  {
    translationKey: 'alertsPage.index.table.name',
    name: 'name',
    sort: ['name'],
    width: '150'
  },
  {
    translationKey: 'alertsPage.index.table.rules',
    name: 'rules',
    sort: ['rules'],
  },
  {
    translationKey: 'alertsPage.index.table.endpoint',
    name: 'endpoint',
    sort: ['endpoint'],
    width: '150'
  },
  {
    translationKey: 'alertsPage.index.table.timestamp',
    name: 'timestamp',
    sort: ['timestamp'],
    width: '150'
  },
];

export default Ember.Controller.extend(FilterState, {
  access: Ember.inject.service(),
  sortBy: 'name',
  queryParams: ['alertState'],
  alertState: 'all',
  headers,
  actions: {
  },
  filteredAlerts: function() {
    return this.get('filtered').filter(alert => {
      const state = this.get('alertState');
      if (state === 'all') {
        return true;
      } else if (state === 'active') {
        return alert.get('state').toLocaleLowerCase() === 'active';
      }
      return true;
    });
  }.property('filtered.@each.state,alertState'),
});
