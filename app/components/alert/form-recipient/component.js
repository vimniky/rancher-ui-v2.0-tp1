import Ember from 'ember';

const recipientTypes = ['slack', 'email','pagerduty', 'webhook'];
export default Ember.Component.extend({
  tagName: 'table',
  intl: Ember.inject.service(),

  // input
  model: null,
  recipients: null,
  toNewRecipient: null,

  recipientTypes: recipientTypes.map(value => ({label: value.capitalize(), value})),
  percent: 30,
  isReuse: Ember.computed.alias('model.newRecipient.isReuse'),
  recipientType: null,

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
    this.setInitialUnavailablePercentage();
    this.set('recipients', recipients);
  },

  setInitialUnavailablePercentage() {
    const p = this.getUnavailablePercentage();
    if (this.get('model.id') && p) {
      this.set('percent', p);
    }
  },

  targetTypeChanged: function() {
    const p = this.get('percent');
    this.setUnavailablePercentage(p);
  }.observes('model.targetType', 'percent'),

  setUnavailablePercentage(p) {
    const model = this.get('model');
    const t = this.get('model.targetType')
    switch(t) {
    case 'deployment':
      model.set('deploymentRule.unavailablePercentage', p);
      break;
    case 'statefulset':
      model.set('statefulSetRule.unavailablePercentage', p);
      break;
    case 'daemonset':
      model.set('daemonSetRule.unavailablePercentage', p);
      break
    default:
    }
  },

  getUnavailablePercentage() {
    const model = this.get('model');
    const t = this.get('model.targetType')
    let p
    switch(t) {
    case 'deployment':
      p = model.get('deploymentRule.unavailablePercentage');
      break;
    case 'statefulset':
      p = model.get('statefulSetRule.unavailablePercentage');
      break;
    case 'daemonset':
      p = model.get('daemonSetRule.unavailablePercentage');
      break
    default:
    }
    return p;
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
    const type = this.get('recipientType') || 'slack';
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
    recipient.set('recipientType', type);
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
    case 'webhook':
      recipient.set('webhookRecipient.url', value);
      break
    default:
    }
  }.observes('toNewRecipient,recipientType'),
  filteredRecipients: function() {
    const recipientType = this.get('recipientType');
    let recipients = this.get('recipients');
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
  }.property('recipients','recipients.length','recipientType'),
  actions: {
    toggle() {
      this.set('isReuse', !this.get('isReuse'));
    }
  }
});
