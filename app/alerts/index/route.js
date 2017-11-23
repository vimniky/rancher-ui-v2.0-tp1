import Ember from 'ember';
const {getOwner} = Ember;

export default Ember.Route.extend({

  model() {
    return getOwner(this).lookup('route:alerts').loadResources().then(hash => {
      return hash.alerts;
    });
  }
});
