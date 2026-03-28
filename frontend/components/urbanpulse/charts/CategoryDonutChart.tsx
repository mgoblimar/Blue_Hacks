"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

type CategoryDonutChartProps = {
  labels: string[];
  values: number[];
  colors: string[];
  cutout?: string;
};

export function CategoryDonutChart({ labels, values, colors, cutout = "65%" }: CategoryDonutChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const chart = new Chart(canvasRef.current, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: colors,
            borderColor: "#111318",
            borderWidth: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#5a6070",
              font: { size: 10 },
              boxWidth: 10,
              padding: 10,
            },
          },
        },
      },
    });

    return () => chart.destroy();
  }, [labels, values, colors, cutout]);

  return <canvas ref={canvasRef} />;
}
