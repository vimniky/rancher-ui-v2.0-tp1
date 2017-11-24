import Ember from 'ember';

export default Ember.Component.extend({
  targetType: null,

  init() {
    this._super();
    const store = this.get('monitoringStore');
  },


  showSearch: function() {
    const ts = this.get('targets');
    return ts && ts.get('length') > 10;
  }.property('targets.length'),

  targets: function() {
    const ms =  this.get('monitoringStore');
    return ms.all(this.get('targetType'));
  }.property('targetType'),
});
