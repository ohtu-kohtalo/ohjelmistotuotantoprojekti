import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

/**
 * Responsive bar‑count chart.
 * Width follows parent; height = 0.6×width, clamped to [320px, 0.8×vh].
 * Tooltip uses .tooltip-fixed util so it never alters document height.
 */
const StackedBarChart = ({ data = [], xAxis = "age" }) => {
  const svgRef = useRef();
  const wrapperRef = useRef();
  const [dims, setDims] = useState({ width: 0, height: 0 });

  /* Resize‑observer */
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

  /* Draw / update */
  useEffect(() => {
    if (!data.length || !dims.width) return;

    const { width, height } = dims;
    const margin = { top: 50, right: 30, bottom: 100, left: 60 };

    /* SVG */
    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .classed("rounded-xl", true);

    svg.selectAll("*").remove();

    /* Data grouping */
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
        (grouped[d.gender] || grouped.Other).push(d.response)
      );
    }
    const summary = cats.map((c) => ({
      category: c,
      count: grouped[c].length,
    }));

    /* Scales */
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

    const colour = d3
      .scaleOrdinal()
      .domain(cats)
      .range([
        "#01AFD2",
        "#FD82B0",
        "#89E2A4",
        "#B82EB7",
        "#F6DC99",
        "#5B8BF7",
        "#C678DD",
        "#80ff80",
        "#FFFF8F",
        "#7BDFF2",
      ]);

    /* Grid */
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(
        d3
          .axisLeft(y)
          .tickSize(-width + margin.left + margin.right)
          .tickFormat("")
      )
      .selectAll("line")
      .attr("stroke", "#444")
      .attr("stroke-dasharray", "4,4");

    /* Axes */
    const xAxisG = svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));
    xAxisG.selectAll("text").attr("fill", "white");
    xAxisG
      .append("text")
      .attr("x", width / 2)
      .attr("y", 50)
      .attr("fill", "white")
      .attr("font-weight", "bold")
      .text(xAxis);

    const yAxisG = svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format("d")));
    yAxisG.selectAll("text").attr("fill", "white");
    yAxisG
      .append("text")
      .attr("x", -height / 2)
      .attr("y", -45)
      .attr("fill", "white")
      .attr("font-weight", "bold")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .text("Respondents");

    /* Tooltip */
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip-fixed")
      .style("visibility", "hidden")
      .style("top", "-9999px")
      .style("left", "-9999px");

    /* Bars */
    svg
      .selectAll("rect")
      .data(summary)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.category))
      .attr("y", (d) => y(d.count))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - margin.bottom - y(d.count))
      .attr("fill", (d) => colour(d.category))
      .attr("stroke", "#333")
      .attr("stroke-width", 1)
      .on("mouseover", function (event, d) {
        d3.select(this).attr("stroke-width", 2);
        tooltip
          .html(`<strong>${d.category}</strong><br/>Count: ${d.count}`)
          .style("visibility", "visible")
          .style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mousemove", (event) =>
        tooltip
          .style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`)
      )
      .on("mouseout", function () {
        tooltip
          .style("visibility", "hidden")
          .style("top", "-9999px")
          .style("left", "-9999px");
        d3.select(this).attr("stroke-width", 1);
      });

    return () => tooltip.remove();
  }, [data, xAxis, dims]);

  return (
    <div ref={wrapperRef} className="w-full">
      <svg ref={svgRef} className="w-full h-auto select-none" />
    </div>
  );
};

export default StackedBarChart;
