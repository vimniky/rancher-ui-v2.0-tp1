import Ember from 'ember';

export default Ember.Controller.extend({
  envLogging: function() {
    return this.get('model').get('firstObject');
  }.property('model.[]'),
});
