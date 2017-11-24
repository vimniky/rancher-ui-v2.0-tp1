import Ember from 'ember';
const {getOwner} = Ember;

export default Ember.Route.extend({

  model() {
    return getOwner(this).lookup('route:alerts').loadResources().then(hash => {
      let notifier = hash.notifiers.get('firstObject');
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
      return {
        notifier,
        alerts: hash.alerts,
      };
    });
  }
});
