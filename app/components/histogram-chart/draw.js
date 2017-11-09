function dataGen(n) {
  const out = [];
  for (; n > 0; n--) {
    let item = {}
    item.count = Math.ceil(Math.random() * 100);
    item.date = moment().subtract(Math.floor(Math.random() * 90), 'days').format('DD/MM/YYYY');
    out.push(item);
  }
  return out;
}
export default function() {
  const width = this.$().width();

  // main-margin
  // l --> left, r --> right, b --> bottom, t --> top
  const mm =  {
    l: 20,
    r: 0,
    t: 5,
    b: 30,
  };

  // overview maring
  const om =  {
    l: 20,
    r: 0,
    t: 0,
    b: 20,
  };

  const mainBarWidth = 15;
  const overviewBarWidth = 5;
  const mainHeight = 120;
  const mainWidth = width - mm.l - mm.r;

  const overviewHeight = 40;
  const overviewWidth = width - om.l - om.r;
  const barColor = '#A3C928';
  const height = mainHeight + overviewHeight + mm.t + mm.b + om.t + om.b;

  const x = d3.time.scale().range([0, mainWidth]);
  const y = d3.scale.linear().range([mainHeight, 0]);
  const xOverview = d3.time.scale().range([0, overviewWidth]);
  const yOverview = d3.scale.linear().range([overviewHeight, 0]);

  const timeFormat = d3.time.format("%m-%d");
  const xAxis = d3.svg.axis().scale(x).orient('bottom').tickFormat(timeFormat);
  const yAxis = d3.svg.axis().scale(y).orient('left').ticks(4);
  const xAxisOverview = d3.svg.axis().scale(xOverview).orient('bottom').tickFormat(timeFormat);

  const svg = d3
        .select(this.$().get(0))
        .append('svg')
        .attr('width', width)
        .attr('height', height);

  const main = svg.append('g')
        .attr('class', 'main')
        .attr('transform', `translate(${mm.l},${mm.t})`);

  const overview = svg.append('g')
        .attr('class', 'overview')
        .attr('transform', `translate(${om.l},${mainHeight + mm.t + mm.b + om.t})`);

  const brush = d3.svg.brush()
        .x(xOverview)
        .on('brush', brushed);
  function parse(d) {
    const parseDate = d3.time.format('%d/%m/%Y').parse;
    return {
      date: parseDate(d.date),
      count: d.count,
    };
  }
  useData(dataGen(100).slice(0, 100).map(parse))
  function useData(data) {
    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([0, d3.max(data, function(d) { return d.count; })]);
    xOverview.domain(x.domain());
    yOverview.domain(y.domain());
    overview
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0,${overviewHeight})`)
      .call(xAxisOverview);

    main.append('g')
      .attr('class', 'bars')
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('width', mainBarWidth)
      .attr('x', function(d) {
        return x(d.date);
      })
      .attr('y', function(d) { return y(d.count); })
      .attr('height', function(d) {
        return y(0) - y(d.count);
      })
      .style('fill', barColor);

    main.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0,${mainHeight})`)
      .call(xAxis);

    main.append('g')
      .attr('class', 'y axis')
      .call(yAxis);

    overview.append('g')
      .attr('class', 'bars')
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', function(d) {
        return xOverview(d.date);
      })
      .attr('width', overviewBarWidth)
      .attr('y', function(d) { return yOverview(d.count); })
      .attr('height', function(d) { return overviewHeight - yOverview(d.count); });

    overview
      .append('g')
      .attr('class', 'x brush')
      .call(brush)
      .selectAll('rect')
      .attr('y', 0)
      .attr('height', overviewHeight);
  }

  function brushed() {
    x.domain(brush.empty() ? xOverview.domain() : brush.extent());
    main
      .selectAll('.bar')
      .attr('transform', function(d) {
        return `translate(${x(d.date)},0)`;
      });
      main.select('.x.axis').call(xAxis);
  }
}
