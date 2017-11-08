import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['target-embedded'],
  actions: {
    activate(idx) {
      Ember.run.schedule('afterRender', () => {
        const $boxes = this.$('.logging-box');
        $boxes.removeClass('active');
        $boxes.eq(idx).addClass('active');
      })
    }
  }
});
