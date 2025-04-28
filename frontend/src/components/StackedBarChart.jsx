import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

/**
 * StackedBarChart
 * ────────────────────────────────────────────────────────────────────────────
 * • Skips animation on the very first mount of the component.
 * • Animates normally whenever the xAxis view toggles afterwards.
 */
const StackedBarChart = ({ data = [], xAxis = "age" }) => {
  const svgRef = useRef();
  const wrapperRef = useRef();
  const [dims, setDims] = useState({ width: 0, height: 0 });

  /** Has the *current* view (age / gender) already animated? */
  const hasAnimated = useRef(false);
  /** Tracks the very first mount of the component. */
  const firstMount = useRef(true);

  /* ——— Reset the flag whenever the view switches ——— */
  useEffect(() => {
    hasAnimated.current = false;
  }, [xAxis]);

  /* ——— Responsive sizing ——— */
  useEffect(() => {
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (!w) return;
      const rawH = Math.round(w * 0.6);
      const h = Math.max(320, Math.min(rawH, window.innerHeight * 0.8));
      setDims({ width: w, height: h });
    });
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, []);

  /* ——— Draw / update ——— */
  useEffect(() => {
    if (!data.length || !dims.width) return;

    const { width, height } = dims;
    const margin = { top: 50, right: 30, bottom: 100, left: 60 };

    /* Purge previous svg content */
    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .classed("rounded-xl", true);
    svg.selectAll("*").remove();

    /* —— Group data —— */
    let cats = [],
      grouped = {};
    if (xAxis === "age") {
      cats = ["16", "17", "18", "19", "20", "21", "22", "23", "24", "25"];
      grouped = Object.fromEntries(cats.map((c) => [c, []]));
      data.forEach((d) => {
        const key = d.age?.toString();
        if (grouped[key]) grouped[key].push(d.response);
      });
    } else {
      cats = ["Male", "Female", "Other"];
      grouped = { Male: [], Female: [], Other: [] };
      data.forEach((d) =>
        (grouped[d.gender] || grouped.Other).push(d.response),
      );
    }
    const summary = cats.map((c) => ({
      category: c,
      count: grouped[c].length,
    }));

    /* —— Scales —— */
    const x = d3
      .scaleBand()
      .domain(cats)
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(summary, (d) => d.count) * 1.1])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const colour =
      xAxis === "gender"
        ? d3
            .scaleOrdinal()
            .domain(cats)
            .range(["#3b82f6", "#ec4899", "#8b5cf6"])
        : d3
            .scaleOrdinal()
            .domain(cats)
            .range([
              "#3b82f6",
              "#10b981",
              "#facc15",
              "#8b5cf6",
              "#f87171",
              "#6366f1",
              "#14b8a6",
              "#f472b6",
              "#22c55e",
              "#f59e0b",
            ]);

    /* —— Grid —— */
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(
        d3
          .axisLeft(y)
          .tickSize(-width + margin.left + margin.right)
          .tickFormat(""),
      )
      .selectAll("line")
      .attr("stroke", "#444")
      .attr("stroke-dasharray", "4,4");

    /* —— Axes —— */
    const xAxisG = svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));
    xAxisG.selectAll("text").attr("fill", "#d1d5db").style("font-size", "12px");
    xAxisG
      .append("text")
      .attr("x", width / 2)
      .attr("y", 50)
      .attr("fill", "white")
      .attr("font-weight", "bold")
      .attr("font-size", "14px")
      .text(xAxis);

    const yAxisG = svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format("d")));
    yAxisG.selectAll("text").attr("fill", "#d1d5db").style("font-size", "12px");
    yAxisG
      .append("text")
      .attr("x", -height / 2)
      .attr("y", -45)
      .attr("fill", "white")
      .attr("font-weight", "bold")
      .attr("font-size", "14px")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .text("Respondents");

    /* —— Tooltip —— */
    d3.select("body").selectAll(".chart-tooltip").remove();
    const tooltip = d3
      .select("body")
      .append("div")
      .attr(
        "class",
        "chart-tooltip fixed z-50 pointer-events-none rounded-md " +
          "bg-gray-900 text-white px-3 py-2 text-sm leading-tight shadow-lg",
      )
      .style("visibility", "hidden")
      .style("transform", "translate(-50%, -100%)");

    /* —— Bars —— */
    const bars = svg
      .selectAll("rect.bar")
      .data(summary)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.category))
      .attr("width", x.bandwidth())
      .attr("rx", 6)
      .attr("ry", 6)
      .attr("fill", (d) => colour(d.category))
      .attr("stroke", "#333")
      .attr("stroke-width", 1)
      .on("mouseenter", function (event, d) {
        d3.select(this).attr("stroke-width", 2);
        const rect = this.getBoundingClientRect();
        tooltip
          .html(`<strong>${d.category}</strong><br/>Count: ${d.count}`)
          .style("visibility", "visible")
          .style("left", `${rect.left + rect.width / 2}px`)
          .style("top", `${rect.top}px`);
      })
      .on("mousemove", function () {
        const rect = this.getBoundingClientRect();
        tooltip
          .style("left", `${rect.left + rect.width / 2}px`)
          .style("top", `${rect.top}px`);
      })
      .on("mouseleave", function () {
        tooltip.style("visibility", "hidden");
        d3.select(this).attr("stroke-width", 1);
      });

    /* —— Animate unless this is the very first mount —— */
    const shouldAnimate = !hasAnimated.current && !firstMount.current;

    if (shouldAnimate) {
      bars
        .attr("y", y(0))
        .attr("height", 0)
        .transition()
        .duration(800)
        .attr("y", (d) => y(d.count))
        .attr("height", (d) => height - margin.bottom - y(d.count))
        .on("end", () => (hasAnimated.current = true));
    } else {
      bars
        .attr("y", (d) => y(d.count))
        .attr("height", (d) => height - margin.bottom - y(d.count));
      hasAnimated.current = true;
    }

    /* Mark that the first render has happened */
    if (firstMount.current) firstMount.current = false;

    return () => tooltip.remove();
  }, [data, xAxis, dims]);

  return (
    <div ref={wrapperRef} className="w-full relative">
      <svg ref={svgRef} className="w-full h-auto select-none" />
    </div>
  );
};

export default StackedBarChart;
