/* globals d3*/

export default function StackedAreaChart(container) {
  //initialization
  let margin = { top: 30, right: 50, bottom: 20, left: 50 };
  const width = 700 - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;
  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  let xScale = d3.scaleTime().range([0, width]);

  let yScale = d3.scaleLinear().range([height, 0]);

  const color = d3.scaleOrdinal().range(d3.schemeSet1);
  
  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height})`);

  svg.append("g").attr("class", "y-axis");

  const tooltip = svg
    .append("text")
    .attr("class", "y-title")
    .attr("x", -5)
    .attr("y", -10);

  svg
    .append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

  let selected = null,
    xDomain,
    data;
  //update

  function update(data2) {
    data = data2;
    const keys = selected ? [selected] : data.columns.slice(1);

    let stack = d3
      .stack()
      .keys(keys)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);

    let stackedData = stack(data);
    
    console.log(data);
    
    xScale.domain(xDomain ? xDomain : d3.extent(data, d=>d.Year));

    color.domain(keys);

    yScale.domain([0, d3.max(stackedData, a=>d3.max(a, d=>d[1]))]);
    
    
    const area = d3
      .area()
      .x((d) => xScale(d.data.Year))
      .y1((d) => yScale(d[1]))
      .y0((d) => yScale(d[0]));

    const areas = svg.selectAll(".area").data(stackedData, (d) => d.key);

    areas
      .enter()
      .append("path")
      .attr("stroke", "black")
      .attr("clip-path", "url(#clip)")
      .attr("class", "area")
      .attr("fill", function (d) {
        return color(d.key);
      })
      .merge(areas)
      .attr("d", area)
      .on("mouseover", (event, d, i) => tooltip.text(d.key))
      .on("mouseout", () => tooltip.text(""))
      .on("click", (event, d) => {
        if (selected === d.key) {
          selected = null;
        } else {
          selected = d.key;
        }
        update(data);
      });
    
    areas.exit().remove();

    const xAxis = d3.axisBottom(xScale)
    .tickFormat(d3.format("d"));

    const yAxis = d3.axisLeft(yScale);
  
    svg.select(".x-axis").call(xAxis);
    svg.select(".y-axis").call(yAxis);

    let legend = svg.selectAll('rect')
        .data(['', ...color.domain()])
        .enter()
        .append('rect')
        .attr('class','box')
        .attr('width', 10)
        .attr('height', 10)
        .attr('x', 10)
        .attr('y',(d,i)=>5+i*15)
        .attr('fill', d=>color(d));
    
    let label = svg.selectAll('div')
        .data(['', ...color.domain()])
        .enter()
        .append('text')
        .attr('class','region')
        .text(d=>d)
        .attr('x', 25)
        .attr('y',(d,i)=>14+i*15)
        .attr('text-anchor', 'beginning')
        .attr('font-size',12);
  }

  function filterByDate(range) {
    xDomain = range;
    update(data);
  }
  
  return {
    update,
    filterByDate
  };
}