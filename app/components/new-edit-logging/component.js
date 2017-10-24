import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import getEnumFieldOptions from 'ui/mixins/get-enum-field-options';

export default Ember.Component.extend(NewOrEdit, getEnumFieldOptions, {
  intl: Ember.inject.service(),

  // input
  enableClusterLogging: true,
  loggingLevel: null,
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
    return this.get('loggingLevel') === 'cluster';
  }.property('isEnvLevel'),

  didReceiveAttrs() {
    const store = this.get('store');
    if (this.get('originalModel')) {
      this.set('model', this.get('originalModel').clone());
    } else {
      const newLogging = store.createRecord({
        type: 'logging',
        // Todo
        // namespace: 'cattle-system or env',
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
