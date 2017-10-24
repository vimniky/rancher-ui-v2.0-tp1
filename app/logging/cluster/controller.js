import Ember from 'ember';

export default Ember.Controller.extend({
  clusterLogging: function() {
    return this.get('model').get('firstObject');
  }.property('model.[]'),
});
