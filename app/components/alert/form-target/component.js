import Ember from 'ember';

export default Ember.Component.extend({
  targetType: null,

  init() {
    this._super();
    const store = this.get('monitoringStore');
  },


  targets: function() {
    const ms =  this.get('monitoringStore');
    return ms.all(this.get('targetType'));
  }.property('targetType'),
});
