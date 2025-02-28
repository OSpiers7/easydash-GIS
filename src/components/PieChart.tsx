import React from 'react';
import { Pie } from 'react-chartjs-2';
import { FeatureCollection } from 'geojson';

interface PieChartProps {
  data: FeatureCollection;
  xAttr: string;
}

const PieChart: React.FC<PieChartProps> = ({ data, xAttr }) => {
  if (!xAttr) return <p>Please select chart attributes to generate chart.</p>;

  try {
    const labels: string[] = [];
    const values: number[] = [];

    const counts: Record<string, number> = {};

    data.features.forEach((feature) => {
      const value = feature.properties?.[xAttr];
      if (value) {
        counts[value] = (counts[value] || 0) + 1;
      }
    });

    Object.keys(counts).forEach((key) => {
      labels.push(key);
      values.push(counts[key]);
    });

    const chartData = {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
          ],
        },
      ],
    };

    return <Pie data={chartData} />;
  } catch (error) {
    console.error('Error generating pie chart:', error);
    return <p>An error occurred while generating the pie chart. Please try again.</p>;
  }
};

export default PieChart;