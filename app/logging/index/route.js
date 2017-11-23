import Ember from 'ember';

export default Ember.Route.extend({
  projects: Ember.inject.service(),
  namespace: Ember.computed.reads('projects.namespace'),
  currentLogging: null,
  model() {
    const store = this.get('loggingStore');
    let ns = this.get('namespace');
    const isClusterLevel = ns === 'cattle-system';
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
        } else {
          this.set('currentLogging', logging.clone());
        }
        if (!logging.get('targetType')) {
          logging.set('targetType', defaultTarget);
        }
        return logging;
      }),
      loggingAuth: store.find('loggingAuth', null, {forceReload: true}).then(ary => {
        return ary.get('firstObject');
      }),
    });
  },
  doRedirect(model, controller) {
    const logging = model.logging;
    const canRedirectToDashboard =
          logging.get('enable')
          && !this.get('preventDirect')
          && controller && controller.get('targetType') === 'embedded'
          && logging.get('id')
          && logging.get('targetType') === 'embedded'
          && this.get('isClusterLevel');
    if (canRedirectToDashboard) {
      this.transitionTo('logging.dashboard');
    }
    this.set('preventDirect', false);
  },
  setupController(controller, model) {
    const logging = model.logging;
    controller.set('namespace', this.get('namespace'));
    controller.set('currentLogging', this.get('currentLogging'));
    const enable = logging.get('enable');
    if (enable && !controller.get('targetType')) {
      controller.set('targetType', logging.get('targetType'));
    }
    this.doRedirect(model, controller);
    this._super(controller, model);
  },
  resetController(controller, isExisting) {
    if (isExisting) {
      controller.set('namespace', null);
      controller.set('model', null);
      controller.set('model', null);
      controller.set('targetType', this.get('model.logging.targetType'));
    }
  },
});
