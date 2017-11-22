import Ember from 'ember';

export default Ember.Component.extend({
  init() {
    this._super();
    const store = this.get('monitoringStore');
    const targets = [
      'node',
      'deployment',
      'pod',
      'daemonset',
      'statefulset',
    ].map(store.all.bind(store)).reduce((sum, resources) => sum.pushObjects(resources.get('content')), []);
    this.set('targets', targets);
  }
});
