import Ember from 'ember';

export default Ember.Component.extend({
  dateFormatChoices: null,
  model: null,

  dateFormatString: function() {
    const fmt = this.get('model.outputLogstashDateformat');
    return moment().format(fmt);
  }.property('model.outputLogstashDateformat'),
});
