import Ember from 'ember';

export default Ember.Component.extend({
  intl: Ember.inject.service(),
  model: null,
  tagName: 'TR',
  classNames: 'main-row',
  bulkActions: false,
});
