import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.get('monitoringStore').findAll('alert', null, {forceReload: true});
  },
});
