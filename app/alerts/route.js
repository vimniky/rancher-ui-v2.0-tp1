import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    let store = this.get('monitoringStore');
    return this.loadSchemas(store).then(() => {
      // load all alert related resources
      const hash = {
        alerts: store.find('alert', null, {forceReload: true}),
        recipients: store.find('recipient', null, {forceReload: true}),
        notifiers: store.find('notifier', null, {forceReload: true}),
        pods: store.find('pod', null, {forceReload: true}),
        deployments: store.find('deployment', null, {forceReload: true}),
        nodes: store.find('node', null, {forceReload: true}),
        daemonsets: store.find('daemonset', null, {forceReload: true}),
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
