import Ember from 'ember';

const emails = ['email', 'slack', 'pagerduty'];

export default Ember.Component.extend({
  tagName: 'table',
  recipients: [],
  toNewRecipient: '',
  recipientTypes: emails.map(value => ({label: value.capitalize(), value})),
  percent: Ember.computed.alias('model.serviceRule.unhealthyPercentage'),
  isReuse: Ember.computed.alias('model.newRecipient.isReuse'),
  recipientType: Ember.computed.alias('model.newRecipient.recipientType'),
  init() {
    this._super(...arguments);
    this.recipientIdChanged();
  },
  recipientTypeChanged: function() {
    // empty toNewRecipient inpu box when recipientType changed
    this.set('toNewRecipient', null);
  }.observes('recipientType'),
  toNewRecipientChanged: function() {
    const recipient = this.get('model.newRecipient');
    const type = this.get('recipientType');
    const value = this.get('toNewRecipient');
    switch(type) {
    case 'email':
      recipient.set('emailRecipient.address', value);
      break
    case 'slack':
      recipient.set('slackRecipient.channel', value);
      break
    case 'pagerduty':
      recipient.set('pagerdutyRecipient.serviceKey', value);
      break
    default:
    }
  }.observes('toNewRecipient,recipientType'),
  recipientIdChanged: function() {
    // When reuse a exiting recipient, automatically detect and set recipientType when recipientId changed
    const recipientId = this.get('model.recipientId');
    const recipients = this.get('recipients');
    const isReuse = this.get('isReuse');
    if (recipientId && isReuse) {
      const found = recipients.filterBy('id', recipientId).get('firstObject');
      if (found) {
        this.set('recipientType', found.recipientType);
      }
    }
  }.observes('model.recipientId'),
  filteredRecipients: function() {
    const recipientType = this.get('recipientType');
    let recipients = this.get('recipients');
    if (recipientType) {
      recipients = recipients.filterBy('recipientType', recipientType);
    }
    return recipients.map(v => {
      let label
      switch(v.recipientType) {
      case 'email':
        label = v.emailRecipient.address;
        break
      case 'slack':
        label = v.slackRecipient.channel;
        break
      case 'pagerduty':
        label = v.pagerdutyRecipient.serviceKey;
        break
      default:
        label = v.emailRecipient.address;
      }
      const out = {
        label,
        value: v.id,
      }
      if (!recipientType) {
        out.group = v.recipientType;
      }
      return out;
    });
  }.property('recipients', 'recipients.length', 'recipientType'),
  actions: {
    toggle() {
      this.set('isReuse', !this.get('isReuse'));
    }
  }
});
