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
    // There are only one notifier
    return this.get('monitoringStore')
      .find('notifier', null, {filter: {namespace: this.get('namespace')}})
      .then(notifiers => {
        let notifier = notifiers.get('firstObject');
        if (!notifier) {
          notifier = this.get('monitoringStore').createRecord({
            type: 'notifier',
            emailConfig: {
            },
            slackConfig: {
            },
            resolveTimeout: '',
          });
        }
        return notifier;
    });
  }
});
