import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    const store = this.get('store');
    return Ember.RSVP.hash({
      // host:     store.find('host', '1h1'),
      service:  store.findAll('service'),
      instance: store.findAll('instance'),
    });
  },
});
