import Ember from 'ember';
import draw from './draw';

const timeIntervals = [
  {unit: 'second', value: 1, id: '1s'},
  {unit: 'minute', value: 1, id: '1m'},
  {unit: 'hour', value: 1, id: '1h'},
  {unit: 'day', value: 1, id: '1d'},
  {unit: 'week', value: 1, id: '1w'},
  {unit: 'month', value: 1, id: '1M'},
  {unit: 'year', value: 1, id: '1y'},
];

// const duration = moment.duration(end.diff(startTime));
// const hours = duration.asHours();

export default Ember.Component.extend({
  classNames: ['histogram-chart'],
  chart: null,

  dateRange: null,
  maxBarNum: 80,

  tableData: null,
  histogramData: null,

  init() {
    this._super();
    if (!this.get('dateRange')) {
      this.set('dateRange', {
        from: moment(new Date()).subtract(16, 'minutes').toDate().getTime(),
        to: new Date().getTime(),
      });
    }
    const client = new $.es.Client({
      hosts: 'https://localhost:8000/es',
      // httpAuth: 'username:passowrd',
    });
    if (!this.get('data')) {
      this.set('data', []);
    }
    this.set('client', client);
    this.search();
  },

  getTimeUnit(diff, unitAry) {
    const maxBarNum = this.get('maxBarNum');
    let fact = diff / 1000 / maxBarNum;
    let unit;
    unitAry.some(u => {
      const nextFact = fact / Number(u[0]);
      if (nextFact < 1) {
        unit =  u[1];
        return true;
      }
      fact = nextFact;
      return false;
    });
    return unit;
  },

  computeInterval: function() {
    const defaultInterval = '1m';
    if (!this.get('chart')) {
      return defaultInterval;
    }
    const maxBarNum = this.get('maxBarNum');
    const {x} = this.get('chart');
    if (!x) {
      return defaultInterval;
    }
    const [startTs, endTs] = x.domain();
    let interval = defaultInterval;
    timeIntervals.some(t => {
      const start = moment(startTs.getTime());
      // moment use plur words
      // e.g. start.subtract(1, 'days').
      const end = moment(endTs.getTime()).subtract(t.value * maxBarNum, t.unit + 's');
      if (end.isAfter(start)) {
        // return false to continue
        return false;
      }
      interval = t.id;
      return true;
    });
    return interval;
  },

  search() {
    const thiz = this;
    const options = {
      // index: 'cattle-system-2017.11.13',
      index: '_all',
      type: 'container_log',
      body: {
        from: 0,
        size: 10,
        query: {
          range: {
            '@timestamp': {
              gte: this.get('dateRange').from,
              lt: this.get('dateRange').to,
            },
          }
        },
        aggs: {
          count: {
            date_histogram: {
              field: '@timestamp',
              interval: this.computeInterval(),
            }
          }
        }
      },
    };
    console.log('options------', options);
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
      thiz.set('tableData', tableData)
      const histogramData = aggregations.count.buckets.map(b => {
        return {
          count: b.doc_count,
          date: b.key,
        }
      });
      thiz.set('histogramData', histogramData);
    }, function (error) {
      console.trace(error.message);
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

  updateChart: function() {
    const data = this.get('histogramData');
    if (data) {
      const chart = draw('.histogram-chart .logging-chart', {
        zoomEnd: this.zoomEnd(),
        zoomStart: this.zoomStart(),
        data,
        maxBarNum: this.get('maxBarNum')
      });
      this.set('chart', chart);
    }
  }.observes('histogramData'),

  didInsertElement() {
  },
});
