import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { FeatureCollection } from "geojson";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface GeoJSONChartProps {
  data: FeatureCollection | null;
  xAttr: string;
  yAttr: string;
}

const transformGeoJSONForChart = (data: FeatureCollection, xAttr: string, yAttr: string) => {
  const counts: Record<string, number> = {};

  data.features.forEach((feature) => {
    const xValue = feature.properties?.[xAttr];
    const yValue = feature.properties?.[yAttr];

    if (xValue !== undefined) {
      if (typeof yValue ==="number") {
        //sum numeric values
        counts[xValue] = (counts[xValue] || 0) + yValue;
      } else {
        //count occurences
        counts[xValue] = (counts[xValue] || 0) + 1
      }
    }
  });

  return {
    labels: Object.keys(counts),
    datasets: [
      {
        label: "${xAttr} vs ${yAttr}",
        data: Object.values(counts),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
        ],
      },
    ],
  };
};

const GeoJSONChart: React.FC<GeoJSONChartProps> = ({ data, xAttr, yAttr }) => {
  if (!xAttr || !yAttr) return <p>Please select attributes to generate the chart.</p>;

  if (!data) return <p>No data available to generate the chart.</p>;
  
  const chartData = transformGeoJSONForChart(data, xAttr, yAttr);

  return (
    <div style={{ width: "600px", height: "400px" }}>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: "Distribution of ${yAttr} by ${xAttr}",
            },
          },
          scales: {
            x: { title: { display: true, text: xAttr } },
            y: { title: { display: true, text: yAttr } },
          },
        }}
      />
    </div>
  );
};

export default GeoJSONChart;
