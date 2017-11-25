import Ember from 'ember';
import draw from './draw';

const intervals = [
  // {unit: 'second', label: 'second', values: [1, 5, 15], valueIdx: 0, id: 's', durationKey: 'asSeconds'},
  // {unit: 'minute', label: 'minute', values: [1, 5, 15], valueIdx: 0, id: 'm', durationKey: 'asMinutes'},
  {unit: 'minute', label: 'minute', values: [1, 3, 5, 10, 15, 30], valueIdx: 0, id: 'm'},
  {unit: 'hour', label: 'hourly', values: [1, 3, 5, 10], valueIdx: 0, id: 'h'},
  {unit: 'day', label: 'daily', values: [1, 3, 7, 14], valueIdx: 0, id: 'd'},
  {unit: 'week', label: 'weekly', values: [1, 3, 5, 10], valueIdx: 0, id: 'w'},
  {unit: 'month', label: 'monthly', values: [1, 3, 5], valueIdx: 0, id: 'M'},
  {unit: 'year', label: 'yearly', values: [1, 3, 5], valueIdx: 0, id: 'y'},
].map(item => Ember.Object.create(item));

export default Ember.Component.extend({
  classNames: ['histogram-chart'],
  chart: null,

  maxBuckets: 80,

  intervalId: 'm',
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
    this.set('intervals', intervals);
    this.set('client', client);
  },
  getInterValById(id) {
    return this.get('intervals').filterBy('id', id).get('firstObject');
  },
  computedDateRange() {
    const chart = this.get('chart');
    let out
    if (!chart) {
      out = {
        from: moment(new Date()).subtract(45, 'minutes').valueOf(),
        to: new Date().getTime(),
      }
    } else {
      const domain = chart.x.domain();
      out = {
        from: domain[0].getTime(),
        to: domain[1].getTime(),
      }
    }
    this.set('displayDateRange', {
      from: moment(out.from).format('YYYY-MM-DD hh:mm:ss'),
      to: moment(out.to).format('YYYY-MM-DD hh:mm:ss'),
    });
    return out;
  },
  computedInterval: function() {
    const defaultInterval = intervals[0];
    if (!this.get('chart')) {
      return defaultInterval;
    }
    const maxBuckets = this.get('maxBuckets');
    const {x} = this.get('chart');
    const {from, to} = this.computedDateRange();
    let interval = defaultInterval;
    intervals.some(t => {
      // moment use plur
      // e.g. start.subtract(1, 'days').
      const start = moment(from);
      const shouldStop = t.values.some((v, idx) => {
        const end = moment(to).subtract(v * maxBuckets, t.unit + 's');
        if(end.isAfter(start)) {
          // return false to continue
          return false;
        }
        t.set('valueIdx', idx)
        return true
      });
      interval = t;
      if (shouldStop) {
        // return true to stop
        console.log('used-----------', t.unit + t.get('values').objectAt(t.get('valueIdx')));
        return true;
      } else {
        // return true to continue
        return false;
      }
    });
    return interval;
  },

  search() {
    const thiz = this;
    const {id, unit, values, valueIdx} = this.computedInterval();
    const value = values.objectAt(valueIdx);
    const options = {
      // index: 'cattle-system-2017.11.10',
      index: 'clusterid-cattle-system*',
      type: '',
      body: {
        from: 0,
        size: 10,
        query: {
          range: {
            // '@timestamp': {
            //   from: moment(from).floor(value, unit + 's').valueOf(),
            //   to: moment(to).ceil(value, unit + 's').valueOf(),
            // },
            '@timestamp': this.computedDateRange(),
          }
        },
        aggs: {
          count: {
            date_histogram: {
              field: '@timestamp',
              interval: `${value}${id}`,
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
      maxBuckets: this.get('maxBuckets'),
      interval: this.computedInterval(),
      timeRange: this.computedDateRange(),
    });
    this.set('chart', chart);
  },

  updateChart() {
    const chart = this.get('chart');
    this.search().then(res => {
      chart.update({
        data: res.chartData,
        interval: this.computedInterval(),
        timeRange: this.computedDateRange(),
      });
      this.set('updating', false);
    });
  },

});
