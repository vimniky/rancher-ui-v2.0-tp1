import Ember from 'ember'

export default Ember.Controller.extend({
  queryParams: ['alertId', 'upgrade'],
  upgrade: false,
  alertId: null,
  record: 'alert name',
  editing: Ember.computed.reads('upgrade'),
  creating: function() {
    return !this.get('alertId');
  }.property('alertId'),
});
