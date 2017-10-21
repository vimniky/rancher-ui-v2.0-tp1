import Ember from 'ember';

const TARGETS = ['Elasticsearch', 'Splunk', 'Syslog'];

export default Ember.Controller.extend({
  intl: Ember.inject.service(),
  loggingEnabled: false,
  port: 9200,
  prefix: 'fluentd',
  isEnvLevel: false,
  isClusterLevel: function() {
    return !this.get('isEnvLevel');
  }.property('isEnvLevel'),
  targetChoices: [],
  dateFormatChoices: [],
  typeChoices: [],
  tagKeyChoices: [],
  flushInterval: 1,
  init() {
    this._super(...arguments);
    this.set('allHosts', this.get('store').all('host'));
    const targetChoices = TARGETS.map(target => ({value: target, label: target}));
    this.set('targetChoices', targetChoices);
  },
  hostChoices: function() {
    const list = this.get('allHosts').map((host) => {
      let hostLabel = host.get('displayName');
      if ( host.get('state') !== 'active' ) {
        hostLabel += ' (' + host.get('state') + ')';
      }
      return {
        id: host.get('id'),
        name: hostLabel,
      };
    });
    return list.sortBy('name','id');
  }.property('allHosts.@each.{id,name,state}'),

  actions: {
    save(cb) {
      console.log('saving')
      Ember.run.later(() => {
        cb(true);
        this.sendAction('save');
      }, 300);
    },
    setEvnLevel() {
      this.set('isClusterLevel', false);
    }
  },
});
