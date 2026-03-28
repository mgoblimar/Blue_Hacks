"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export function StackedTrendChart() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const chart = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          { label: "Waste", data: [12, 18, 14, 22, 31, 16, 8], backgroundColor: "rgba(255,125,59,.8)", stack: "a" },
          { label: "Obstruction", data: [8, 11, 9, 14, 18, 12, 6], backgroundColor: "rgba(245,197,24,.8)", stack: "a" },
          { label: "Streetlight", data: [4, 6, 5, 7, 9, 5, 3], backgroundColor: "rgba(58,239,184,.8)", stack: "a" },
          { label: "Flood", data: [2, 3, 2, 5, 8, 4, 2], backgroundColor: "rgba(77,166,255,.8)", stack: "a" },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { stacked: true, grid: { color: "#1e2535" }, ticks: { color: "#5a6070", font: { size: 10 } } },
          y: { stacked: true, grid: { color: "#1e2535" }, ticks: { color: "#5a6070", font: { size: 10 } } },
        },
      },
    });

    return () => chart.destroy();
  }, []);

  return <canvas ref={canvasRef} />;
}
