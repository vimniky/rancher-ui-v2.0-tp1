const customTimeFormat = d3.time.format.multi([
  // ['%Lms', function(d) { return d.getMilliseconds(); }],
  ['%Ss', function(d) { return d.getSeconds(); }],
  ['%I:%M', function(d) { return d.getMinutes(); }],
  ['%H:%M', function(d) { return  d.getHours(); }],
  ['%a %d', function(d) { return d.getDay() && d.getDate() != 1; }],
  ['%b %d', function(d) { return d.getDate() != 1; }],
  ['%B', function(d) { return d.getMonth(); }],
  ['%Y', function() { return true; }],
]);

// todos:
// [1]. restict pan range
// [2]. enable zoom out
export default function(element, options = {}) {

  let {
    marginTop = 0,
    marginRight = 0,
    marginBottom = 40,
    marginLeft = 40,
    width,
    height,
    barFill,
    zoomStart = noop => noop,
    zoomEnd = noop => noop,
    data,
    barStroke,
    interval,
    timeRange,
  } = options

  // const currentTimeRange = d3.extent(data, d => new Date(d.date));
  width = width || $(element).width() - marginLeft - marginRight;
  height = (height || 150) - marginTop - marginBottom;

  const timeDomain = [new Date(timeRange.from), new Date(timeRange.to)]
  const x = d3.time.scale()
        .nice()
      .domain(timeDomain)
      .range([0, width]);

  const y = d3.scale.linear()
        .domain([0, d3.max(data, d => d.count)])
        .range([height, 0]);

  const xAxis = d3.svg.axis()
    .scale(x)
    .orient('bottom')
    .ticks(10)
    .tickPadding(10)
    .tickFormat(customTimeFormat)
    .tickSize(6);

  const yAxis = d3.svg.axis()
    .scale(y)
    .orient('left')
    .ticks(5)
    .tickSize(6)
    .tickPadding(10);

  const barAttr = {
    class: 'bar',
    width: d => computeBarWidth(interval),
    height: d => {
      const h =  y(0) - y(d.count)
      return h;
    },
    stroke: barStroke,
    'stroke-width': 1,
    x: d => x(d.date),
    y: d => y(d.count),
    fill: barFill,
  }

  const zoomMin = -Infinity;
  const zoomMax = 100;
  const zoom = d3.behavior.zoom()
    .x(x)
    .scaleExtent([zoomMin, zoomMax])
    .size([width, height])
    .on('zoomstart', zoomStart)
    .on('zoomend', zoomEnd)
    .on('zoom', zoomed);
  const svg = d3.select(element).append('svg')
    .attr('width', width + marginLeft + marginRight)
    .attr('height', height + marginTop + marginBottom)
    .append('g')
    .attr('transform', `translate(${marginLeft},${marginTop})`)
    .call(zoom);
// .on('dblclick.zoom', null)

  svg.append('rect')
    .attr({
      class: 'underlay',
      width,
      height,
    });

  const bars = svg.append('g')
    .attr('class', 'bars')
    .attr('width', width + marginLeft + marginRight)
    .attr('height', height + marginTop + marginBottom)
    .selectAll('.bar')
    .attr(barAttr)
    .data(data);

  // enter
  bars
    .enter()
    .append('rect')
    .attr(barAttr);
  // exit

  bars.exit().remove();

  svg.append('g')
    .append('rect')
    .attr({
      class: 'mask',
      width: marginLeft,
      height: height + marginTop + marginBottom,
      transform: `translate(-${marginLeft},-10)`,
      fill: '#fff',
    })

  svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', `translate(0,${height})`)
    .call(xAxis);

  svg.append('g')
    .attr('class', 'y axis')
    .call(yAxis);

  function zoomed() {
    svg.selectAll('.bars .bar').attr(barAttr);
    svg.select('.x.axis').call(xAxis);
    svg.select('.y.axis').call(yAxis);
  }

  function computeBarWidth(interval) {
    const domain = x.domain();
    const start = moment(domain[0]);
    const end = moment(domain[1]);
    const unit = interval.get('values').objectAt(interval.get('valueIdx'));
    const value = end.diff(start, interval.get('unit'));
    // count can't be zero
    const count = Math.ceil(value / unit) || 1;
    return Math.floor(width / count);
  }

  function update({data, interval, timeRange}) {
    // updata bar attr
    const timeDomain = [new Date(timeRange.from), new Date(timeRange.to)]
    x.domain(timeDomain);
    barAttr.width = d => computeBarWidth(interval)
    const maxCout = d3.max(data, d => d.count);
    y.domain([0, maxCout]);
    svg.select('.x.axis').call(xAxis);
    svg.select('.y.axis').call(yAxis);

    const bars = svg
          .select('.bars')
          .selectAll('.bar')
          .data(data)
          .attr(barAttr);

    // remove
    bars.exit().remove();

    // enter
    bars.enter()
      .append('rect')
      .attr(barAttr);

  }

  // function clicked() {
  //   svg.call(zoom.event); // https://github.com/mbostock/d3/issues/2387

  //   // Record the coordinates (in data space) of the center (in screen space).
  //   const center0 = zoom.center() || [width/2, height/2],
  //         translate0 = zoom.translate(),
  //         coordinates0 = coordinates(center0);
  //   zoom.scale(zoom.scale() * Math.pow(2, +this.getAttribute('data-zoom')));

  //   // Translate back to the center.
  //   const center1 = point(coordinates0);
  //   zoom.translate([
  //     translate0[0] + center0[0] - center1[0],
  //     translate0[1] + center0[1] - center1[1],
  //   ]);

  //   svg.transition().duration(750).call(zoom.event);
  // }

  // function coordinates(point) {
  //   const scale = zoom.scale(),
  //       translate = zoom.translate();
  //   return [
  //     (point[0] - translate[0]) / scale,
  //     (point[1] - translate[1]) / scale,
  //   ];
  // }

  // function point(coordinates) {
  //   const scale = zoom.scale(),
  //       translate = zoom.translate();
  //   return [
  //     coordinates[0] * scale + translate[0],
  //     coordinates[1] * scale + translate[1],
  //   ];
  // }

  // d3.selectAll('button[data-zoom]')
  //   .on('click', clicked);
  // d3.select(`${element} #reset`).on('click', reset);
  // function reset() {
  //   d3.transition().duration(750).tween('zoom', function() {
  //     const ix = d3.interpolate(x.domain(), [0, width]),
  //         iy = d3.interpolate(y.domain(), [0, height]);
  //     return function(t) {
  //       zoom.x(x.domain(ix(t))).y(y.domain(iy(t)));
  //       zoomed();
  //     };
  //   });
  // }

  return {
    update,
    x,
    y,
    xAxis,
    yAxis,
    zoom,
  }
}
