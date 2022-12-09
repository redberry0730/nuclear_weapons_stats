/* globals d3*/

export default function AreaChart(container) {
  //initialization

  const margin = { top: 20, right: 50, bottom: 20, left: 50 };
  const width = 700 - margin.left - margin.right;
  const height = 125 - margin.top - margin.bottom;

  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  let xScale = d3.scaleTime().range([0, width]);

  let yScale = d3.scaleLinear().range([height, 0]);

  svg.append("path").attr("class", "areaChart");

  function update(stockpile) {
    //update
    //console.log(unemployed);
    xScale.domain(d3.extent(stockpile, (d) => d.Year));
    yScale.domain([0, d3.max(stockpile, (d) => d.total)]);

    let xAxis = d3.axisBottom().scale(xScale)
    .tickFormat(d3.format("d"));

// this.canvas.append('g').call(axis)
    // let xAxis = d3.axisBottom(x).tickFormat(d3.format("d"));

    let yAxis = d3.axisLeft().ticks(3).scale(yScale);

    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);

    svg
      .append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(0, ${width}`)
      .call(yAxis);

    svg
      .select(".areaChart")
      .datum(stockpile)
      .attr("stroke", "black")
      .attr("fill", "lightblue")
      .attr(
        "d",
        d3
          .area()
          .x((d) => xScale(d.Year))
          .y1((d) => yScale(d.total))
          .y0(yScale(0))
      );
  }

  //brush

  function brushed(event) {
    if (event.selection) {
      listeners["brushed"](event.selection.map(xScale.invert));
    }
  }

  function brushend(event) {
    if (!event.selection) {
      svg.select(".brush").call(brush.move, xScale.range());
    }
  }

  const brush = d3
    .brushX()
    .extent([
      [0, 0],
      [width, height],
    ])
    .on("brush", brushed)
    .on("end", brushend);

  svg.append("g").attr("class", "brush").call(brush);

  const listeners = { brushed: null };

  function on(event, listener) {
    listeners[event] = listener;
  }

  return {
    update,
    on // ES6 shorthand for "update": update
  };
}