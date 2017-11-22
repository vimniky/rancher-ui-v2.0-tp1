import Ember from 'ember';

const TARGET_TYPES = [
  {value: 'node', label: 'node'},
  {value: 'deployment', label: 'deployment'},
  {value: 'statefulset', label: 'statefulset'},
  {value: 'daemonset', label: 'daemonset'},
  {value: 'pod', label: 'pod'},
];

export default Ember.Component.extend({
  percent: 30,

  init() {
    this._super();
    this.set('targetTypes', TARGET_TYPES);
    this.setInitialUnavailablePercentage();
  },

  setInitialUnavailablePercentage() {
    const p = this.getUnavailablePercentage();
    if (this.get('model.id') && p) {
      this.set('percent', p);
    }
  },

  targetTypeChanged: function() {
    const p = this.get('percent');
    this.setUnavailablePercentage(p);
  }.observes('model.targetType', 'percent'),

  setUnavailablePercentage(p) {
    const model = this.get('model');
    const t = this.get('model.targetType')
    switch(t) {
    case 'deployment':
      model.set('deploymentRule.unavailablePercentage', p);
      break;
    case 'statefulset':
      model.set('statefulSetRule.unavailablePercentage', p);
      break;
    case 'daemonset':
      model.set('daemonSetRule.unavailablePercentage', p);
      break
    default:
    }
  },

  getUnavailablePercentage() {
    const model = this.get('model');
    const t = this.get('model.targetType')
    let p
    switch(t) {
    case 'deployment':
      p = model.get('deploymentRule.unavailablePercentage');
      break;
    case 'statefulset':
      p = model.get('statefulSetRule.unavailablePercentage');
      break;
    case 'daemonset':
      p = model.get('daemonSetRule.unavailablePercentage');
      break
    default:
    }
    return p;
  },
});
