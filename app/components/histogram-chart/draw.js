function dataGen(n) {
  const out = [];
  for (; n > 0; n--) {
    let item = {}
    item.count = Math.ceil(Math.random() * 100);
    item.date = d3.time.hour.offset(new Date(), Math.floor(Math.random() * 24));
    out.push(item);
  }
  return out;
}

// todos:
// [1]. restict pan range
// [2]. enable zoom out
export default function(element) {
  let updating = false;
  const data = dataGen(100).filter((d, i) => i % 2);
  const duration = 400;
  const barWidth = 15;
  const barColor = '#A3C928';
  const margin = {top: 5, right: 0, bottom: 30, left: 40},
      width = $(element).width() - margin.left - margin.right,
      height = 150 - margin.top - margin.bottom;

  const x = d3.time.scale()
      .domain(d3.extent(data, d => d.date))
      .range([0, width]);

  const y = d3.scale.linear()
        .domain([0, d3.max(data, d => d.count)])
        .range([height, 0]);

  const initialBarAttr = {
    class: 'bar',
    width: d => x(d.date) >= 0 ? barWidth : 0,
    height: d => y(0) - y(d.count),
    x: d => x(d.date)  - 20,
    y: d => y(d.count),
  }

  const barAttr = {
    width: d => x(d.date) >= 0 ? barWidth : 0,
    height: d => y(0) - y(d.count),
    x: d => x(d.date) ,
    y: d => y(d.count),
  }

  const xAxis = d3.svg.axis()
    .scale(x)
    .orient('bottom')
    .ticks(10)
    .tickPadding(10)
    .tickSize(6);

  const yAxis = d3.svg.axis()
    .scale(y)
    .orient('left')
    .ticks(5)
    .tickSize(6)
    .tickPadding(10);

  const zoom = d3.behavior.zoom()
      .x(x)
      .scaleExtent([1, 10])
      .size([width, height])
      .on('zoom', zoomed);

  const svg = d3.select(element).append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)
    .call(zoom);
// .on('dblclick.zoom', null)

  svg.append('rect')
    .attr('width', width)
    .attr('height', height);

  const bars = svg.append('g')
    .attr('class', 'bars')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr(initialBarAttr)
    .style('fill', '#fff');

  bars
    .transition()
    .ease('quadOut')
    .duration(duration)
    .attr(barAttr)
    .style('fill', barColor);

  svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis);

  svg.append('g')
    .attr('class', 'y axis')
    .call(yAxis);

  function zoomed() {
    if (updating) {
      return;
    }
    svg.select('.x.axis').call(xAxis);
    svg.select('.y.axis').call(yAxis);
    bars.attr(barAttr)
  }

  function update(data) {
    updating = true;
    x.domain(d3.extent(data, d => d.date));
    y.domain([0, d3.max(data, d => d.count)]);
    svg.select('.x.axis').transition().duration(duration).call(xAxis);
    svg.select('.y.axis').transition().duration(duration).call(yAxis);
    const bars = svg
      .selectAll('.bars .bar')
      .attr(initialBarAttr)
      .data(data);

    bars
      .transition()
      .ease('quadOut')
      .duration(duration * 2)
      .attr(barAttr)
      .each('end', () => updating = false);

    // enter
    bars.enter()
      .append('rect')
      .attr(initialBarAttr)
      .transition()
      .ease('quadOut')
      .duration(duration * 2)
      .attr(barAttr);

    // remove
    bars.exit().remove();
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

  setInterval(() => {
    // update(dataGen(60).filter((d, i) => i % 2));
  }, 5000)
}
