import Ember from 'ember';
import C from 'ui/utils/constants';

const FILL_COLOR_MAP = {
  active: C.COLORS.SUCCESS,
  deactivated: C.COLORS.WARNING,
  disconnected: C.COLORS.ERROR,
}

export default Ember.Controller.extend({
  hostsActivity: function(){
    return [
      {value: 75, state: 'active'},
      {value: 20, state: 'deactivated'},
      {value: 5, state: 'disconnected'},
    ];
  }.property(),
  hostsMemory:  function(){
    return [
      {value: 20, state: 'used'},
      {value: 35, state: 'allocated'},
     ];
  }.property(),
  hostsStorage: function(){
    return [
      {value: 20, state: 'used'},
      {value: 35, state: 'allocated'},
    ];
  }.property(),
  memoryStroke: C.COLORS.WARNING,
  storageStroke: C.COLORS.SUCCESS,
  hostsActivityTotal: function() {
    return  this.getTotal('hostsActivity');
  }.property('hostsActivity', 'hostsActivity.@each.{value,length}'),
  active: function() {
    return this.getValueByState('hostsActivity', 'active');
  }.property('data', 'data.[]'),
  deactivated: function() {
    return this.getValueByState('hostsActivity', 'deactivated');
  }.property('data', 'data.[]'),
  disconnected: function() {
    return this.getValueByState('hostsActivity', 'disconnected');
  }.property('data', 'data.[]'),
  computedData: function() {
    return this.get('data').map(({value, state}) => ({
      value,
      fill: FILL_COLOR_MAP[state],
    }));
  }.property('data', 'data.[]'),
  getTotal(aryPropName) {
    const data = this.get(aryPropName) || [];
    return data.reduce((sum, v) => sum + v.value, 0);
  },
  getValueByState(aryPropName, state) {
    const total = this.get('total');
    const data = this.get(aryPropName) || [];
    const activeItem = data.filterBy('state', state).get('firstObject');
    return Math.floor(activeItem.value / total * 100);
  },
});
