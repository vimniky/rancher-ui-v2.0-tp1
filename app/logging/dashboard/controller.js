import Ember from 'ember';

export default Ember.Controller.extend({
  tableData: null,
  quickTimeRanges: null,
  init() {
    if (!this.get('quickTimeRange')) {
      const qt = [
        {
          label: 'Last 5 minutes',
          value: '5m',
        },
        {
          label: 'Last 15 minutes',
          value: '15m',
        },
        {
          label: 'Last 30 minutes',
          value: '30m',
        },
        {
          label: 'Last 1 hour',
          value: '1h',
        },
        {
          label: 'Last 4 hours',
          value: '4h',
        },
        {
          label: 'Last 12 hours',
          value: '12h',
        },
        {
          label: 'Last 1 day',
          value: '1d',
        },
        {
          label: 'Last 1 day',
          value: '3d',
        },
        {
          label: 'Last 1 week',
          value: '1w',
        },
        {
          label: 'Last 1 month',
          value: '1m',
        },
      ];
      this.set('quickTimeRanges', qt);
    }
  },
  actions: {
    gotoConfigure() {
      Ember.getOwner(this).lookup('route:logging.index').set('preventDirect', true);
      this.transitionToRoute('logging');
    }
  }
});
