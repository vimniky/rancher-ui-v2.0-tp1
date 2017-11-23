import Ember from 'ember';

export default Ember.Component.extend({

  currentTarget: Ember.computed.reads('currentLogging.targetType'),

  hasCurrentTarget: function() {
    const cl = this.get('currentLogging');
    return cl.get('enable') && cl.get('targetType');
  }.property('currentLogging.{targetType,enable}'),

  currentCss(type) {
    return this.get('hasCurrentTarget') && type === this.get('currentTarget') ? ' current' : '';
  },

  targets: function() {
    return [
      {
        type: 'embedded',
        label: 'Embedded',
        css: 'embedded' +  this.currentCss('embedded'),
        classNames: '',
        available: true,
        disabled: false,
      },
      {
        type: 'elasticsearch',
        label: 'Elasticsearch',
        css: 'elasticsearch' +  this.currentCss('elasticsearch'),
        available: true,
        disabled: false,
      },
      {
        label: '',
        type: 'splunk',
        css: 'splunk' +  this.currentCss('splunk'),
        available: true,
        disabled: false,
      },
      {
        label: '',
        type: 'kafka',
        css: 'kafka' +  this.currentCss('kafka'),
        available: true,
        disabled: false,
      },
    ].filter(item => {
      return this.get('isClusterLevel') || item.type !== 'embedded';
    });
  }.property('isClusterLevel', 'currentTarget'),
});
