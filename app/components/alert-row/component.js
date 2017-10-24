import Ember from 'ember';

export default Ember.Component.extend({
  intl: Ember.inject.service(),
  model: null,
  tagName: 'TR',
  classNames: 'main-row',
  bulkActions: false,
  rules: function() {
    const ot = this.get('model.objectType');
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
  }.property('model.serviceRule.unhealthyPercentage,model.objectType'),
});
