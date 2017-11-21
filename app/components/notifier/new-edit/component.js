import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';

export default Ember.Component.extend(NewOrEdit, {
  // input
  originalModel: null,

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

  doneSaving(neu, cb) {
    cb(true);
    this._super(neu);
  },

  actions: {
    save(cb) {
      Ember.RSVP.resolve(this.willSave()).then(ok => {
        if (!ok) {
          cb(false);
          return false;
        }
        return this.doSave()
          .then(this.didSave.bind(this))
          .then(neu => this.doneSaving(neu, cb))
          .catch((err) => {
            cb();
            this.send('error', err);
            this.errorSaving(err);
          });
      });
    },
    cancel() {
      // after saved/created todo
    }
  },
});
