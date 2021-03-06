import Ember from 'ember';

export default Ember.Route.extend({

  model(params, transition) {
    const id = transition.queryParams.alertId;
    const store = this.get('monitoringStore');
    const hash = {}

    if (id) {
      hash.alert = store.find('alert', id);
    }
    return Ember.RSVP.hash(hash);
  },
  setupController(controller, model) {
    if (model.alert) {
      controller.set('model', model.alert);
    }
  },

  resetController: function (controller, isExisting/*, transition*/) {
    if (isExisting) {
      controller.setProperties({
        alertId: null,
        upgrade: null,
        model: null,
      })
    }
  }
});
