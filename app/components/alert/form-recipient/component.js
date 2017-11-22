import Ember from 'ember';

const recipientTypes = ['slack', 'email','pagerduty', 'webhook'];
export default Ember.Component.extend({
  intl: Ember.inject.service(),

  // input
  model: null,

  recipientTypes: recipientTypes.map(v => ({label: v, value: v})),
  recipientType: 'slack',

  latestSelectionMap: null,

  init() {
    this._super(...arguments);
    const recipients = this.get('monitoringStore').all('recipient');
    const recipientId = this.get('model.recipientId');
    if (recipientId) {
      const recipient = recipients.filterBy('id', recipientId).get('firstObject');
      // According to if recipient value exist or not to determine the recipientType.
      if (recipient) {
        this.set('recipientType', recipient.get('recipientType'));
      }
    }
    this.setLatestSelectionMap();
    this.set('recipients', recipients);
  },

  setLatestSelectionMap: function() {
    const recipientId = this.get('model.recipientId');
    const lsm = this.get('latestSelectionMap');
    if (!lsm) {
      this.set('latestSelectionMap', Ember.Object.create());
    }
    if (recipientId) {
      this.set(`latestSelectionMap.${this.get('recipientType')}`, recipientId);
    }
  }.observes('model.recipientId'),

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

  // recipientChanged: function() {
  //   const id = this.get('model.recipientId');
  //   const recipient = this.get('monitoringStore').getById('recipient', id);
  //   const type = this.get('recipientType');
  //   const value = this.get('toNewRecipient');
  //   recipient.set('recipientType', type);
  //   switch(type) {
  //   case 'email':
  //     recipient.set('emailRecipient.address', value);
  //     break
  //   case 'slack':
  //     recipient.set('slackRecipient.channel', value);
  //     break
  //   case 'pagerduty':
  //     recipient.set('pagerdutyRecipient.serviceKey', value);
  //     break
  //   case 'webhook':
  //     recipient.set('webhookRecipient.url', value);
  //     break
  //   default:
  //   }
  // }.observes('model.recipientId'),

  showSearch: function() {
    const r = this.get('recipients');
    return r && r.length > 10;
  }.property('recipients.length'),

  filteredRecipients: function() {
    const recipientType = this.get('recipientType');
    const recipients = this.get('recipients');
    return recipients.filter(v => {
      if (!recipientType) {
        return true;
      }
      return recipientType === v.get('recipientType')
    }).map(v => {
      return {
        label: v.get('recipientValue'),
        value: v.id,
      }
    });
  }.property('recipients.[]', 'recipientType'),
});
