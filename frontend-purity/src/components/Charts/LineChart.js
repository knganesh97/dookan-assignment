import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { lineChartOptions } from "variables/charts";

const LineChart = ({ chartData: propChartData, dates }) => {
  const [chartState, setChartState] = useState({
    chartData: [],
    chartOptions: {}
  });

  useEffect(() => {
    const formattedData = [{
      name: "Events",
      data: propChartData || []
    }];

    setChartState({
      chartData: formattedData,
      chartOptions: {
        ...lineChartOptions,
        xaxis: {
          ...lineChartOptions.xaxis,
          categories: dates || []
        }
      }
    });
  }, [propChartData, dates]);

  return (
    <ReactApexChart
      options={chartState.chartOptions}
      series={chartState.chartData}
      type="area"
      width="100%"
      height="100%"
    />
  );
};

export default LineChart;
