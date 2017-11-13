import Ember from 'ember';

export default Ember.Component.extend({
  dateFormatChoices: null,
  model: null,
  tags: null,

  dateFormatString: function() {
    const fmt = this.get('model.esLogstashDateformat');
    return moment().format(fmt);
  }.property('model.esLogstashDateformat'),

  dateFormatTypeLabel: function() {
    const fmt = this.get('model.esLogstashDateformat');
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
  }.property('model.esLogstashDateformat'),

  dateFrequenceLabel: function() {
    const fmt = this.get('model.esLogstashDateformat');
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
  }.property('model.esLogstashDateformat'),
});
