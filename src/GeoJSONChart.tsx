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
}

const transformGeoJSONForChart = (data: FeatureCollection) => {
  const statusCounts: Record<string, number> = {};

  data.features.forEach((feature) => {
    const status = feature.properties?.OperationStatus;
    if (status) {
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    }
  });

  return {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        label: "Operation Status Count",
        data: Object.values(statusCounts),
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

const GeoJSONChart: React.FC<GeoJSONChartProps> = ({ data }) => {
  if (!data) return <p>No data available</p>;

  const chartData = transformGeoJSONForChart(data);

  return (
    <div style={{ width: "600px", height: "400px" }}>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: "Operation Status Distribution",
            },
          },
          scales: {
            x: { title: { display: true, text: "Operation Status" } },
            y: { title: { display: true, text: "Count" } },
          },
        }}
      />
    </div>
  );
};

export default GeoJSONChart;
