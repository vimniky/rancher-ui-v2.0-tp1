import Ember from 'ember';

export default Ember.Component.extend({
  expandAll: false,
  didInsertElement() {
    const show = this.element.children.length > 1;
    this.set('showExpanAll', show);
  },
  actions: {
    expandAll: function() {
      this.toggleProperty('expandAll');
    }
  },
  expand: function(item) {
    item.toggleProperty('expanded');
  },
});
