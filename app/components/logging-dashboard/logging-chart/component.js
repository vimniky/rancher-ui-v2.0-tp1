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
  intervalIdx: null,
  marginTop: 5,
  marginRight: 20,
  marginBottom: 40,
  marginLeft: 50,
  width: null,
  height: 150,
  barStroke: '#27AA5E',
  barStrokeWidth: 1,
  barGap: 0,
  barFill: '#A3C928',
  hits: 0,
  logs: null,
  updating: false,

  init() {
    this._super();
    const client = new $.es.Client({
      hosts: 'https://127.0.0.1:8000/es',
      // httpAuth: 'username:passowrd',
    });
    if (!this.get('data')) {
      this.set('data', []);
    }
    this.set('client', client);
  },

  quickTimeChanged: function() {
    const chart = this.get('chart');
    if (!chart) {
      return;
    }
    this.chart.svg.remove();
    this.set('chart', null);
    this.update({
      dateRange: this.getDateRange(true),
    });
  }.observes('quickTime'),

  intervaIdxChanged: function() {
    Ember.run.next(() => {
      this.update();
    });
  }.observes('intervalIdx'),

  getDateRange(isQuickTime) {
    const chart = this.get('chart');
    const qt = this.get('quickTime');
    let out
    if (isQuickTime || !chart) {
      out = {
        from: moment().subtract(qt.get('value'), qt.get('unit')).toDate(),
        to: new Date(),
      }
    } else {
      const domain = chart.x.domain();
      console.log(domain)
      out = {
        from: domain[0],
        to: domain[1],
      }
      console.log(out)
    }
    const fmt = 'MMMM Do YYYY, HH:mm:ss';
    this.set('displayDateRange', {
      from: moment(out.from).format(fmt),
      to: moment(out.to).format(fmt),
    });
    return out;
  },

  getInterval: function(dateRange) {
    const idx = this.get('intervalIdx');
    let interval = this.get('intervals').objectAt(idx);
    const intervals = this.get('intervals').slice(idx);
    const maxBuckets = this.get('maxBuckets');
    const {from, to} = dateRange;
    intervals.some(t => {
      const start = moment(from);
      const shouldStop = t.values.some((v, vIdx) => {
        const end = moment(to).subtract(v * maxBuckets, t.unit);
        if(end.isAfter(start)) {
          // return false to continue
          return false;
        }
        t.set('valueIdx', vIdx)
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
    this.setIntervalScaleTips(interval);
    return interval;
  },

  intervalScaleTips: null,
  setIntervalScaleTips(i) {
    const idx = i.get('idx');
    const vIdx = i.get('valueIdx');
    if (idx !== this.get('intervalIdx') || vIdx !== 0) {
      const scale = i.get('values').objectAt(vIdx);
      const unit = i.get('unit') + 's';
      this.set('intervalScaleTips', Ember.Object.create({
        short: `Scaled to ${scale} ${unit}`,
        verbose: `This interval creates too many buckets to show in the selected time range, so it has been scaled to ${scale} ${unit}`,
      }));
    } else {
      this.set('intervalScaleTips', null);
    }
  },


  update(opt = {}) {
    const nextOpt = {
      noAggs: opt.noAggs || false,
      dateRange: opt.dateRange || this.getDateRange(),
    };
    nextOpt.interval = this.getInterval(nextOpt.dateRange),

    this.set('updating', true);
    return this.search(nextOpt).then(res => {

      const {
        logs,
        buckets,
        total,
      } = res;

      this.set('updating', false);
      this.set('logs', logs)

      if (opt.noAggs) {
        // don't update chart
        return res;
      }

      this.set('buckets', buckets);
      this.set('hits', total);

      const chart = this.get('chart');
      const data = res.buckets;
      if (!chart) {
        this.initChart()
      } else {
        chart.update({data});
      }
      return res;
    });
  },

  search({noAggs, dateRange, interval}) {
    const thiz = this;
    const {key, unit, values, valueIdx} = interval;
    const value = values.objectAt(valueIdx);
    const query = {
      range: {
        '@timestamp': dateRange,
      }
    };
    const aggs = noAggs ? {} : {
      count: {
        date_histogram: {
          field: '@timestamp',
          interval: `${value}${key}`,
          // force empty bukect to be returned
          min_doc_count: 0,
          extended_bounds : {
            min : dateRange.from,
            max : dateRange.to,
          },
        },
      },
    };
    const size = this.get('pageSize') * this.get('to');
    const esQuery = {
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
    console.log('esQuery', esQuery);
    return this.get('client').search(esQuery).then(function (body) {
      const {hits, aggregations} = body;
      console.log(body)
      const logs = hits.hits.map(h => {
        const s = h._source;
        return {
          log: s.log,
          timestamp: s['@timestamp'],
          containerName: s.kubernetes.container_name,
        }
      });
      let buckets = [];
      if (!noAggs) {
        buckets = aggregations.count.buckets.map(b => {
          return {
            count: b.doc_count,
            date: b.key,
            dateString: b.key_as_string,
          }
        });
      }
      return {
        buckets,
        logs,
        total: hits.total,
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
        thiz.update();
      }, 1000);
      thiz.set('zoomTimer', t);
    }
  },

  didInsertElement() {
    this.update();
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
      barGap: this.get('barGap'),
      marginLeft: this.get('marginLeft'),
      barStroke: this.get('barStroke'),
      zoomEnd: this.zoomEnd(),
      maxBuckets: this.get('maxBuckets'),
    });
    this.set('chart', chart);
  },

  loader: null,
  actions: {
    loadMore() {
      if (this.get('loader')) {
        return this.get('loader');
      }
      this.incrementProperty('to');
      const loader =  this.update({
        noAggs: true,
      }).then(res => {
        this.set('loader', null);
      });
      this.set('loader', loader);
      return loader;
    }
  }
});
