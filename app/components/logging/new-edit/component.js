import Ember from 'ember';
const { getOwner } = Ember;
import NewOrEdit from 'ui/mixins/new-or-edit';
import getEnumFieldOptions from 'ui/mixins/get-enum-field-options';

export default Ember.Component.extend(NewOrEdit, getEnumFieldOptions, {
  intl: Ember.inject.service(),

  // input
  targetType: '',
  loggingAuth: null,
  tags: null,

  errors: null,
  targetChoices: null,
  canRedirectToDashboard: function() {
    const om = this.get('originalModel')
    const can = om.get('enable') && om.get('id')
          && om.get('targetType') === 'embedded' && this.get('isClusterLevel');
    return can;
  }.property('originalModel.{id,targetType,enable}', 'isClusterLevel'),
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

  persistentNamespaceLoggingAuth: function() {
    // persistent loggingAuth when change
    this.get('loggingAuth').save();
  }.observes('loggingAuth.enableNamespaceLogging'),

  isClusterLevel: function() {
    return this.get('namespace') === 'cattle-system';
  }.property('namespace'),

  headerLabel: function() {
    return this.get('intl').t(this.get('isClusterLevel') ? 'loggingPage.header.cluster' : 'loggingPage.header.env');
  }.property('isClusterLevel'),

  didReceiveAttrs() {
    this.set('originalModel', this.get('model').clone());
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
    this.set('model.splunkPort', Number(this.get('model.esPort')) || 9200);
    this.set('model.outputFlushInterval', Number(this.get('model.outputFlushInterval')) || 1);
    this.set('model.targetType', this.get('targetType'));
    const ok = this.validateTags();
    if (!ok) {
      return false;
    }
    const tagMap =  {};
    this.get('tags').forEach(tag => {
      tagMap[tag.key] = tag.value;
    });
    this.set('model.outputTags', tagMap);
    return true;
  },

  actions: {
    save(cb) {
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
    switch(enable) {
      const om = this.get('originalModel');
      if (!enable) {
        om.set('enable', enable);
        om.save();
      }
    }
  },

  doneSaving(neu, cb) {
    const targetType = this.get('targetType');
    if (targetType === 'embedded' && this.get('isClusterLevel')) {
      getOwner(this).lookup('router:main').transitionTo('logging.dashboard');
      cb();
    } else {
      cb(true);
    }
    this._super(neu);
  },
});
