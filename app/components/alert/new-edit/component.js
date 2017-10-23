import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';

// Severity: [Info, Warning, Critical]
const severities = ['info', 'warning', 'critical'];

export default Ember.Component.extend(NewOrEdit, {
  router: Ember.inject.service(),
  intl: Ember.inject.service(),
  alertBus: Ember.inject.service('alert-bus'),

  originalModels: null,
  editing: false,
  errors: null,
  alerts: [],
  hasAlerts: false,
  alertsChanged: function() {
    const alerts = this.get('alerts');
    const has = !!alerts && alerts.length > 0;
    this.set('hasAlerts', has);
  }.observes('alerts,alerts.length'),
  // When add alerts to a existing container/service/host, ..., objectId is not null
  // When creating new container/service/host or creating standalone alert, objectId will be null.
  objectId: null,
  isStandalone: function() {
    return this.get('mode') === 'standalone';
  }.property('mode'),
  severities: [],
  percent: 30,
  creating: function() {
    const originals = this.get('originalModels');
    return originals && originals.length && this.get('editing');
  }.property('editing,originalModels.[]'),
  allowAddMulti: function() {
    return !this.get('isStandalone') || !this.get('editing');
  }.property('editing', 'isStandalone'),
  init() {
    this._super(...arguments);
    const store = this.get('monitoringStore');
    this.set('alerts', []);
    this.set('severities', severities.map(value => ({label: `formNewEditAlert.severity.${value}`, value})))
    this.set('recipients', store.all('recipient'));
    this.set('selectionGroups', [
      {type: 'container'},
      {type: 'service'},
      {type: 'stack'},
      {type: 'host'},
    ]);
    if (!this.get('isStandalone')) {
      const objectId = this.get('objectId');
      if (objectId) {
        const alerts = store.all('alert').filterBy('objectId', objectId);
        if (alerts && alerts.length) {
          this.set('originalModels', alerts);
          this.setupModelsAndAlerts();
        }
      }
      const bus = this.get('alertBus');
      // Do the validation
      bus.on('validateAlerts', this, this.willSave);
      bus.on('saveAlerts', this, (id, cb) => {
        if (typeof cb !== 'function') {
          cb = noop => noop;
        }
        if (id) {
          // If id is not null
          // When update, container/service's id may change (the container/service has been replaced with a new one)
          this.get('alerts').forEach(alert => {
            alert.set('objectId', id);
          });
        }
        this.saveOneByOne(0, cb);
      });
    }
  },
  didReceiveAttrs() {
    const originals = this.get('originalModels');
    const editing = this.get('editing');
    const isStandalone = this.get('isStandalone');
    if (isStandalone) {
      if (editing && originals && originals.length) {
        // Editing a single exists alert
        this.setupModelsAndAlerts();
      } else {
        // Create new alerts
        this.createAlert();
      }
    } else {
      if (editing) {
        // Todo
      } else {
        // View mode
      }
    }
  },
  getRecipientTypeByid(id) {
    const found = this.get('recipients').filterBy('id', id).get('firstObject');
    if (found) {
      return found.recipientType;
    }
  },
  attachNewRecipient(alert) {
    const recipientId = alert.get('recipientId');
    let recipientType;
    if (recipientId) {
      recipientType = this.getRecipientTypeByid(recipientId);
    }
    const newRecipient = this.get('monitoringStore').createRecord({
      type: 'recipient',
      isReuse: true,
      objectId: alert.get('objectId') || this.get('objectId'),
      recipient: null,
      // email | slack | pagerduty
      recipientType: recipientType || 'email',
      emailRecipient: {
        address: null,
      },
      pagerdutyRecipient: {
        serviceKey: null,
      },
      slackRecipient: {
        channel: null,
      },
    });
    alert.set('newRecipient', newRecipient);
    return alert;
  },
  setupModelsAndAlerts() {
    const originals = this.get('originalModels');
    const models = originals.map(original => {
      const clone = original.clone();
      return this.attachNewRecipient(clone);
    });
    this.set('models', models);
    Ember.run.next(() => {
      const alerts = this.get('alerts');
      const models = this.get('models');
      alerts.pushObjects(models);
    });
  },
  createAlert() {
    this.send('addAlert');
  },
  mergeResult(newData) {
    const originals = this.get('originalModels') || [];
    const original = originals.filterBy('id', newData.get('id')).get('firstObject');
    if (original) {
      // Merge updated data to original model
      original.merge(newData);
      return original;
    }
    return newData;
  },
  willSave() {
    const alerts = this.get('alerts');
    return alerts.every(alert => {
      // Validate recipient
      const yes = this.validateRecipient(alert.get('newRecipient'));
      if (!yes) {
        return false;
      }
      // Transform alert data to match the alert schemea
      const p = alert.get('serviceRule').unhealthyPercentage;
      alert.set('serviceRule.unhealthyPercentage', String(p));
      // Validate alert
      const ok = this.validate(alert)
      return ok;
    });
  },
  doneSaving: function() {
    return this.send('cancel');
  },
  validate(model) {
    const errors = model.validationErrors();
    if ( errors.get('length') )
    {
      this.set('errors', errors);
      return false;
    }
    this.set('errors', null);
    return true;
  },
  getToRecipientValue(recipient) {
    const type = recipient.get('recipientType');
    let out = null;
    switch(type) {
      case 'email':
        out = recipient.emailRecipient.address;
        break
      case 'slack':
        out = recipient.slackRecipient.channel;
        break
      case 'pagerduty':
        out = recipient.pagerdutyRecipient.serviceKey;
        break
      default:
      }
    return out;
  },
  validateRecipient(recipient) {
    if (!recipient.get('isReuse')) {
      const recipientType = recipient.get('recipientType');
      if (!recipientType) {
        this.set('errors', ['Notifier is required for new recipient']);
        return false;
      }
      const input = this.getToRecipientValue(recipient);
      if (!input) {
        this.set('errors', ['Recipient is required']);
        return false;
      }
      const ok = this.validate(recipient);
      if (!ok) {
        return false;
      }
    }
    // Don't need to create new recipient, so just let go.
    return true;
  },
  // Todo: can be improved by no firing save request to server
  // when alerts haven't chagned.
  saveOneByOne(idx, cb) {
    const alerts = this.get('alerts');
    if (idx === alerts.length) {
      // All alerts are saved now
      cb();
      this.doneSaving();
      return;
    }
    const alert = alerts.objectAt(idx);
    const newRecipient = alert.get('newRecipient');
    const isReuse = newRecipient.get('isReuse');
    // Use a existing recipient, don't need to create a new one
    if (isReuse) {
      // Save alert
      alert.save().then((alertData) => {
        this.mergeResult(alertData);
        // Save next alert
        this.saveOneByOne(idx + 1, cb);
      }).catch(err => {
        this.set('errors', [err]);
        cb();
      });
      return;
    }
    // Create new recipient before creating the alert
    newRecipient.save().then(recipient => {
      // Set alert's recipientId
      alert.set('recipientId', recipient.get('id'));
      return alert.save();
    }).then(alertData => {
      // Merge data
      this.mergeResult(alertData);
      // Save next one
      this.saveOneByOne(idx + 1, cb);
    }).catch(err => {
      this.set('errors', [err]);
      cb();
    });
  },
  actions: {
    save(cb) {
      const ok = this.willSave(cb);
      // Has any error?
      if (!ok) {
        cb(false);
      } else {
        // If passed all validation, start to save alerts
        this.saveOneByOne(0, cb);
      }
    },
    addAlert() {
      const alert = this.get('monitoringStore').createRecord({
        type: 'alert',
        sendResolved: false,
        serviceRule: {
          unhealthyPercentage: '30',
        },
      });
      this.get('alerts').pushObject(this.attachNewRecipient(alert));
    },
    cancel() {
      if (this.get('standalone')) {
        this.get('router').transitionTo('alerts');
      }
      // Do noting
    },
    removeAlert(alert) {
      this.get('alerts').removeObject(alert);
    },
  },
  willDestroyElement() {
    const bus = this.get('alertBus');
    bus.off('validateAlerts');
    bus.off('saveAlerts');
  },
});
