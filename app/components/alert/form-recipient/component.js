import Ember from 'ember';

const recipientTypes = ['slack', 'email','pagerduty'];

export default Ember.Component.extend({
  tagName: 'table',
  intl: Ember.inject.service(),

  // input
  model: null,
  recipients: null,
  toNewRecipient: null,

  recipientTypes: recipientTypes.map(value => ({label: value.capitalize(), value})),
  percent: Ember.computed.alias('model.serviceRule.unhealthyPercentage'),
  isReuse: Ember.computed.alias('model.newRecipient.isReuse'),
  recipientType: Ember.computed.alias('model.newRecipient.recipientType'),

  latestSelectionMap: null,
  init() {
    this._super(...arguments);
    this.set('latestSelectionMap');
    this.set('recipients', this.get('monitoringStore').all('recipient'));
  },
  setLatestSelectionMap() {
    const recipientId = this.get('model.recipientId');
    const lsm = this.get('latestSelectionMap');
    if (!lsm) {
      this.set('latestSelectionMap', Ember.Object.create());
    }
    if (recipientId) {
      this.set(`latestSelectionMap.${this.get('recipientType')}`, recipientId);
    }
  },
  recipientChanged: function() {
    // When reuse a exiting recipient, automatically detect and set recipientType when recipientId changed
    const recipientId = this.get('model.recipientId');
    const isReuse = this.get('isReuse');
    if (recipientId && isReuse) {
      this.setLatestSelectionMap();
    }
  }.observes('model.recipientId,isReuse'),
  recipientTypeChanged: function() {
    const cached = this.get(`latestSelectionMap.${this.get('recipientType')}`);
    if (cached) {
      this.set('model.recipientId', cached);
    } else {
      this.set('model.recipientId', null);
    }
  }.observes('recipientType'),
  recipientPrompt: function() {
    const type = this.get('recipientType');
    return this.get('intl').t(`formRecipient.recipient.placeholder.reuse.${type}`);
  }.property('recipientType'),
  newRecipientPlaceholder: function() {
    const type = this.get('recipientType');
    return this.get('intl').t(`formRecipient.recipient.placeholder.new.${type}`);
  }.property('recipientType'),
  toNewRecipientChanged: function() {
    const recipient = this.get('model.newRecipient');
    const type = this.get('recipientType');
    const value = this.get('toNewRecipient');
    // Set model accordingly
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
        label = v.slackRecipient.channel;
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
  }.property('recipients','recipients.length','recipientType'),
  actions: {
    toggle() {
      this.set('isReuse', !this.get('isReuse'));
    }
  }
});
