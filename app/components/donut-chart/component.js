import Ember from 'ember';
import C from 'ui/utils/constants';

const TAU = 2 * Math.PI;
const FILL_COLOR_MAP = {
  active: C.COLORS.SUCCESS,
  deactivated: C.COLORS.WARNING,
  disconnected: C.COLORS.ERROR,
}
const FONT_FAMLIY = '"Prompt", "Helvetica Neue Light", "Helvetica Neue", "Helvetica", "Arial", sans-serif'

export default Ember.Component.extend({
  tagName: 'svg',
  attributeBindings: ['id', 'cssSize:style'],
  id: 'donut-chart',
  // input
  width: 180,
  margin: 0,
  title: null,
  unit: null,
  stroke: null,
  strokeWidth: null,

  paths: [],
  data: [
    {value: 7, state: 'active'},
    {value: 2, state: 'deactivated'},
    {value: 1, state: 'disconnected'},
  ],
  total: function() {
    return this.get('data').reduce((total, v) => total + v.value, 0);
  }.property('data', 'data.@each.value'),
  init() {
    this._super(...arguments);
  },
  // hasData: function() {
  //   if (this.get('data.length') > 0 && !this.get('svg')) {
  //     this.create();
  //   }
  // }.observes('data.length'),
  lastValue: function() {
    var data = this.get('data');
    if (data && data.get('length')) {
      return data.objectAt(data.get('length') - 1);
    }
  }.property('data.[]'),
  didInsertElement() {
    this.create();
  },
  pathData: function() {
    let startAngle = 0
    const out = [];
    this.get('data').forEach(v => {
      const endAngle = startAngle + (v.value / this.get('total'));
      out.pushObject({
        startAngle,
        endAngle,
        fillColor: FILL_COLOR_MAP[v.state],
      });
      startAngle = endAngle;
      return out;
    });
    return out;
  }.property('data', 'data.[]', 'total'),
  cssSize: function() {
    const margin = this.get('margin');
    const width  = this.get('width')+ 2*margin;
    const height = (this.get('height') || width) + 2*margin;
    return new Ember.String.htmlSafe(`width: ${width}px; height: ${height}px`);
  }.property('width', 'height'),
  createPath({startAngle, endAngle, fillColor, opacity = 1}) {
    return this.get('g')
      .append('path')
      .datum({startAngle: startAngle * TAU, endAngle: endAngle * TAU})
      .style('fill', d3.rgb(fillColor).brighter(1 - opacity))
      // .attr('fill-opacity', opacity)
      .attr('d', this.get('arc'));
  },
  computedHeight: function() {
    return this.get('height') || this.get('width');
  }.property('heigth', 'width'),
  computedOuterRaddius: function() {
    const width  = this.get('width');
    const height  = this.get('computedHeight');
    let out= this.get('outerRadius') || Math.min(width, height) / 2
    if (this.get('stroke')) {
      out -= this.get('strokeWidth') || 1;
    }
    return out;
  }.property('outerRadius', 'width'),
  computedInnerRadius: function() {
    return this.get('innerRadius') || this.get('computedOuterRaddius') - 15;
  }.property('computedOuterRaddius', 'innerRadius'),
  create() {
    const margin = this.get('margin');
    const svg = d3.select(this.$()[0]);
    svg.attr('transform', `translate(${margin}, ${margin})`);

    this.set('svg', svg);
    const width = this.get('width');
    const height = this.get('computedHeight');
    const outerRadius = this.get('computedOuterRaddius');
    const innerRadius = this.get('computedInnerRadius');
    const arc = d3.svg.arc()
          .innerRadius(innerRadius)
          .outerRadius(outerRadius);
    const x = width / 2 + margin;
    const y = height / 2 + margin;
    const g = svg.append('g').attr('transform', `translate(${x}, ${y})`);

    // text
    // text-anchor="middle" alignment-baseline="central"
    const text1 = svg.append('text');
    text1
      .attr('x', x)
      .attr('y', y)
      .attr('font-family', FONT_FAMLIY)
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'center')
      .attr('font-size', '24px')
      .attr('font-weight', 600)
      .attr('fill', C.COLORS.SECONDARY)
      .text(this.get('total') + this.get('unit'));

    const text2 = svg.append('text');
    text2
      .attr('x', x)
      .attr('y', y + 20)
      .attr('font-family', FONT_FAMLIY)
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'center')
      .attr('font-size', '14px')
      .attr('fill', C.COLORS.SECONDARY)
      .text(this.get('title'));

    this.set('arc', arc);
    this.set('g', g);
    const backgroundPath = this.createPath({startAngle: 0, endAngle: 1, fillColor: C.COLORS.SUCCESS, opacity: 0.2});
    const stroke = this.get('stroke');
    if (stroke) {
      backgroundPath
        .attr('stroke', stroke)
        .attr('stroke-width', this.get('strokeWidth') || 1);
    }
    this.set('backgroundPath', backgroundPath);
    this.get('pathData').forEach(v => {
      this.get('paths').pushObject(this.createPath(v));
    });
  }
});

function arcTween(newData, arc) {
  return function(d) {
    const endAngleInterpolate = d3.interpolate(d.endAngle, newData.endAngle);
    const startAngleInterpolate = d3.interpolate(d.startAngle, newData.startAngle);
    return function(t) {
      d.endAngle = endAngleInterpolate(t);
      d.startAngle = startAngleInterpolate(t);
      return arc(d);
    };
  };
}
