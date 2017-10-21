import Ember from 'ember';
import C from 'ui/utils/constants';

const FILL_COLOR_MAP = {
  active: C.COLORS.SUCCESS,
  deactivated: C.COLORS.WARNING,
  disconnected: C.COLORS.ERROR,
}

export default Ember.Component.extend({
  classNames: ['host-activity', 'b-1'],
  data: [],
  total: function() {return this.get('data').reduce((sum, v) => sum + v.value, 0);
  }.property('data', 'data.@each.{value,length}'),
  active: function() {
    return this.getValueByState('active');
  }.property('data', 'data.[]'),
  deactivated: function() {
    return this.getValueByState('deactivated');
  }.property('data', 'data.[]'),
  disconnected: function() {
    return this.getValueByState('disconnected');
  }.property('data', 'data.[]'),
  computedData: function() {
    return this.get('data').map(({value, state}) => ({
      value,
      fill: FILL_COLOR_MAP[state],
    }));
  }.property('data', 'data.[]'),
  getValueByState(state) {
    const total = this.get('total');
    const activeItem = this.get('data').filterBy('state', state).get('firstObject');
    return Math.floor(activeItem.value / total * 100);
  },
});
