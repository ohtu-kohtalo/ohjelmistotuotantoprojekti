import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

/**
 * Responsive bar‑count chart.
 * Width follows parent; height = 0.6×width, clamped to [320px,0.8×vh].
 * Tooltip is positioned from the hovered bar’s bounding box, so it always
 * appears directly above that bar, regardless of where the cursor sits inside.
 */
const StackedBarChart = ({ data = [], xAxis = "age" }) => {
  const svgRef = useRef();
  const wrapperRef = useRef();
  const [dims, setDims] = useState({ width: 0, height: 0 });

  /* ——— Resize observer ——— */
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

    /* —— Data grouping —— */
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

    /* —— Grid —— */
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

    /* —— Axes —— */
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

    /* —— Tooltip (deduplicated, Tailwind utilities) —— */
    d3.select("body").selectAll(".chart-tooltip").remove();
    const tooltip = d3
      .select("body")
      .append("div")
      .attr(
        "class",
        "chart-tooltip fixed z-50 pointer-events-none rounded-md " +
          "bg-black/90 text-white px-3 py-2 text-sm leading-tight"
      )
      .style("visibility", "hidden")
      .style("transform", "translate(-50%, -100%)"); // centre bottom → bar centre

    /* —— Bars —— */
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
      .on("mouseenter", function (event, d) {
        d3.select(this).attr("stroke-width", 2);

        // Calculate bar position in viewport coordinates
        const rect = this.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const topY = rect.top; // top edge of the bar

        tooltip
          .html(`<strong>${d.category}</strong><br/>Count: ${d.count}`)
          .style("visibility", "visible")
          .style("left", `${centerX}px`)
          .style("top", `${topY}px`);
      })
      .on("mousemove", function () {
        // Re‑compute in case the page is scrolling while hovering
        const rect = this.getBoundingClientRect();
        tooltip
          .style("left", `${rect.left + rect.width / 2}px`)
          .style("top", `${rect.top}px`);
      })
      .on("mouseleave", function () {
        tooltip.style("visibility", "hidden");
        d3.select(this).attr("stroke-width", 1);
      });

    return () => tooltip.remove();
  }, [data, xAxis, dims]);

  return (
    <div ref={wrapperRef} className="w-full relative">
      <svg ref={svgRef} className="w-full h-auto select-none" />
    </div>
  );
};

export default StackedBarChart;
