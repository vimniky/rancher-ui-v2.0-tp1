import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';

export default Ember.Component.extend(NewOrEdit, {
  intl: Ember.inject.service(),

  // input
  enableClusterLogging: true,
  loggingLevel: null,
  enableEnvLogging: false,

  targetChoices: null,
  dateFormatChoices: null,

  init() {
    this._super(...arguments);
    const targetTypeOptions = this.getEnumOptions('targetType', 'logging');
    const dateFormatOptions = this.getEnumOptions('outputLogstashDateformat', 'logging');
    this.set('targetChoices', targetTypeOptions);
    this.set('dateFormatChoices', dateFormatOptions);
  },

  isClusterLevel: function() {
    return this.get('loggingLevel') === 'cluster';
  }.property('isEnvLevel'),

  getEnumOptions(fieldName, schemaId, storeName = 'loggingStore') {
    let out = []
    if (!schemaId) {
      schemaId = this.get('model.type');
    }
    try {
      out = this.get(storeName).getById('schema', schemaId).get(`resourceFields.${fieldName}.options`);
    } catch(err) {
    }
    return out.map(option => ({value: option, label: option.capitalize()}))
  },
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
