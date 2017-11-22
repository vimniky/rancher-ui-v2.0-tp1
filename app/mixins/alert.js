import Ember from 'ember';

export default Ember.Mixin.create({
  getRecipientLabel(recipientType) {
    switch(recipientType) {
    case 'email':
      return 'Email Address';
    case 'pagerduty':
      return 'Pagerduty Service Name';
    case 'slack':
      return 'Slack Channel';
    case 'webhook':
      return 'Webhook URL';
    default:
      return 'Recipient';
    }
  },
});
