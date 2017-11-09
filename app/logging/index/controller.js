import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['targetType'],
  targetType: 'embedded',

  targetTypeChanged: function() {
    const logging = this.get('model.logging');
    const t = this.get('targetType');
    if (logging && logging.get('targetType') !== t) {
      logging.set('targetType', t);
    }
  }.observes('targetType', 'logging.targetType'),
});
