import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
// import {ip as validateIp} from 'ui/utils/validators';


export default Ember.Component.extend(NewOrEdit, {
  // input
  originalModel: null,

  errors: null,
  targets: function() {
    return [
      {
        route: 'notifiers.slack',
        label: 'Slack',
        css: 'slack',
        available: true,
        disabled: false,
      },
      {
        route: 'notifiers.email',
        label: 'Email',
        css: 'email',
        available: true,
        disabled: false,
      },
      // {
      //   route: 'notifiers.pagerduty',
      //   label: '',
      //   css: 'pagerduty',
      //   available: true,
      //   disabled: false,
      // },
    ];
  }.property(),

  didReceiveAttrs() {
    const origin = this.get('originalModel');
    if (!origin) {
      this.createNotifier();
    } else {
      this.set('clone', this.get('originalModel').clone());
      this.set('model', this.get('originalModel').clone());
    }
  },

  createNotifier() {
    const model = this.get('monitoringStore').createRecord({
      type: 'notifier',
      emailConfig: {},
      slackConfig: {},
      pagerdutyConfig: {},
    });
    this.set('model', model);
  },

  willSave() {
    const url = this.get('app.monitoringEndpoint') + `/notifiers?action=validate&type=${this.get('notifierType')}`
    return this
      .get('monitoringStore')
      .rawRequest({
        url,
        dataType: 'joson',
        method: 'POST',
        data: this.get('model').serialize(),
      });
  },

  validate() {
    const type = this.get('notifierType');
    const model = this.get('model');
    const errors = this.get('errors') || [];
    if (type === 'slack') {
      if (!model.get('slackConfig.slackApiUrl')) {
        errors.push('WebHook URL can\'t be empty');
      }
    }
    if (type === 'email') {
      const config = model.get('emailConfig') || '';
      const [host, port] = config.smtpSmartHost.split(':');
      if (!host) {
        errors.pushObject('Host can\'t be empty');
      }
      if (!port) {
        errors.pushObject('Port can\'t be empty');
      }
      if (!config.smtpAuthPassword) {
        errors.pushObject('Password can\'t be empty');
      }
      if (!config.smtpAuthUsername) {
        errors.pushObject('Username can\'t be empty');
      }
    }
    if (errors.length > 0) {
      this.set('errors', errors);
      return false;
    }
    return true;
  },

  doneSaving(neu, cb) {
    this.mergeResult();
    cb(true);
    this._super(neu);
  },

  actions: {
    save(cb) {
      this.set('errors', null);
      const ok = this.validate();
      if (!ok) {
        cb();
        return;
      }
      this.willSave().then(res => {
        return this.get('model')
          .save()
          .then(res => this.doneSaving(res, cb)).catch(err => {
            this.set('errors', [err]);
          });
      }).catch(err => {
        if (this.get('notifierType') === 'slack') {
          this.set('errors', ['Invalid WebHook URL']);
        } else {
          this.set('errors', ['SMTP configuration validation fialed']);
        }
        cb();
      });

      // Ember.RSVP.resolve(this.willSave()).then(ok => {
      //   if (!ok) {
      //     cb(false);
      //     return false;
      //   }
      //   return this.doSave()
      //     .then(this.didSave.bind(this))
      //     .then(neu => this.doneSaving(neu, cb))
      //     .catch((err) => {
      //       cb();
      //       this.send('error', err);
      //       this.errorSaving(err);
      //     });
      // });
    },
    cancel() {
      // after saved/created todo
    }
  },
});
