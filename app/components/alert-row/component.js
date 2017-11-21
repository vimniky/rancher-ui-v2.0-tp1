import Ember from 'ember';

export default Ember.Component.extend({
  intl: Ember.inject.service(),
  model: null,
  tagName: 'TR',
  classNames: 'main-row',
  bulkActions: false,
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
      out = `Node is ${model.get('nodeRule.condition')}`;
      break;
    default:
      rule = model.get(`${t}Rule.unavailablePercentage`);
      out = `When ${rule}% are unhealthy`;
    }
    return out
  }.property('model.serviceRule.unhealthyPercentage,model.targetType'),
});
