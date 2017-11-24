import Ember from 'ember';

export default Ember.Component.extend({
  intl: Ember.inject.service(),
  model: null,
  tagName: '',
  bulkActions: false,
  fromNow: function() {
    return moment(this.get('model.timestamp')).fromNow();
  }.property('model.timestamp'),
  timestamp: function() {
    return moment(this.get('model.timestamp')).format('YYYY-MM-DD HH:mm:ss');
  }.property('model.timestamp'),
  _log: function() {
    // return this.get('model.log').replace(/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\d{3}/, '');
    return this.get('model.log');
  }.property('model.log'),
  rules: function() {
    const ot = this.get('model.targetType');
    const p = this.get('model.serviceRule.unhealthyPercentage');
    let out;
    switch(ot) {
    case 'pod':
      out = 'Pod is unhealthy';
      break;
    default:
      out = `When ${p}% are unhealthy`;
    }
    return out
  }.property('model.serviceRule.unhealthyPercentage,model.targetType'),

  expanded: false,

  tdPadding: function() {
    return this.get('expanded') ? 'pv-20' : '';
  }.property('expanded'),

  actions: {
    toggle() {
      this.toggleProperty('expanded');
    }
  }
});
