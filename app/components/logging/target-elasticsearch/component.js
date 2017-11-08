import Ember from 'ember';

export default Ember.Component.extend({
  dateFormatChoices: null,
  model: null,

  dateFormatString: function() {
    const fmt = this.get('model.outputLogstashDateformat');
    return moment().format(fmt);
  }.property('model.outputLogstashDateformat'),
  dateFormatTypeLabel: function() {
    const fmt = this.get('model.outputLogstashDateformat');
    switch (fmt) {
    case 'YYYY':
      return 'yearly';
    case 'YYYY.MM':
      return 'monthly';
    case 'YYYY.MM.DD':
      return 'daily';
    default:
      return null;
    }
  }.property('model.outputLogstashDateformat'),
  dateFrequenceLabel: function() {
    const fmt = this.get('model.outputLogstashDateformat');
    switch (fmt) {
    case 'YYYY':
      return 'year';
    case 'YYYY.MM':
      return 'month';
    case 'YYYY.MM.DD':
      return 'day';
    default:
      return null;
    }
  }.property('model.outputLogstashDateformat'),
});
