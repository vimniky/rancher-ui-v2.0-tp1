import Ember from 'ember';

export default Ember.Mixin.create({
  getRecipientLabel(recipientType) {
    switch(recipientType) {
    case 'email':
      return 'Email Address';
    case 'pagerduty':
      return {
        serviceKey: 'Pagerduty Service Key',
        serviceName: 'Pagerduty Service Name',
      }
    case 'slack':
      return 'Slack Channel';
    case 'webhook':
      return  {
        url: 'Webhook',
        name: 'Webhook Name',
      }
    default:
      return 'Recipient';
    }
  },
});
