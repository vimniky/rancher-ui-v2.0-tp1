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
    barGap,
    barStroke,
    barStrokeWidth,
  } = options

  width = width || $(element).width() - marginLeft - marginRight;
  height = (height || 150) - marginTop - marginBottom;

  const timeDomain = d3.extent(data.map(d => d.date));
  const x = d3.time.scale()
      .nice(data.length)
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

  const barAttr = (data) => ({
    class: 'bar',
    width: d => getBarWidth(data),
    height: d => {
      const h =  y(0) - y(d.count)
      return h;
    },
    stroke: barStroke,
    'stroke-width': barStrokeWidth,
    x: d => x(d.date),
    y: d => y(d.count),
    fill: barFill,
  })

  const zoomMin = -Infinity;
  const zoomMax = 1000;
  const zoom = d3.behavior.zoom()
    .x(x)
    .scaleExtent([zoomMin, zoomMax])
    .size([width, height])
    .on('zoomstart', zoomStart)
    .on('zoomend', zoomEnd)
    .on('zoom', zoomed);
  const svg = d3.select(element).select('svg')
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
    .attr(barAttr(data))
    .data(data);

  // enter
  bars
    .enter()
    .append('rect')
    .attr(barAttr(data));
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
    const scale = zoom.scale();
    const attr = svg.selectAll('.bars .bar')
          .attr({
            x: d => x(d.date),
            y: d => y(d.count),
          });
    svg.select('.x.axis').call(xAxis);
    svg.select('.y.axis').call(yAxis);
  }

  function getBarWidth(data) {
    return (width - (data.length * 2 * (barGap + barStrokeWidth))) / data.length;
  }

  function update({data}) {
    // updata bar attr
    const timeDomain = d3.extent(data.map(d => d.date));
    x.domain(timeDomain).nice(data.length);
    const maxCout = d3.max(data, d => d.count);
    y.domain([0, maxCout]);
    svg.select('.x.axis').call(xAxis);
    svg.select('.y.axis').call(yAxis);

    const bars = svg
          .select('.bars')
          .selectAll('.bar')
          .data(data)
          .attr(barAttr(data));

    // remove
    bars.exit().remove();

    // enter
    bars.enter()
      .append('rect')
      .attr(barAttr(data));

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
