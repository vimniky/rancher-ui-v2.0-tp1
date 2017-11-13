import Ember from 'ember';
const { getOwner } = Ember;
import NewOrEdit from 'ui/mixins/new-or-edit';
import getEnumFieldOptions from 'ui/mixins/get-enum-field-options';

export default Ember.Component.extend(NewOrEdit, getEnumFieldOptions, {
  intl: Ember.inject.service(),

  // input
  enableTarget: true,
  targetType: '',
  loggingAuth: null,
  tags: null,

  errors: [],
  targetChoices: null,

  noneTargetChanged: function() {
    if (!this.get('enableTarget')) {
      this.set('targetType', 'none');
    }
  }.observes('enableTarget'),

  init() {
    this._super(...arguments);
    if (!this.get('tags')) {
      this.set('tags', []);
    }
    const targetTypeOptions = this.getEnumFieldOptions('targetType', 'logging', 'loggingStore');
    if (!this.get('loggingAuth')) {
      const la = this.get('loggingStore').createRecord({
        type: 'loggingAuth',
        enableNamespaceLogging: false,
      });
      this.set('loggingAuth', la);
    }
    this.set('targetChoices', targetTypeOptions);
  },
  namespaceLoggingAuthChanged: function() {
    // persistent loggingAuth when change
    this.get('loggingAuth').save();
  }.observes('loggingAuth.enableNamespaceLogging'),
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
        esLogstashPrefix: namespace,
        esLogstashFormat: false,
        targetType: this.get('targetType'),
      });
      this.set('model', newLogging);
    }
  },

  validateTags() {
    return this.get('tags').every(t => {
      if (!t.key || !t.value) {
        this.set('errors', ['Tag key or value can\'t be empty.']);
        return false;
      }
      return true;
    });
  },

  willSave() {
    this.set('model.esPort', Number(this.get('model.esPort')) || 9200);
    const ok = this.validateTags();
    if (!ok) {
      return false;
    }
    const tagMap =  {};
    this.get('tags').forEach(tag => {
      tagMap[tag.key] = tag.value;
    });
    this.set('model.outputRecords', tagMap);
    return true;
  },

  actions: {
    save(cb) {
      const targetType = this.get('targetType');
      if (targetType === 'embedded') {
        getOwner(this).lookup('router:main').transitionTo('logging.dashboard');
        cb();
        return;
      }
      Ember.RSVP.resolve(this.willSave()).then(ok => {
        if (!ok) {
          cb(false);
          return false;
        }
        this
          .doSave()
          .then(this.didSave.bind(this))
          .then(neu => this.doneSaving(neu, cb))
          .catch((err) => {
            cb();
            this.send('error', err);
            this.errorSaving(err);
          });
      });
    },
  },

  doneSaving(neu, cb) {
    cb(true);
    this._super(neu);
  },
});
