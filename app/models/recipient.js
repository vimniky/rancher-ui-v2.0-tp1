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
    case 'webhook':
      return this.get('webhookRecipient.url');
    default:
      return null
    }
  }.property('recipientType,emailRecipient.address,slackRecipient.channel,pagerdutyRecipient.serviceKey'),

  setRecipientValue(v) {
    const type = this.get('recipientType');
    switch(type) {
    case 'email':
      return this.set('emailRecipient.address', v);
    case 'pagerduty':
      return this.set('pagerdutyRecipient.serviceKey', v);
    case 'slack':
      return this.set('slackRecipient.channel', v);
    case 'webhook':
      return this.set('webhookRecipient.url', v);
    default:
    }
  },

  // recipientType: function() {
  //   if (this.get('emailRecipient.address')) {
  //     return 'email';
  //   } else if (this.get('slackRecipient.channel')) {
  //     return 'slack';
  //   } else if (this.get('pagerdutyRecipient.serviceKey')) {
  //     return 'pagerduty';
  //   } else if (this.get('webhookRecipient.url')) {
  //   return 'webhook';
  // }
  //   return 'slack';
  // }.property('emailRecipient.address', 'slackRecipient.channel', 'pagerdutyRecipient.serviceKey', 'webhookRecipient.url'),
});
