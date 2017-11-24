import Ember from 'ember';

export default Ember.Component.extend({
  brokerTypes: null,

  hostPortStr: '',

  init() {
    this._super();
    const types = this.get('loggingStore')
          .getById('schema', 'logging')
          .optionsFor('kafkaBrokerType')
          .map(v => ({
            value: v,
            label: v,
          }));
    const outputDataTypes = this.get('loggingStore')
          .getById('schema', 'logging')
          .optionsFor('kafkaOutputDataType')
          .map(v => ({
            value: v,
            label: v,
          }));
    this.set('brokerTypes', types);
    this.set('outputDataTypes', outputDataTypes);
  },

  hostPortStrChanged: function() {
    const str = this.get('hostPortStr');
    const t = this.get('kafkaBrokerType');
    if (t === 'broker') {
      this.set('model.kafkaBrokers', str);
    } else if (t === 'zookeeper') {
      this.set('kafkaZookeeper', str);
    }
  }.observes('hostPortStrChanged'),

  addButtonLabel: function() {
    const t =  this.get('model.kafkaBrokerType');
    if (t === 'broker') {
      return 'Add Broker';
    }
    if (t === 'zookeeper') {
      return 'Add Zookeepr';
    }
  }.property('model.kafkaBrokerType'),
});
