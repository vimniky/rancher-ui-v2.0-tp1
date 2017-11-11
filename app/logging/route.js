import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    let store = this.get('loggingStore');
    return this.loadSchemas(store).then(() => {
      // load all alert related resources
      const hash = {
        loggings: store.find('logging', null, {forceReload: true}),
      };
      return Ember.RSVP.hash(hash);
    });
  },
  loadSchemas(store) {
    return store.rawRequest({url:'/v6/schemas', dataType: 'json'}).then((xhr) => {
      store._bulkAdd('schema', xhr.body.data);
    });
  },
});
