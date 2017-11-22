import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';

export default Ember.Component.extend(NewOrEdit, {
  projects: Ember.inject.service(),
  router: Ember.inject.service(),
  intl: Ember.inject.service(),
  namespace: Ember.computed.reads('projects.namespace'),

  originalModel: null,
  advancedShown: false,
  errors: null,

  init() {
    this._super(...arguments);
  },

  didReceiveAttrs() {
    const original = this.get('originalModel');
    if (!original) {
      this.addAlert();
      return;
    }
    this.set('model', original.clone());
  },

  mergeResult(newData) {
    const original = this.get('originalModel');
    if (original) {
      // Merge updated data to original model
      original.merge(newData);
      return original;
    }
    return newData;
  },
  validate(model) {
    const errors = model.validationErrors();
    if (errors.get('length')) {
      this.set('errors', errors);
      return false;
    }
    this.set('errors', null);
    return true;
  },
  willSave() {
    const alert = this.get('model');
    return this.validate(alert);
  },
  doSave(cb) {
    const alert = this.get('model');
    alert.save().then((alertData) => {
      this.mergeResult(alertData);
      this.doneSaving();
      cb();
    }).catch(err => {
      this.set('errors', [err]);
      cb();
    });
  },
  doneSaving: function() {
    return this.send('cancel');
  },
  addAlert() {
    const alert = this.get('monitoringStore').createRecord({
      type: 'alert',
      targetType: 'node',
      targetId: null,
      namespace: this.get('namespace'),
      sendResolved: false,
      recipientId: null,
      daemonSetRule: {
        unavailablePercentage: 0,
      },
      deploymentRule: {
        unavailablePercentage: 0,
      },
      nodeRule: {
        condition: '',
      },
      statefulSetRule: {
        unavailablePercentage: 0,
      },
      advancedOptions: {
        initialWait: '3m',
        repeatInterval: '1h',
      },
    });
    this.set('model', alert);
  },
  actions: {
    showAdvanced() {
      this.set('advancedShown', true);
    },
    save(cb) {
      const ok = this.willSave(cb);
      if (!ok) {
        cb(false);
        return;
      }
      this.doSave(cb);
    },
    cancel() {
      this.get('router').transitionTo('alerts');
    },
  },
  // getToRecipientValue(recipient) {
  //   const type = recipient.get('recipientType');
  //   let out = null;
  //   switch(type) {
  //   case 'email':
  //     out = recipient.emailRecipient.address;
  //     break
  //   case 'slack':
  //     out = recipient.slackRecipient.channel;
  //     break
  //   case 'pagerduty':
  //     out = recipient.pagerdutyRecipient.serviceKey;
  //     break
  //   case 'webhook':
  //     out = recipient.webhookRecipient.url;
  //     break
  //   default:
  //   }
  //   return out;
  // },
  // attachNewRecipient(alert) {
  //   const newRecipient = this.get('monitoringStore').createRecord({
  //     type: 'recipient',
  //     isReuse: true,
  //     namespace: this.get('namespace'),
  //     targetId: alert.get('targetId') || this.get('targetId'),
  //     recipient: null,
  //     emailRecipient: {
  //       address: null,
  //     },
  //     pagerdutyRecipient: {
  //       serviceKey: null,
  //     },
  //     slackRecipient: {
  //       channel: null,
  //     },
  //     webhookRecipient: {
  //       url: null,
  //     },
  //   });
  //   alert.set('newRecipient', newRecipient);
  //   return alert;
  // },
  // validateRecipient(recipient) {
  //   if (!recipient.get('isReuse')) {
  //     const recipientType = recipient.get('recipientType');
  //     if (!recipientType) {
  //       this.set('errors', ['Notifier is required for new recipient']);
  //       return false;
  //     }
  //     const input = this.getToRecipientValue(recipient);
  //     if (!input) {
  //       this.set('errors', ['Recipient is required']);
  //       return false;
  //     }
  //     const ok = this.validate(recipient);
  //     if (!ok) {
  //       return false;
  //     }
  //   }
  //   // Don't need to create new recipient, so just let go.
  //   return true;
  // },
});
