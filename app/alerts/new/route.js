import Ember from 'ember';

export default Ember.Route.extend({
  model(params, transition) {
    const id = transition.queryParams.alertId;
    const store = this.get('monitoringStore');
    const hash = {
      recipients: store.findAll('recipient'),
    }
    if (id) {
      hash.alert = store.find('alert', id);
    }
    return Ember.RSVP.hash(hash);
  },
  setupController(controller, model) {
    if (model.alert) {
      controller.set('models', [model.alert]);
    }
    controller.set('recipients', model.recipients);
  },
  resetController: function (controller, isExisting/*, transition*/) {
    if (isExisting) {
      controller.setProperties({
        alertId: null,
        upgrade: null,
        model: null,
        models: null,
        recipients: null,
      })
    }
  }
});
