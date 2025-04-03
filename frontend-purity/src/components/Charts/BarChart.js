import React, { useState, useEffect } from "react";
import Card from "components/Card/Card";
import Chart from "react-apexcharts";
import { barChartOptions } from "variables/charts";

const BarChart = ({ chartData: propChartData, dates }) => {
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
        ...barChartOptions,
        xaxis: {
          ...barChartOptions.xaxis,
          categories: dates || []
        }
      }
    });
  }, [propChartData, dates]);

  return (
    <Card
      py="1rem"
      height={{ sm: "200px" }}
      width="100%"
      bg="linear-gradient(81.62deg, #313860 2.25%, #151928 79.87%)"
      position="relative"
    >
      {chartState.chartData.length > 0 && chartState.chartOptions && (
        <Chart
          options={chartState.chartOptions}
          series={chartState.chartData}
          type="bar"
          width="100%"
          height="100%"
        />
      )}
    </Card>
  );
};

export default BarChart;
