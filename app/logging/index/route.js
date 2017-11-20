import Ember from 'ember';

export default Ember.Route.extend({
  projects: Ember.inject.service(),
  namespace: null,
  model() {
    const store = this.get('loggingStore');
    // system <--> cattle-system
    // k8s' cattle-system namespace is mapped into rancher's system environemnt
    let ns = this.get('projects.current').name.toLowerCase();
    console.log(ns);
    const isClusterLevel = ns === 'system';
    ns = isClusterLevel ? 'cattle-system' : ns
    this.set('namespace', ns);
    this.set('isClusterLevel', isClusterLevel);
    return Ember.RSVP.hash({
      logging: store.find('logging', null, {forceReload: true}).then(ls => {
        let logging = ls.filterBy('namespace', ns).get('firstObject');
        const defaultTarget = this.get('isClusterLevel') ? 'embedded' : 'elasticsearch';
        if (!logging) {
          logging = store.createRecord({
            type: 'logging',
            namespace: ns,
            esLogstashPrefix: ns,
            esLogstashFormat: false,
          });
        }
        if (!logging.get('targetType')) {
          logging.set('targetType', defaultTarget);
        }
        return logging;
      }),
      loggingAuth: store.find('loggingAuth', null, {forceReload: true}).then(las => {
        return las.get('firstObject');
      }),
    });
  },
  setupController(controller, model) {
    const logging = model.logging;
    controller.set('namespace', this.get('namespace'));
    const enable = logging.get('enable');
    if (enable && !controller.get('targetType')) {
      controller.set('targetType', logging.get('targetType'));
    }
    this._super(controller, model);
  },
  resetController(controller, isExisting) {
    if (isExisting) {
      controller.set('namespace', null);
      controller.set('model', null);
    }
  },
});
