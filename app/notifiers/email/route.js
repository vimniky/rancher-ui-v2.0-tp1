import Ember from 'ember'

export default Ember.Route.extend({
  model() {
    return this.modelFor('notifiers').filterBy('notifierType', 'email').get('firstObject');
  }
});
