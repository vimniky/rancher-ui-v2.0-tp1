import Ember from 'ember';

const SEVERITIES = [
  {label: 'info', value: 'info'},
  {label: 'critical', value: 'critical'},
  {label: 'warning', value: 'warning'},
];

export default Ember.Component.extend({
  severities: null,

  init() {
    this._super();
    this.set('severities', SEVERITIES);
  }
});
