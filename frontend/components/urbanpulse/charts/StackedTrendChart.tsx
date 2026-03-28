"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { useTheme } from "../ThemeProvider";

export function StackedTrendChart() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!canvasRef.current) return;

    const gridColor = theme === "dark" ? "#2a2d38" : "#d4d6dd";
    const tickColor = theme === "dark" ? "#6b7084" : "#6b7084";

    const chart = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          { label: "Waste", data: [12, 18, 14, 22, 31, 16, 8], backgroundColor: "rgba(249,115,22,.8)", stack: "a" },
          { label: "Obstruction", data: [8, 11, 9, 14, 18, 12, 6], backgroundColor: "rgba(234,179,8,.8)", stack: "a" },
          { label: "Streetlight", data: [4, 6, 5, 7, 9, 5, 3], backgroundColor: "rgba(52,211,153,.8)", stack: "a" },
          { label: "Flood", data: [2, 3, 2, 5, 8, 4, 2], backgroundColor: "rgba(56,189,248,.8)", stack: "a" },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { stacked: true, grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 10 } } },
          y: { stacked: true, grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 10 } } },
        },
      },
    });

    return () => chart.destroy();
  }, [theme]);

  return <canvas ref={canvasRef} />;
}
