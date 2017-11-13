import Ember from 'ember';
import draw from './draw';

export default Ember.Component.extend({
  classNames: ['histogram-chart'],
  chart: null,

  timeRancge: null,

  init() {
    this._super();
    const client = new $.es.Client({
      hosts: 'localhost:9200'
    });
  },

  zoomStart() {
    return function() {
    }
  },

  zoomEnd() {
    const thiz = this;
    return function() {
      // if zoom out or pan, fetch new data & update chart
      const {zoom: {scale, translate}, x} = thiz.get('chart')
      // todo
    }
  },

  didInsertElement() {
    const chart = draw('.histogram-chart', {
      zoomEnd: this.zoomEnd(),
      zoomStart: this.zoomStart(),
    });
    this.set('chart', chart);
  },
});
