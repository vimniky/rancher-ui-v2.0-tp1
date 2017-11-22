import Ember from 'ember';

const recipientTypes = ['slack', 'email','pagerduty', 'webhook'];
export default Ember.Component.extend({
  intl: Ember.inject.service(),
  modalService: Ember.inject.service('modal'),
  projects: Ember.inject.service(),
  namespace: Ember.computed.reads('projects.namespace'),

  // input
  model: null,
  newRecipient: null,
  recipientType: 'slack',
  recipientTypes: recipientTypes.map(v => ({label: v, value: v})),

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

  actions: {
    showRecipientModal() {
      const model = this.createRecipient();
      console.log(model)
      this.get('modalService').toggleModal('modal-alert-recipient', {
        closeWithOutsideClick: false,
        recipientTypes: this.get('recipientTypes'),
        model,
      });
    },
  },

  newRecipientChanged: function() {
    const r = this.get('newRecipient');
    const type = r.get('recipientType');
    const id = r.get('id');
    console.log('changed type, id', type, id)
    if (type) {
      this.set('recipientType', type);
    }
    if (id) {
      this.set('model.recipientId', id);
    }
  }.observes('newRecipient.{recipientType,id}'),

  createRecipient() {
    const newRecipient = this.get('monitoringStore').createRecord({
      type: 'recipient',
      recipientType: this.get('recipientType'),
      namespace: this.get('namespace'),
      emailRecipient: {
        address: null,
      },
      pagerdutyRecipient: {
        serviceKey: null,
      },
      slackRecipient: {
        channel: null,
      },
      webhookRecipient: {
        url: null,
      },
    });
    this.set('newRecipient', newRecipient);
    return newRecipient;
  },

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
