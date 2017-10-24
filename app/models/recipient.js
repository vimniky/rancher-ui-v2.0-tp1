import Resource from 'ember-api-store/models/resource';

export default Resource.extend({
  type: 'recipient',
  recipientValue: function() {
    const type = this.get('recipientType');
    switch(type) {
    case 'email':
      return this.get('emailRecipient.address');
    case 'pagerduty':
      return this.get('pagerdutyRecipient.serviceKey');
    case 'slack':
      return this.get('slackRecipient.channel');
    default:
      return null
    }
  }.property('recipientType,emailRecipient.address,slackRecipient.channel,pagerdutyRecipient.serviceKey'),
});
