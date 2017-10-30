import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';

export default Ember.Component.extend(NewOrEdit, {
  // input
  originalModel: null,
  notifierType: null,

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
  // drivers: function() {
  //   return [
  //     {
  //       route: 'admin-tab.settings.auth.activedirectory',
  //       label: 'Active Directory',
  //       css: 'activedirectory',
  //       available: true
  //     },
  //     {
  //       route: 'admin-tab.settings.auth.azuread',
  //       label: 'Azure AD',
  //       css: 'azuread',
  //       available: true
  //     },
  //     {
  //       route: 'admin-tab.settings.auth.github',
  //       label: 'GitHub',
  //       css: 'github',
  //       available: true
  //     },
  //   ];
  // }.property(),
  didReceiveAttrs() {
    const origin = this.get('originalModel');
    if (!origin) {
      this.createNotifier();
    } else {
      this.set('clone', this.get('originalModel').clone());
      this.set('model', this.get('originalModel').clone());
    }
  },
  didInsertElement() {
    Ember.run.later(() => {
      this.$('INPUT[type="text"]')[0].focus();
    }, 250);
  },
  createNotifer() {
    this.get('monitoringStore').createRecord({
      type: 'notifier',
      notifierType: this.get('notifierType'),
      emailConfig: {},
      slackConfig: {},
      pagerdutyConfig: {},
    });
  },
  doneSaving(neu, cb) {
    cb(true);
    this._super(neu);
  },
  editing: function() {
    return !!this.get('clone.id');
  }.property('clone.id'),
});
