/*globals d3*/

import AreaChart from "./AreaChart.js";
import StackedAreaChart from "./StackedAreaChart.js";
import StackedAreaChart_co from "./StackedAreaChart_co.js";

let stockpile, stockpile_2;

async function loadData(url) {
  let data = await d3.csv(url, d3.autoType);
  return data;
}

async function main() {
  stockpile = await loadData("Nuclear Data/nuclear-countries1.csv");
  stockpile_2 = await loadData("Nuclear Data/nuclear-countries2.csv");

  let total_arr = [];
  stockpile.forEach(function callback(e, i) {
    let total = 0;
    for (const [key, value] of Object.entries(e)) {
      if (key == "Year") continue;
      total += value;
    }
    e.total = total;
    total_arr.push(total);
  });
  
  let total_arr_2 = [];
  stockpile_2.forEach(function callback(e, i) {
    let total = 0;
    for (const [key, value] of Object.entries(e)) {
      if (key == "Year") continue;
      total += value;
    }
    e.total = total;
    total_arr_2.push(total);
  });

  const areaChart = AreaChart(".areaChart");
  areaChart.update(stockpile);

  const stackedAreaChart = StackedAreaChart(".stackedAreaChart");
  stackedAreaChart.update(stockpile);
  
  const areaChart2 = AreaChart(".areaChart2");
  areaChart2.update(stockpile_2);

  const stackedAreaChart2 = StackedAreaChart_co(".stackedAreaChart2");
  stackedAreaChart2.update(stockpile_2);

  areaChart2.on("brushed", (range) => {
    stackedAreaChart2.filterByDate(range);
  });
  
  areaChart.on("brushed", (range) => {
    stackedAreaChart.filterByDate(range);
  });
  
  stackedAreaChart2.on("zoomed", timeRange=> {
        areaChart2.setBrush(timeRange);
    });
  
  stackedAreaChart.on("zoomed", timeRange=> {
        areaChart.setBrush(timeRange);
    });
}

main();