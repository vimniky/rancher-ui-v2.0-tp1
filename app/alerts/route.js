import Ember from 'ember';

export default Ember.Route.extend({
  projects: Ember.inject.service(),
  namespace: Ember.computed.reads('projects.namespace'),

  model() {
    return this.loadResources();
  },
  loadResources() {
    let store = this.get('monitoringStore');
    // load all alert related resources
    const filter = {namespace: this.get('namespace')};
    const hash = {
      notifiers: store.find('notifier', null),
      recipients: store.find('recipient', null, {forceReload: true, filter}),
      alerts: store.find('alert', null, {forceReload: true, filter}),
      pods: store.find('pod', null, {filter}),
      deployments: store.find('deployment', null, {filter}),
      nodes: store.find('node'),
      daemonsets: store.find('daemonset', null, {filter}),
      statefulset: store.find('statefulset', null, {filter}),
    };
    return Ember.RSVP.hash(hash);
  },
});
