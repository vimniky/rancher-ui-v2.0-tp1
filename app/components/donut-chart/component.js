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
          .outerRadius(outerRadius)
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
  // The function passed to attrTween is invoked for each selected element when
  // the transition starts, and for each element returns the interpolator to use
  // over the course of transition. This function is thus responsible for
  // determining the starting angle of the transition (which is pulled from the
  // element’s bound datum, d.endAngle), and the ending angle (simply the
  // newAngle argument to the enclosing function).
  return function(d) {

    // To interpolate between the two angles, we use the default d3.interpolate.
    // (Internally, this maps to d3.interpolateNumber, since both of the
    // arguments to d3.interpolate are numbers.) The returned function takes a
    // single argument t and returns a number between the starting angle and the
    // ending angle. When t = 0, it returns d.endAngle; when t = 1, it returns
    // newAngle; and for 0 < t < 1 it returns an angle in-between.
    const endAngleInterpolate = d3.interpolate(d.endAngle, newData.endAngle);
    const startAngleInterpolate = d3.interpolate(d.startAngle, newData.startAngle);

    // The return value of the attrTween is also a function: the function that
    // we want to run for each tick of the transition. Because we used
    // attrTween('d'), the return value of this last function will be set to the
    // 'd' attribute at every tick. (It’s also possible to use transition.tween
    // to run arbitrary code for every tick, say if you want to set multiple
    // attributes from a single function.) The argument t ranges from 0, at the
    // start of the transition, to 1, at the end.
    return function(t) {

      // Calculate the current arc angle based on the transition time, t. Since
      // the t for the transition and the t for the interpolate both range from
      // 0 to 1, we can pass t directly to the interpolator.
      //
      // Note that the interpolated angle is written into the element’s bound
      // data object! This is important: it means that if the transition were
      // interrupted, the data bound to the element would still be consistent
      // with its appearance. Whenever we start a new arc transition, the
      // correct starting angle can be inferred from the data.
      d.endAngle = endAngleInterpolate(t);
      d.startAngle = startAngleInterpolate(t);

      // Lastly, compute the arc path given the updated data! In effect, this
      // transition uses data-space interpolation: the data is interpolated
      // (that is, the end angle) rather than the path string itself.
      // Interpolating the angles in polar coordinates, rather than the raw path
      // string, produces valid intermediate arcs during the transition.
      return arc(d);
    };
  };
}
