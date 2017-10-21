import Ember from 'ember';

export default Ember.Component.extend({
  localizedLabel: false,
  className: null,
  checked: false,
  onLabel: null,
  offLabel: null,
  disabled: false,
  actions: {
    switchOn() {
      if (!this.get('disabled')) {
        this.set('checked', true);
      }
    },
    switchOff() {
      if (!this.get('disabled')) {
        this.set('checked', false);
      }
    },
  },
});
