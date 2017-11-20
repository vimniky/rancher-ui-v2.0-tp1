import Ember from 'ember';

export default Ember.Component.extend({
  localizedLabel: false,
  className: null,
  checked: false,
  onLabel: null,
  offLabel: null,
  disabled: false,
  switched: function() {
    if (this.get('checked') === true) {
      this.sendAction('switch', true);
    } else {
      this.sendAction('switch', false);
    }
  }.observes('checked'),
});
