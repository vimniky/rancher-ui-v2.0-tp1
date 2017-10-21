import Ember from 'ember';

export default Ember.Component.extend({
  intl: Ember.inject.service(),
  model: null,
  tagName: 'TR',
  classNames: 'main-row',
  bulkActions: false,
  rules: function() {
    const p = this.get('model.serviceRule.unhealthyPercentage');
    return `When ${p}% are unhealthy`;
  }.property('model.serviceRule.unhealthyPercentage'),
});
