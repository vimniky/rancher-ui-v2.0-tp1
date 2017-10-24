import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    const store = this.get('loggingStore');
    const logging = store.all('logging');
    return logging;
  },
});
