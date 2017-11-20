import Ember from 'ember';
import './moment-round';
import draw from './draw';

const intervals = [
  {unit: 'second', value: 1, id: '1s', durationKey: 'asSeconds'},
  {unit: 'minute', value: 1, id: '1m', durationKey: 'asMinutes'},
  {unit: 'hour', value: 1, id: '1h', durationKey: 'asHours'},
  {unit: 'day', value: 1, id: '1d', durationKey: 'asDays'},
  {unit: 'week', value: 1, id: '1w', durationKey: 'asWeeks'},
  {unit: 'month', value: 1, id: '1M', durationKey: 'asMonths'},
  {unit: 'year', value: 1, id: '1y', durationKey: 'asYears'},
];

export default Ember.Component.extend({
  classNames: ['histogram-chart'],
  chart: null,

  maxBarCount: 80,

  marginTop: 5,
  marginRight: 20,
  marginBottom: 40,
  marginLeft: 40,
  width: null,
  height: 150,

  hits: 0,
  tableData: null,
  chartData: null,
  updating: false,

  init() {
    this._super();
    const client = new $.es.Client({
      hosts: 'https://localhost:8000/es',
      // httpAuth: 'username:passowrd',
    });
    if (!this.get('data')) {
      this.set('data', []);
    }
    this.set('client', client);
  },

  computeDateRange() {
    const chart = this.get('chart');
    if (!chart) {
      return {
        from: moment(new Date()).subtract(45, 'minutes').valueOf(),
        to: new Date().getTime(),
      }
    }
    const domain = chart.x.domain();
    return {
      from: domain[0].getTime(),
      to: domain[1].getTime(),
    }
  },

  computeInterval: function() {
    const defaultInterval = intervals[1];
    if (!this.get('chart')) {
      return defaultInterval;
    }
    const maxBarCount = this.get('maxBarCount');
    const {x} = this.get('chart');
    if (!x) {
      return defaultInterval;
    }
    const {from, to} = this.computeDateRange();
    let interval = defaultInterval;
    intervals.some(t => {
      // moment use plur words
      // e.g. start.subtract(1, 'days').
      const start = moment(from);
      const end = moment(to).subtract(t.value * maxBarCount, t.unit + 's');
      if (end.isAfter(start)) {
        // return false to continue
        return false;
      }
      interval = t;
      return true;
    });
    return interval;
  },

  search() {
    const thiz = this;
    const {id, unit, value} = this.computeInterval();
    const {from, to} = this.computeDateRange();
    const options = {
      // index: 'cattle-system-2017.11.10',
      index: 'clusterid-cattle-system*',
      type: '',
      body: {
        from: 0,
        size: 10,
        query: {
          range: {
            '@timestamp': {
              from: moment(from).floor(value, unit + 's').valueOf(),
              to: moment(to).ceil(value, unit + 's').valueOf(),
            },
          }
        },
        aggs: {
          count: {
            date_histogram: {
              field: '@timestamp',
              interval: id,
            }
          }
        }
      },
    };
    console.log('_search', options);
    return this.get('client').search(options).then(function (body) {
      const {hits, aggregations} = body;
      const tableData = hits.hits.map(h => {
        const s = h._source;
        return {
          log: s.log,
          timestamp: s['@timestamp'],
          containerName: s.kubernetes.container_name,
        }
      });
      const chartData = aggregations.count.buckets.map(b => {
        return {
          count: b.doc_count,
          date: b.key,
        }
      });
      thiz.set('hits', hits.total);
      thiz.set('tableData', tableData)
      thiz.set('chartData', chartData);
      return {
        chartData,
        tableData,
      };
    }, function (error) {
      console.trace(error.message);
    });
  },

  zoomTimer: null,
  zoomEnd() {
    const thiz = this;
    return function() {
      const timer = thiz.get('zoomTimer');
      if (timer) {
        Ember.run.cancel(timer)
      }
      // todo
      const t = Ember.run.later(() => {
        thiz.set('updating', true);
        thiz.updateChart();
      }, 1000);
      thiz.set('zoomTimer', t);
    }
  },

  didInsertElement() {
    this.search().then(res => {
      this.initChart(res.chartData);
    })
  },

  initChart() {
    const chart = draw('.histogram-chart .logging-chart', {
      data: this.get('chartData'),
      width: this.get('width'),
      height: this.get('height'),
      barFill: '#A3C928',
      marginTop: this.get('marginTop'),
      marginRight: this.get('marginRight'),
      marginBottom: this.get('marginBottom'),
      marginLeft: this.get('marginLeft'),
      zoomEnd: this.zoomEnd(),
      maxBarCount: this.get('maxBarCount'),
      interval: this.computeInterval(),
      timeRange: this.computeDateRange(),
    });
    this.set('chart', chart);
  },

  updateChart() {
    const chart = this.get('chart');
    this.search().then(res => {
      chart.update({
        data: res.chartData,
        interval: this.computeInterval(),
      });
      this.set('updating', false);
    });
  },

});
