import Ember from 'ember';
const { getOwner } = Ember;
import NewOrEdit from 'ui/mixins/new-or-edit';
import getEnumFieldOptions from 'ui/mixins/get-enum-field-options';
// import {ip as validateIp} from 'ui/utils/validators';

export default Ember.Component.extend(NewOrEdit, getEnumFieldOptions, {
  intl: Ember.inject.service(),

  // input
  targetType: '',
  loggingAuth: null,
  tags: null,

  errors: null,
  targetChoices: null,
  canRedirectToDashboard: function() {
    const cl = this.get('currentLogging')
    const can = cl.get('enable') && cl.get('id')
          && cl.get('targetType') === 'embedded' && this.get('isClusterLevel');
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
    const errors = this.get('errors') || [];
    this.get('tags').forEach(t => {
      if (!t.key || !t.value) {
        errors.pushObject('Tag key or value can\'t be empty.')
      }
    });
    if (errors.length > 0) {
      return false;
    }
    return true;
  },

  dataTypeTransform() {
    this.set('model.esPort', Number(this.get('model.esPort')));
    this.set('model.splunkPort', Number(this.get('model.splunkPort')));
    this.set('model.outputFlushInterval', Number(this.get('model.outputFlushInterval')) || 1);
    this.set('model.targetType', this.get('targetType'));
  },

  validate() {
    const errors = this.get('errors') || [];
    const model = this.get('model');
    switch(this.get('targetType')) {
    case 'elasticsearch':
      if (!model.get('esHost')) {
        errors.pushObject('Host can\'t be empty');
      }
      if (!String(model.get('esPort'))) {
        errors.pushObject('Port can\'t be empty');
      }
      break;
    case 'splunk':
      console.log(this.get('model'))
      console.log(this.get('targetType'))
      if (!model.get('splunkHost')) {
        errors.pushObject('Host can\'t be empty');
      }
      if (!String(model.get('splunkPort'))) {
        errors.pushObject('Port can\'t be empty');
      }
      if (! String(model.get('splunkToken'))) {
        errors.pushObject('Token can\'t be empty');
      }
      break;
    case 'embedded':
    default:
    }
    if (errors.length > 0) {
      this.set('errors', errors);
      return false;
    }
    return true;
  },

  willSave() {
    let ok
    this.set('errors', null);
    this.dataTypeTransform();
    ok = this.validate();
    ok = this.validateTags();
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
        om.save().then(neu => {
          this.set('currentLogging', neu);
        });
      }
    }
  },

  doneSaving(neu, cb) {
    // update the currentLogging afer logging has been saved
    this.set('currentLogging', neu);
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
