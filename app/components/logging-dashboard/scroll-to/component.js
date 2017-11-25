import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['bg-link'],
  x: 0,
  y: 0,
  click() {
    this.send('scrollTo');
  },
  didInsertElement() {
    this.$().css({
      position: 'fixed',
      bottom: 20,
      right: 20,
      padding: '4px 10px',
      'text-align': 'center',
      cursor: 'pointer',
      'z-index': 999,
    });
  },
  actions: {
    scrollTo() {
      window.scrollTo(this.get('x'), this.get('y'));
    }
  },
});
