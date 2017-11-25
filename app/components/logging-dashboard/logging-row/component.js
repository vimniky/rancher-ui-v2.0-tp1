import Ember from 'ember';

export default Ember.Component.extend({
  intl: Ember.inject.service(),

  model: null,
  tagName: '',
  bulkActions: false,
  fromNow: function() {
    return moment(this.get('model.timestamp')).fromNow();
  }.property('model.timestamp'),
  timestamp: function() {
    return moment(this.get('model.timestamp')).format('YYYY-MM-DD HH:mm:ss');
  }.property('model.timestamp'),
  _log: function() {
    // return this.get('model.log').replace(/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\d{3}/, '');
    return this.get('model.log');
  }.property('model.log'),
  tdPadding: 'pv-10',

  actions: {
    toggle() {
      this.toggleProperty('expanded');
    }
  }
});
