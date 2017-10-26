import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import getEnumFieldOptions from 'ui/mixins/get-enum-field-options';

export default Ember.Component.extend(NewOrEdit, getEnumFieldOptions, {
  intl: Ember.inject.service(),

  // input
  enableClusterLogging: true,
  enableEnvLogging: false,

  targetChoices: null,
  dateFormatChoices: null,

  init() {
    this._super(...arguments);
    const targetTypeOptions = this.getSelectOptions('targetType', 'logging', 'loggingStore');
    const dateFormatOptions = this.getSelectOptions('outputLogstashDateformat', 'logging', 'loggingStore');
    this.set('targetChoices', targetTypeOptions);
    this.set('dateFormatChoices', dateFormatOptions);
  },
  isClusterLevel: function() {
    return this.get('namespace') === 'system';
  }.property('namespace'),
  headerLabel: function() {
    const ns = this.get('namespace');
    return this.get('intl').t(ns === 'system' ? 'loggingPage.header.cluster' : 'loggingPage.header.env');
  }.property('namespace'),
  didReceiveAttrs() {
    const store = this.get('loggingStore');
    if (this.get('originalModel')) {
      this.set('model', this.get('originalModel').clone());
    } else {
      let namespace = this.get('namespace');
      namespace = namespace === 'system' ? 'cattle-system' : namespace
      const newLogging = store.createRecord({
        type: 'logging',
        namespace,
      });
      this.set('model', newLogging);
    }
  },
  enableClusterLoggingChanged: function() {
    if (this.get('enableClusterLogging')) {
      Ember.run.later(() => {
        this.$('INPUT[type="text"]')[0].focus();
      }, 250);
    }
  }.observes('enableClusterLogging'),
  actions: {
    save(cb) {
      Ember.RSVP.resolve(this.willSave()).then(ok => {
        if (!ok) {
          cb(false);
          return false;
        }
        this.doSave()
          .then(this.didSave.bind(this))
          .then(neu => this.doneSaving(neu, cb))
          .catch((err) => {
            cb();
            this.send('error', err);
            this.errorSaving(err);
          });
      });
    },
    setEvnLevel() {
      this.set('isClusterLevel', false);
    }
  },
  doneSaving(neu, cb) {
    cb(true);
    this._super(neu);
  },
});
