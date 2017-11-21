import Ember from 'ember';

export default Ember.Route.extend({
  projects: Ember.inject.service(),

  namespace: function() {
    if (this.get('isCluster')) {
      return 'system';
    }
    return this.get('projects.current.name');
  }.property('isCluster', 'projects.current.name'),

  isCluster: function() {
    return this.get('projects.current.name').toLowerCase() === 'system';
  }.property('projects.current.name'),

  beforeModel() {
    console.log(this.get('isCluster'))
    if (!this.get('isCluster')) {
      this.transitionTo('containers.index');
    }
  },
  model() {
    return this.get('monitoringStore').find('notifier', null, {filter: {namespace: this.get('namespace')}});
  }
});
