import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['targetType'],
  targetType: 'embedded',

  targetTypeChanged: function() {
    const model = this.get('model');
    const t = this.get('targetType');
    if (model && model.get('targetType') !== t) {
      model.set('targetType', t);
    }
  }.observes('targetType', 'model.targetType'),
});
