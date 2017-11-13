import Ember from 'ember';

export default Ember.Route.extend({
  projects: Ember.inject.service(),
  namespace: null,
  model() {
    const store = this.get('loggingStore');
    // system <--> cattle-system
    // k8s' cattle-system namespace is mapped into rancher's system environemnt
    let ns = this.get('projects.current').name.toLowerCase();
    this.set('namespace', ns);
    return Ember.RSVP.hash({
      logging: store.find('logging', null, {forceReload: true}).then(ls => {
        return ls.filterBy('namespace', ns ==='system' ? 'cattle-system' : ns).get('firstObject') || null;
      }),
      loggingAuth: store.find('loggingAuth', null, {forceReload: true}).then(las => {
        return las.get('firstObject');
      }),
    });
  },
  setupController(controller, model) {
    this._super(controller, model);
    const logging = model.logging;
    controller.set('namespace', this.get('namespace'));
    if (logging && logging.get('targetType')) {
      const enable = logging.get('enable');
      if (enable) {
        controller.set('targetType', logging.get('targetType'));
      }
    }
  },
  resetController(controller, isExisting) {
    if (isExisting) {
      controller.set('namespace', null);
      controller.set('model', null);
    }
  },
});
