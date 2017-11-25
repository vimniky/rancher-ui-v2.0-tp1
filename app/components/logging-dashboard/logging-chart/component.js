import Ember from 'ember';
import draw from './draw';

export default Ember.Component.extend({
  classNames: ['logging-dashboard'],
  chart: null,

  maxBuckets: 150,

  // pagination
  pageSize: 50,
  from: 0,
  to: 1,

  buckets: null,
  intervalId: null,
  marginTop: 5,
  marginRight: 20,
  marginBottom: 40,
  marginLeft: 50,
  width: null,
  height: 150,
  barStroke: '#0075A8',
  barFill: '#A3C928',
  barStrokeWidth: 1,
  interval: null,
  hits: 0,
  logs: null,
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

  quickTimeChanged: function() {
    const chart = this.get('char');
    if (!chart) {
      return;
    }
  }.observes('quickTime'),

  intervaIdChanged: function() {
    Ember.run.next(() => {
      this.updateChart();
    });
  }.observes('intervalId'),

  computedDateRange() {
    const chart = this.get('chart');
    let out
    if (!chart) {
      out = {
        from: moment().subtract(45, 'minutes').valueOf(),
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
    let interval = this.get('intervals').filterBy('id', this.get('intervalId')).get('firstObject');
    let idx = this.get('intervals').indexOf(interval);
    const intervals = this.get('intervals').slice(idx);
    const maxBuckets = this.get('maxBuckets');
    const {from, to} = this.computedDateRange();
    intervals.some(t => {
      const start = moment(from);
      const shouldStop = t.values.some((v, idx) => {
        const end = moment(to).subtract(v * maxBuckets, t.unit);
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
        return true;
      } else {
        // return true to continue
        return false;
      }
    });

    this.set('interval', interval);
    return interval;
  },
  intervalScaleTips: null,
  setIntervalScaleTips: function() {
    const i = this.get('interval');
    if (!i) {
      return;
    }
    const id = i.get('id');
    const idx = i.get('valueIdx');
    if (id !== this.get('intervalId') || idx !== 0) {
      const scale = i.get('values').objectAt(idx);
      const unit = i.get('unit') + 's';
      this.set('intervalScaleTips', Ember.Object.create({
        short: `Scaled to ${scale} ${unit}`,
        verbose: `This interval creates too many buckets to show in the selected time range, so it has been scaled to ${scale} ${unit}`,
      }));
    } else {
      this.set('intervalScaleTips', null);
    }
  }.observes('interval.{id,valueIdx}'),

  search(notAggs = false) {
    const thiz = this;
    const {id, unit, values, valueIdx} = this.computedInterval();
    const value = values.objectAt(valueIdx);
    const query = {
      range: {
        // '@timestamp': {
        //   from: moment(from).floor(value, unit + 's').valueOf(),
        //   to: moment(to).ceil(value, unit + 's').valueOf(),
        // },
        '@timestamp': this.computedDateRange(),
      }
    };
    const aggs = notAggs ? {} : {
      count: {
        date_histogram: {
          field: '@timestamp',
          interval: `${value}${id}`,
        }
      }
    };
    const size = this.get('pageSize') * this.get('to');
    const options = {
      // index: 'cattle-system-2017.11.10',
      index: 'clusterid-cattle-system*',
      type: '',
      body: {
        from: this.get('from'),
        size,
        query,
        aggs,
      }
    };
    console.log('_search', options);
    return this.get('client').search(options).then(function (body) {
      const {hits, aggregations} = body;
      const logs = hits.hits.map(h => {
        const s = h._source;
        return {
          log: s.log,
          timestamp: s['@timestamp'],
          containerName: s.kubernetes.container_name,
        }
      });
      thiz.set('hits', hits.total);
      thiz.set('logs', logs)
      let buckets = [];
      if (!notAggs) {
        buckets = aggregations.count.buckets.map(b => {
          return {
            count: b.doc_count,
            date: b.key,
          }
        });
        thiz.set('buckets', buckets);
      }
      return {
        buckets,
        logs,
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
        thiz.updateChart();
      }, 1000);
      thiz.set('zoomTimer', t);
    }
  },

  didInsertElement() {
    this.search().then(res => {
      this.initChart(res.buckets);
    })
  },

  initChart() {
    const chart = draw('.logging-dashboard .logging-chart', {
      data: this.get('buckets'),
      width: this.get('width'),
      height: this.get('height'),
      barFill: this.get('barFill'),
      barStrokeWidth: this.get('barStrokeWidth'),
      marginTop: this.get('marginTop'),
      marginRight: this.get('marginRight'),
      marginBottom: this.get('marginBottom'),
      marginLeft: this.get('marginLeft'),
      barStroke: this.get('barStroke'),
      zoomEnd: this.zoomEnd(),
      maxBuckets: this.get('maxBuckets'),
      interval: this.computedInterval(),
      timeRange: this.computedDateRange(),
    });
    this.set('chart', chart);
  },
  updateChart() {
    const chart = this.get('chart');
    this.set('updating', true);
    this.search().then(res => {
      chart.update({
        data: res.buckets,
        interval: this.computedInterval(),
        timeRange: this.computedDateRange(),
      });
      this.set('updating', false);
    });
  },
  loader: null,
  actions: {
    loadMore() {
      if (this.get('loader')) {
        return this.get('loader');
      }
      this.incrementProperty('to');
      const loader =  this.search(true).then(res => {
        this.set('loader', null);
      });
      this.set('loader', loader);
      return loader;
    }
  }
});
