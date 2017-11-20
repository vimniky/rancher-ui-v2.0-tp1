import Ember from 'ember';

export default Ember.Component.extend({

  targets: function() {
    return [
      {
        type: 'elasticsearch',
        label: 'Elasticsearch',
        css: 'elasticsearch',
        available: true,
        disabled: false,
      },
      {
        type: 'embedded',
        label: 'Embedded',
        css: 'embedded',
        available: true,
        disabled: false,
      },
      {
        label: '',
        type: 'splunk',
        css: 'splunk',
        available: true,
        disabled: false,
      },
    ];
  }.property(),
});
