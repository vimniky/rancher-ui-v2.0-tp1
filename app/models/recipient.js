import Resource from 'ember-api-store/models/resource';
import AlertMixin from 'ui/mixins/alert';

export default Resource.extend(AlertMixin, {
  type: 'recipient',

  recipientValue: function() {
    const type = this.get('recipientType');
    switch(type) {
    case 'email':
      return this.get('emailRecipient.address');
    case 'pagerduty':
      return this.get('pagerdutyRecipient.serviceName');
    case 'slack':
      return this.get('slackRecipient.channel');
    case 'webhook':
      return this.get('webhookRecipient.url');
    default:
      return null
    }
  }.property('recipientType,emailRecipient.address,slackRecipient.channel,pagerdutyRecipient.serviceKey'),

  setRecipientValue(v, serviceName) {
    const type = this.get('recipientType');
    switch(type) {
    case 'email':
       this.set('emailRecipient.address', v);
      break;
    case 'pagerduty':
      this.set('pagerdutyRecipient.serviceKey', v);
      if (serviceName) {
        this.set('pagerdutyRecipient.serviceName', serviceName);
      }
      break;
    case 'slack':
      this.set('slackRecipient.channel', v);
      break;
    case 'webhook':
       this.set('webhookRecipient.url', v);
      break;
    default:
    }
  },

  recipientLabel: function() {
    return this.getRecipientLabel(this.get('recipientType'));
  }.property('recipientType'),

  recipientPlaceholder: function() {
    switch(this.get('recipientType')) {
    case 'email':
      return 'e.g. example@mail.com';
    case 'pagerduty':
      return 'Enter a service key';
    case 'slack':
      return 'e.g. #test';
    case 'webhook':
      return 'Enter a webhook URL';
    default:
      return 'Enter a recipient';
    }
  }.property('recipientType'),
});
