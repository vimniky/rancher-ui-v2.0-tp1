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
    sort: ['name', 'displayName'],
    width: '180'
  },
  {
    translationKey: 'alertsPage.index.table.rules',
    name: 'rules',
    sort: ['rules', 'id', 'objectType', 'recipientType'],
  },
  {
    translationKey: 'alertsPage.index.table.endpoint',
    name: 'endpoint',
    sort: ['endpoint'],
    width: '200'
  },
  {
    translationKey: 'alertsPage.index.table.timestamp',
    name: 'timestamp',
    sort: ['timestamp'],
    width: '150'
  },
];

export default Ember.Component.extend(FilterState, {
  access: Ember.inject.service(),

  // input
  objectId: null,

  sortBy: 'name',
  queryParams: ['alertState'],
  alertState: 'all',
  headers,

  init() {
    this._super();
    let alerts = this.get('monitoringStore').all('alert');
    this.set('model', alerts);
  },
  filteredAlerts: function() {
    let alerts = this.get('filtered');
    const objectId = this.get('objectId');
    if (objectId) {
      alerts = alerts.filterBy('objectId', objectId);
    }
    return alerts.filter(alert => {
      const state = this.get('alertState');
      if (state === 'all') {
        return true;
      } else if (state === 'active') {
        return alert.get('state').toLocaleLowerCase() === 'active';
      }
      return true;
    });
  }.property('filtered.[],alertState,objectId'),
});
