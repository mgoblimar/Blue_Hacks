"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { useTheme } from "../ThemeProvider";

type CategoryDonutChartProps = {
  labels: string[];
  values: number[];
  colors: string[];
  cutout?: string;
};

export function CategoryDonutChart({ labels, values, colors, cutout = "65%" }: CategoryDonutChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!canvasRef.current) return;

    const borderColor = theme === "dark" ? "#181a20" : "#ffffff";
    const legendColor = theme === "dark" ? "#6b7084" : "#6b7084";

    const chart = new Chart(canvasRef.current, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: colors,
            borderColor,
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
              color: legendColor,
              font: { size: 10 },
              boxWidth: 10,
              padding: 10,
            },
          },
        },
      },
    });

    return () => chart.destroy();
  }, [labels, values, colors, cutout, theme]);

  return <canvas ref={canvasRef} />;
}
