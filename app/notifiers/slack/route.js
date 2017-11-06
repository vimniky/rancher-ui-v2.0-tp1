import Ember from 'ember'

export default Ember.Route.extend({
  model() {
    // There only on notifier
    return this.modelFor('notifiers').get('firstObject');
  }
});
