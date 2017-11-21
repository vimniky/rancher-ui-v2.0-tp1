import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import getEnumFieldOptions from 'ui/mixins/get-enum-field-options';

export default Ember.Component.extend(NewOrEdit, getEnumFieldOptions, {
  projects: Ember.inject.service(),
  router: Ember.inject.service(),
  intl: Ember.inject.service(),
  alertBus: Ember.inject.service('alert-bus'),
  namespace: Ember.computed.reads('projects.namespace'),

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

  // When add alerts to a existing container/service/host, ..., targetId is not null
  // When creating new container/service/host or creating standalone alert, targetId will be null.
  targetId: null,
  isStandalone: function() {
    return this.get('mode') === 'standalone';
  }.property('mode'),
  severities: [],
  targetType: function() {
    const m = this.get('mode');
    switch (m) {
    case 'container':
      return m;
    case 'service':
    case 'global':
    case 'sidekick':
      return 'service';
    default:
      return null;
    }
  }.property('mode'),
  percent: 30,
  creating: function() {
    const originals = this.get('originalModels');
    return originals && originals.length && this.get('editing');
  }.property('editing,originalModels.[]'),
  allowAddMulti: function() {
    return !this.get('isStandalone');
  }.property('editing', 'isStandalone'),
  init() {
    this._super(...arguments);
    const store = this.get('monitoringStore');
    this.set('alerts', []);
    this.set('severities',  this.getEnumFieldOptions('severity', 'alert', 'monitoringStore'));
    this.set('recipients', store.all('recipient'));
    const out = [
      'node',
      'deployment',
      'pod',
      'daemonset',
      'statefulset',
    ].map(store.all.bind(store)).reduce((sum, resources) => sum.pushObjects(resources.get('content')), []);

    this.set('objectChoices', out);

    if (!this.get('isStandalone')) {
      const targetId = this.get('targetId');
      if (targetId) {
        const alerts = store.all('alert').filterBy('targetId', targetId);
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
            alert.set('targetId', id);
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
        namespace: this.get('namespace'),
        sendResolved: false,
        targetType: this.get('targetType'),
        serviceRule: {
          unhealthyPercentage: '30',
        },
      });
      this.get('alerts').pushObject(this.attachNewRecipient(alert));
    },
    cancel() {
      if (this.get('isStandalone')) {
        this.get('router').transitionTo('alerts');
      }
      // Do noting
    },
    removeAlert(alert) {
      this.get('alerts').removeObject(alert);
    },
  },
  attachNewRecipient(alert) {
    const newRecipient = this.get('monitoringStore').createRecord({
      type: 'recipient',
      isReuse: true,
      namespace: this.get('namespace'),
      targetId: alert.get('targetId') || this.get('targetId'),
      recipient: null,
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
  willDestroyElement() {
    const bus = this.get('alertBus');
    bus.off('validateAlerts');
    bus.off('saveAlerts');
  },
});
