import Ember from 'ember';
import C from 'ui/utils/constants';

const FILL_COLOR_MAP = {
  active: C.COLORS.SUCCESS,
  deactivated: C.COLORS.WARNING,
  disconnected: C.COLORS.ERROR,
}

export default Ember.Controller.extend({
  application: Ember.inject.controller(),
  host:        Ember.computed.alias('model.host'),
  hostsActivity: function(){
    return {
      active: {value: 20, attr: {fill: FILL_COLOR_MAP.active}},
      deactivated: {value: 50, attr: {fill: FILL_COLOR_MAP.deactivated}},
      disconnected: {value: 50, attr: {fill: FILL_COLOR_MAP.disconnected}},
    };
  }.property(),
  hostsMemory:  function(){
    return {
      used: {value: 20, attr: {fill: FILL_COLOR_MAP.active}},
      allocated: {value: 50, attr: {fill: FILL_COLOR_MAP.deactivated}},
    };
  }.property(),
  hostsStorage: function(){
    return {
      used: {value: 20, attr: {fill: FILL_COLOR_MAP.active}},
      allocated: {value: 50, attr: {fill: FILL_COLOR_MAP.deactivated}},
    };
  }.property(),
  memoryStroke: C.COLORS.WARNING,
  storageStroke: C.COLORS.SUCCESS,
  hostsActivityTotal: function() {
    return  this.getTotal('hostsActivity');
  }.property('hostsActivity', 'hostsActivity.{active,disconnected,deactivated}'),
  getTotal(aryPropName) {
    const data = this.get(aryPropName) || {};
    return Object.keys(data).reduce((sum, key) => sum + data[key].value, 0) || 0;
  },
});
