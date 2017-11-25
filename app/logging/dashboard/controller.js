import Ember from 'ember';

export default Ember.Controller.extend({
  tableData: null,
  actions: {
    gotoConfigure() {
      Ember.getOwner(this).lookup('route:logging.index').set('preventDirect', true);
      this.transitionToRoute('logging');
    }
  }
});
