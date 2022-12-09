/* globals d3 */
/* globals topojson */

Promise.all([
  d3.json("world-110m.json"),
  d3.csv("Nuclear Data/country-position-nuclear-weapons.csv", d3.autoType),
]).then((data) => {
  const defaultYear = 2022;

  let map = data[0];
  let countries = data[1];

  let position = computeStatusForYear(defaultYear);

  const features = topojson.feature(map, map.objects.countries).features;
  console.log(features);

  const mySelect = document.getElementById("year-category");

  function computeStatusForYear(year) {
    let statusForYear = [];
    let dataForYear = countries.filter((d) => d.Year == year);
    for (let row of dataForYear) {
      let country = row.Entity;
      let status = row.nuclear_weapons_status;
      let record = statusForYear.find((d) => d.Country == country);
      if (!record) {
        record = { Country: country, Status: status };
        statusForYear.push(record);
      }
    }
    return statusForYear;
  }

  mySelect.oninput = function () {
    let year = document.getElementById("year-category").value;
    year = parseInt(year);
    d3.select("svg").remove();
    const countryDIV = document.getElementById("country");
    if (countryDIV.style.display !== "none") {
      countryDIV.style.display = "none";
    }
    position = computeStatusForYear(year);

    filterData(year);
  };

  const yearSelect = document.getElementById("year-value");

  // when the input range changes update the text
  yearSelect.oninput = function () {
    update(+this.value);
  };

  // Initial starting year

  // update the elements
  function update(Year) {
    // adjust the text on the range slider
    d3.select("#year-value").text(Year);
    d3.select("#year-category").property("value", Year);
  }

  let total = 0;

  const filterData = (year) => {
    let restOfCountries = [];
    for (let i = 0; i < features.length; i++) {
      let exist = false;
      for (let j = 0; j < position.length; j++) {
        if (position[j].Country === features[i].properties.name) {
          features[i].properties.Total = position[j].Status;
          exist = true;
        }
      }
      if (!exist) {
        restOfCountries.push(features[i].properties.name);
      }
    }

    const width = 1300;
    const height = 800;

    const projection = d3.geoMercator().fitExtent(
      [
        [0, 0],
        [width, height],
      ],
      topojson.feature(map, map.objects.countries)
    );

    const path = d3.geoPath().projection(projection);
    const color = d3.scaleQuantize(
      d3.extent(features, (d) => d.properties.Total),
      d3.schemeOranges[4]
    );

    const hasWarheads = (data) => {
      if (restOfCountries.includes(data.properties.name)) {
        return "Gray";
      } else {
        return color(data.properties.Total);
      }
    };

    const svg = d3
      .select(".mapchart")
      .append("svg")
      .attr("viewBox", [0, 0, width, height]);

    svg
      .selectAll("path")
      .data(features)
      .join("path")
      .attr("d", path)
      .attr("fill", (d) => hasWarheads(d))
      .on("mouseenter", (event, d) => {
        const pos = d3.pointer(event, window);
        if (d.properties.Total == 0){
          d.properties.Total = "Not Considering Nuclear Weapons"
        }
        else if (d.properties.Total == 1){
          d.properties.Total = "Considering Nuclear Weapons"
        }
        else if (d.properties.Total == 2){
          d.properties.Total = "Pursuing Nuclear Weapons"
        }
        else if (d.properties.Total == 3){
           d.properties.Total = "Possesses Nuclear Weapons"
        } 
        d3.select("#hover-contents")
          .html(
            "<b>Country: " +
              d.properties.name +
              "<br>" +
              "Status: " +
              d.properties.Total +
              "<br>" +
              "Year: " + document.getElementById("year-category").value +
              "<br>"
          );
        d3.select("#hover-contents").classed("hidden", false);
      })
      .on("mouseleave", (event, d) => {
        d3.select("#hover-contents").classed("hidden", true);
      });

    svg
      .append("path")
      .datum(topojson.mesh(map, map.objects.countries))
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("class", "subunit-boundary");
  };
  filterData(2022);

  let rangeMin = 2,
    rangeMax = 50;

  let colorRangeStart = d3.schemeOranges[6][0],
    colorRangeEnd = d3.schemeOranges[6][4];

  // gradient
  let gradientHeight = 60,
    gradientWidth = 300;

  let gradientSvg = d3
    .select("#legend")
    .append("svg")
    .attr("height", gradientHeight)
    .attr("width", gradientWidth);

  let linear = d3
    .scaleLinear()
    .domain([0, 3])
    .range([colorRangeStart, colorRangeEnd]);

  gradientSvg
    .append("g")
    .attr("class", "legendLinear")
    .attr("transform", "translate(10,20)");

  let legendLinear = d3
    .legendColor()
    .shapeWidth(43)
    .cells(4)
    .orient("horizontal")
    .scale(linear)
    .labels(["None", " ", " ", "Possesses"]);

  gradientSvg.select(".legendLinear").call(legendLinear);
});
