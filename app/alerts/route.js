import Ember from 'ember';

export default Ember.Route.extend({
  projects: Ember.inject.service(),

  namespace: function() {
    const ns = this.get('projects.current.name');
    if (ns === 'system') {
      return 'cattyle-system';
    }
    return ns.toLowerCase();
  }.property('projects.current.name'),
  loadResources() {
    let store = this.get('monitoringStore');
    return this.loadSchemas(store).then(() => {
      // load all alert related resources
      const filter = {namespace: this.get('namespace')};
      const hash = {
        alerts: store.find('alert', null, {forceReload: true, filter}),
        recipients: store.find('recipient', null, {forceReload: true, filter}),
        notifiers: store.find('notifier', null, {forceReload: true}),
        pods: store.find('pod', null, {forceReload: true, filter}),
        deployments: store.find('deployment', null, {forceReload: true, filter}),
        nodes: store.find('node', null, {forceReload: true}),
        daemonsets: store.find('daemonset', null, {forceReload: true, filter}),
        statefulset: store.find('statefulset', null, {forceReload: true, filter}),
      };
      return Ember.RSVP.hash(hash);
    });
  },
  loadSchemas(store) {
    return store.rawRequest({url:'/v5/schemas', dataType: 'json'}).then((xhr) => {
      store._bulkAdd('schema', xhr.body.data);
    });
  },
});
