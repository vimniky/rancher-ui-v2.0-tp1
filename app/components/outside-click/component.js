import Ember from 'ember';
import layout from './template';

export default Ember.Component.extend({
  classNames: ['outside-click'],
  layout,
  isOutside: false,
  excludedClasses: [],

  onOutsideClick() {},

  init() {
    this._super(...arguments);
    this.handleDown = this.handleDown.bind(this);
    this.handleUp = this.handleUp.bind(this);
  },

  didInsertElement() {
    this._super(...arguments);
    document.addEventListener('mousedown', this.handleDown, true);
    document.addEventListener('mouseup', this.handleUp, true);
  },

  willDestroyElement() {
    this._super(...arguments);
    document.removeEventListener('mousedown', this.handleDown, true);
    document.removeEventListener('mouseup', this.handleUp, true);
  },

  handleDown(e) {
    if (this.isDestroyed || this.isDestroying) {
      return;
    }

    const isExcluded = this.get('excludedClasses').some((excludedClass) => {
      return ` ${e.target.className} `.indexOf(` ${excludedClass} `) > -1;
    });

    if (!this.element.contains(e.target) && !isExcluded) {
      this.set('isOutside', true);
    }
  },

  handleUp(e) {
    if (this.get('isOutside')) {
      this.get('onOutsideClick')(e);
    }
    if (this.isDestroyed || this.isDestroying) {
      return;
    }
    this.set('isOutside', false);
  }
})
