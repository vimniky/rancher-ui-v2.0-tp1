import Ember from 'ember';

const TIME_UNITS = [
  {
    value: 's',
    label: 'Seconds',
  },
  {
    value: 'm',
    label: 'Minutes',
  },
  {
    value: 'h',
    label: 'Hours',
  },
];

export default Ember.Component.extend({

  value: '',
  timeUnit: null,
  interval: null,

  init() {
    this._super();
    if (typeof this.get('value') !== 'string') {
      this.set('value', '');
    }
  },
  addPlurSuffix(n) {
    return TIME_UNITS.map(item => {
      if (Number(n) === 1) {
        return {
          value: item.value,
          label: item.label.substring(0, item.label.length - 1),
        }
      }
      // don't return item directly
      return {
        value: item.value,
        label: item.label,
      };
    });
  },

  timeUnits: function() {
    const ri = this.get('interval');
    return this.addPlurSuffix(ri);
  }.property('interval'),

  didReceiveAttrs() {
    const value = this.get('value');
    this.set('interval', value.substring(0, value.length -1));
    this.set('timeUnit', value.substring(value.length -1));
  },

  setInterval: function() {
    const n = this.get('interval');
    const unit = this.get('timeUnit')
    this.set('value', n + unit);
  }.observes('interval', 'timeUnit'),
});
