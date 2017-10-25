import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Component.extend({
  classNames: ['host-activity', 'b-1'],
  data: null,
  active: function() {
    return this.getPercentValueByState('active');
  }.property('data', 'data.active'),
  deactivated: function() {
    return this.getPercentValueByState('deactivated');
  }.property('data', 'data.deactivated'),
  disconnected: function() {
    return this.getPercentValueByState('disconnected');
  }.property('data', 'data.disconnected'),
  getPercentValueByState(state) {
    const total = this.get('total');
    const activeItem = this.get(`data.${state}`);
    return Math.floor(activeItem.value / total * 1000) / 10;
  },
});
