import Ember from 'ember';

export default Ember.Route.extend({
  projects: Ember.inject.service(),

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
    return this.get('monitoringStore').findAll('notifier');
  }
});
