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

  initialWaitTimeUnit: null,
  repeatIntervalTimeUnit: null,
  initialWait: null,
  repeatInterval: null,

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

  didReceiveAttrs() {
    const wait = this.get('model.initialWait');
    this.set('initialWait', wait.substring(0, wait.length -1));
    this.set('initialWaitTimeUnit', wait.substring(wait.length -1));

    const interval = this.get('model.repeatInterval');
    this.set('repeatInterval', interval.substring(0, interval.length -1));
    this.set('repeatIntervalTimeUnit', interval.substring(interval.length -1));
  },

  setWait: function() {
    const n = this.get('initialWait');
    const unit = this.get('initialWaitTimeUnit')
    console.log(n, unit);
    this.set('model.initialWait', n + unit);
  }.observes('initialWait', 'initialWaitTimeUnit'),

  setInterval: function() {
    const n = this.get('repeatInterval');
    const unit = this.get('repeatIntervalTimeUnit')
    console.log(n, unit);
    this.set('model.repeatInterval', n + unit);
  }.observes('repeatInterval', 'repeatIntervalTimeUnit'),
  initialWaitTimeUnits: function() {
    const iw = this.get('initialWait');
    return this.addPlurSuffix(iw);
  }.property('initialWait'),
  repeatIntervalTimeUnits: function() {
    const ri = this.get('repeatInterval');
    return this.addPlurSuffix(ri);
  }.property('repeatInterval'),
});
