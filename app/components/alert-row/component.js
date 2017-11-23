import Ember from 'ember';

export default Ember.Component.extend({
  intl: Ember.inject.service(),
  model: null,
  tagName: 'TR',
  classNames: 'main-row',
  bulkActions: false,

  startsAt: function() {
    const state = this.get('model.state');
    if (state === 'active' || state === 'inactive') {
      return 'None';
    }
    return moment(this.get('model.startsAt')).fromNow();
  }.property('model.startsAt'),
  endsAt: function() {
    const state = this.get('model.state');
    if (state === 'active' || state === 'inactive') {
      return 'None';
    }
    return moment(this.get('model.endsAt')).fromNow();
  }.property('model.endsAt'),
  rules: function() {
    const t = this.get('model.targetType');
    const model = this.get('model');
    let rule
    let out;
    switch(t) {
    case 'pod':
      out = 'Pod is unhealthy';
      break;
    case 'node':
      out = `Node is ${(model.get('nodeRuleLabel') || '').toLowerCase()}`;
      break;
    default:
      rule = model.get(`${t}Rule.unavailablePercentage`);
      out = `When ${rule}% are unhealthy`;
    }
    return out
  }.property('model.serviceRule.unhealthyPercentage,model.targetType'),
});
