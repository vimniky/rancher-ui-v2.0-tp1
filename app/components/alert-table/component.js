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
    translationKey: 'alertsPage.index.table.description',
    name: 'description',
    sort: ['description'],
    width: '180'
  },
  {
    translationKey: 'alertsPage.index.table.rules',
    name: 'rules',
    sort: ['rules', 'id', 'targetType', 'recipientType'],
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
  model: null,
  targetId: null,

  sortBy: 'name',
  queryParams: ['alertState'],
  alertState: 'all',
  headers,

  filteredAlerts: function() {
    let alerts = this.get('filtered');
    const targetId = this.get('targetId');
    if (targetId) {
      alerts = alerts.filterBy('targetId', targetId);
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
  }.property('filtered.[],alertState,targetId'),
});
