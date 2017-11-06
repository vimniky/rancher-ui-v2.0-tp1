import Ember from 'ember';

export default Ember.Route.extend({
  projects: Ember.inject.service(),
  namespace: null,
  model() {
    const store = this.get('loggingStore');
    // system <--> cattle-system
    let ns = this.get('projects.current').name.toLowerCase();
    this.set('namespace', ns);
    return store
      .all('logging')
      .filterBy('namespace', ns ==='system' ? 'cattle-system' : ns)
      .get('firstObject');
  },
  setupController(controller, model) {
    console.log('--------setupController', model.get('targetType'));
    this._super(controller, model);
    controller.set('namespace', this.get('namespace'));
    if (model.get('targetType')) {
      controller.set('targetType', model.get('targetType'));
    }
  },
  resetController(controller, isExisting) {
    if (isExisting) {
      controller.set('namespace', null);
      controller.set('model', null);
    }
  },
});
