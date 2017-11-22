import Ember from 'ember'

export default Ember.Controller.extend({
  queryParams: ['alertId'],
  alertId: null,
  isCreate: function() {
    return !this.get('alertId');
  }.property('alertId'),
});
