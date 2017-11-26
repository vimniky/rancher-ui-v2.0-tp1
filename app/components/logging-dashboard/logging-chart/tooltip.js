const div = d3.select('body').append('div')
      .attr('class', 'logging-tooltip arrow_box right')
      .style('display', 'none')

export default function create(opt = {}) {

  const {
    width = 200,
    height = 80,
    padding = 5,
  }  = opt;

  return function(selection) {
    div.style({
      width: width + 'px',
      height: height + 'px',
      padding: padding  + 'px',
    });
    selection.on('mousemove', mousemove);
    selection.on('mouseover', mouseover);
    selection.on('mouseout', mouseout);
  }

  function mouseover(d, i) {
    div.style('display', 'block');
  }

  function mousemove(d, i) {
    console.log(this, d, i);
    const disX = 14;
    const disY = 40;
    const x = d3.event.pageX;
    const y = d3.event.pageY;
    const w = $(window).width();
    const tooltipLeft = (x < (w + 200) / 2);
    const left = tooltipLeft ? (x + disX) : (x - width - disX) ;

    div.classed('left', tooltipLeft)
      .classed('right', !tooltipLeft)
      .style('left', left + 'px')
      .style('top', (y - disY) + 'px');
  }

  function mouseout() {
    div.style('display', 'none');
  }

}
