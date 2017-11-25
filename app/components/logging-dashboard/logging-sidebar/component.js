import Ember from 'ember';


export default Ember.Component.extend({
  quickTimes: null,
  value: null,
  intervalId: null,
  intervals: null,

  shortTips: function() {
    return this.get('intervalScaleTips.short');
  }.property('intervalScaleTips.short'),

  verboseTips: function() {
    return this.get('intervalScaleTips.verbose');
  }.property('intervalScaleTips.verbose'),

});
