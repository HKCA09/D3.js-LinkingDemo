const margin = { top: 50, right: 70, bottom: 30, left: 50 };

const $chart = d3.select('#area2');
const $svg = $chart.append('svg');
const $plot = $svg.append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

const parseDate = d3.timeParse('%m-%d');

// set up scales
const x = d3.scaleTime();
const y = d3.scaleLinear();

const colour = d3.scaleOrdinal(d3.schemeCategory10);

const xAxis = d3.axisBottom()
  .scale(x)
  .ticks(9);

const yAxis = d3.axisLeft()
  .scale(y)
  .ticks(20);

const line = d3.line()
  .x(d => x(d.date))
  .y(d => y(d.value))
  .curve(d3.curveMonotoneX);

function render() {

  const width = parseInt($chart.node().offsetWidth) - margin.left - margin.right;
  const height = parseInt(width * 0.6) - margin.top - margin.bottom;

  $svg.attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

  x.range([0, width]);
  y.range([height, 0]);

  $plot.select('.axis.x')
    .attr('transform', `translate(0, ${height})`)
    .call(xAxis)
    .select('.domain').remove();

  $plot.select('.axis.y')
    .call(yAxis)
    .call(g => g.select('.tick:last-of-type text').clone()
      .attr('x', 3)
      .attr('text-anchor', 'start')
      .attr('font-weight', 600)
      .text('人数'))
    .select('.domain').remove();

  $plot.select('.baseline')
    .attr('x1', 0)
    .attr('x2', width)
    .attr('y1', y(0))
    .attr('y2', y(0))
    .attr('fill', 'none')
    .attr('stroke', '#000')
    .attr('stroke-width', '1px')
    .attr('shape-rendering', 'crispEdges')
    .attr('stroke-dasharray', '3, 3')

  const path = $plot.selectAll('path')
    .attr('d', d => line(d.values))
    .attr('stroke', d => colour(d.name))
    .attr('opacity', 1)
    .attr('id', (d, i) => `line-${d.name}`)

  path.each((d, i) => {
    const sel = d3.select(`#line-${d.name}`);
    const length = sel.node().getTotalLength();

    sel.attr('stroke-dasharray', `${length} ${length}`)
      .attr('stroke-dashoffset', length)
      .transition()
        .duration(5000)
        .attr('stroke-dashoffset', 0)
  })

  $plot.selectAll('.line-label')
    .attr('transform', d => {
      return `translate(${x(d.value.date)}, ${y(d.value.value)})`;
    })
    .attr('x', 5)
    .attr('dy',d => d.name == '现有疑似' ? -6 : 5)
    .attr('fill', d => colour(d.name))
    .attr('font-weight', 400)
    .text(d => d.name)
    .attr('opacity', 0)
    .transition()
      .delay(4000)
      .duration(200)
      .attr('opacity', 1)
}

function bindData(rawdata) {
	
  const keys = rawdata.columns.filter(key => key != 'date');

  rawdata.forEach(d => {
    d.date = parseDate(d.date);
  })

  const data = keys.map(name => {
    return {
      name,
      values: rawdata.map(d => {
        return {date: d.date, value: +d[name]};
      })
    }
  });

  colour.domain(keys);

  x.domain(d3.extent(rawdata, d => d.date));
  y.domain([
    d3.min(data, c => d3.min(c.values, v => v.value)),
    d3.max(data, c => d3.max(c.values, v => v.value))
  ]).nice();

  const $lines = $plot.append('g')
    .attr('class', 'lines')
    .selectAll('.line')
    .data(data)
    .enter()
    .append('g')
    .attr('class', 'line')

  $lines.append('path')
    .attr('class', 'path')

  $lines.append('text')
    .datum(d => {
      return {
        name: d.name,
        value: d.values[d.values.length - 1]
      }
    })
    .attr('class', 'line-label')
    .attr('opacity', 0)

  $plot.append('g')
    .attr('class', 'axis x');

  $plot.append('g')
    .attr('class', 'axis y');

  $plot.append('line')
    .attr('class', 'baseline')
  
  window.addEventListener('resize', debounce(render, 200));
  render();
}


function init() {
  d3.csv('data/2.csv').then(bindData);
}

init();
