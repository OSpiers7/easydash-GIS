//Bar Chart component to visualize GeoJSON data
// This component generates a bar chart based on the selected attributes and filters from the GeoJSON data.

import React from 'react';
import { Bar } from 'react-chartjs-2';
import { FeatureCollection } from 'geojson';

interface GeoJSONChartProps {
  data: FeatureCollection;
  xAttr: string;
  yAttr: string;
  filters: Record<string, string[]>;
  includeNulls: boolean; // Add includeNulls prop
  buckets?: number; // Optional bucket size
}

const GeoJSONChart: React.FC<GeoJSONChartProps> = ({ data, xAttr, yAttr, filters, includeNulls, buckets }) => {
  if (!xAttr || !yAttr) return <p>Please select chart attributes to generate chart.</p>;

  try {
    const labels: string[] = [];
    const values: number[] = [];
    const counts: Record<string, number> = {};

    // If buckets are provided, calculate bucket ranges
    if (buckets) {
      const xValues = data.features
        .map((feature) => feature.properties?.[xAttr])
        .filter((val) => includeNulls || (val !== undefined && val !== null))
        .map((val) => (typeof val === "number" ? val : parseFloat(val as string)))
        .filter((val) => !isNaN(val)) as number[];

      if (xValues.length > 0) {
        const minValue = Math.min(...xValues);
        const maxValue = Math.max(...xValues);
        const bucketRange = (maxValue - minValue) / buckets;

        // Initialize bucket counts
        for (let i = 0; i < buckets; i++) {
          const bucketLabel = `${Math.round(minValue + bucketRange * i)} - ${Math.round(
            minValue + bucketRange * (i + 1)
          )}`;
          counts[bucketLabel] = 0;
        }

        // Count or sum values in each bucket
        data.features.forEach((feature) => {
          const xValue = feature.properties?.[xAttr];
          const yValue = feature.properties?.[yAttr.replace("sum of ", "")];

          if ((includeNulls || (xValue !== undefined && xValue !== null)) && typeof xValue === "number") {
            const bucketIndex = Math.min(
              Math.floor((xValue - minValue) / bucketRange),
              buckets - 1
            );
            const bucketLabel = `${Math.round(minValue + bucketRange * bucketIndex)} - ${Math.round(
              minValue + bucketRange * (bucketIndex + 1)
            )}`;

            if (yAttr === "count") {
              counts[bucketLabel] = (counts[bucketLabel] || 0) + 1;
            } else if (typeof yValue === "number") {
              counts[bucketLabel] = (counts[bucketLabel] || 0) + yValue;
            }
          }
        });
      }
    } else {
      // Default behavior without buckets
      console.log("data in barchart", data);
      console.log("data features in barchart", data.features);
      data.features.forEach((feature) => {
        const xValue = feature.properties?.[xAttr];
        const yValue = feature.properties?.[yAttr.replace("sum of ", "")];

        if (includeNulls || (xValue !== undefined && xValue !== null)) {
          let include = true;
          for (const [attr, filterValues] of Object.entries(filters)) {
            if (filterValues.length > 0 && feature.properties && !filterValues.includes(feature.properties[attr])) {
              include = false;
              break;
            }
          }
          if (include) {
            const key = xValue ?? "Null"; // Use "Null" for null/undefined values
            if (yAttr === "count") {
              counts[key] = (counts[key] || 0) + 1;
            } else if (typeof yValue === "number") {
              counts[key] = (counts[key] || 0) + yValue;
            }
          }
        }
      });
    }

    Object.keys(counts).forEach((key) => {
      labels.push(key);
      values.push(counts[key]);
    });

    const chartData = {
      labels,
      datasets: [
        {
          label: `${xAttr} vs ${yAttr}`,
          data: values,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
        },
      ],
    };

    return <Bar data={chartData} />;
  } catch (error) {
    console.error("Error generating chart:", error);
    return <p>An error occurred while generating the chart. Please try again.</p>;
  }
};

export default GeoJSONChart;
