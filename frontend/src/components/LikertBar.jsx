import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

/**
 * Dual‑mode bar chart:
 * – Shows present vs. future if futureData is supplied,
 *   otherwise a single Likert distribution.
 * – Fully responsive height (0.6×width, clamped).
 */
const LikertBar = ({ data = [], futureData = [], question = "" }) => {
  const svgRef = useRef();
  const wrapperRef = useRef();
  const [dims, setDims] = useState({ width: 0, height: 0 });

  /* Resize observer */
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

  /* Draw chart */
  useEffect(() => {
    if (!data.length || !dims.width) return;

    const { width, height } = dims;
    const margin = { top: 80, right: 80, bottom: 40, left: 40 };

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .classed("rounded-xl", true);

    svg.selectAll("*").remove();

    /* Determine max for y‑scale */
    const maxVal = Math.max(
      d3.max(data, (d) => d.value),
      futureData.length ? d3.max(futureData, (d) => d.value) : 0
    );

    /* Scales */
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([margin.left, width - margin.right])
      .padding(0.3);

    const y = d3
      .scaleLinear()
      .domain([0, maxVal * 1.1])
      .nice()
      .range([height - margin.bottom, margin.top]);

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

    const yAxisG = svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format("d")));
    yAxisG.selectAll("text").attr("fill", "white");

    /* Tooltip */
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip-fixed")
      .style("visibility", "hidden")
      .style("top", "-9999px")
      .style("left", "-9999px");

    const currentColor = "#4682B4";
    const futureColor = "#8A2BE2";

    if (futureData.length) {
      /* -------- Grouped bars (present + future) -------- */
      const grouped = data.map((d) => ({
        label: d.label,
        current: d.value,
        future: futureData.find((f) => f.label === d.label)?.value || 0,
      }));

      const group = svg
        .selectAll(".bar-group")
        .data(grouped)
        .enter()
        .append("g")
        .attr("class", "bar-group")
        .attr("transform", (d) => `translate(${x(d.label)},0)`);

      /* Present bars */
      group
        .append("rect")
        .attr("x", 0)
        .attr("y", (d) => y(d.current))
        .attr("width", x.bandwidth() / 2)
        .attr("height", (d) => height - margin.bottom - y(d.current))
        .attr("fill", currentColor)
        .on("mouseover", (event, d) => {
          tooltip
            .html(`Present: ${d.current}`)
            .style("visibility", "visible")
            .style("top", `${event.pageY - 10}px`)
            .style("left", `${event.pageX + 10}px`);
        })
        .on("mousemove", (event) =>
          tooltip
            .style("top", `${event.pageY - 10}px`)
            .style("left", `${event.pageX + 10}px`)
        )
        .on("mouseout", () =>
          tooltip
            .style("visibility", "hidden")
            .style("top", "-9999px")
            .style("left", "-9999px")
        );

      /* Future bars */
      group
        .append("rect")
        .attr("x", x.bandwidth() / 2)
        .attr("y", (d) => y(d.future))
        .attr("width", x.bandwidth() / 2)
        .attr("height", (d) => height - margin.bottom - y(d.future))
        .attr("fill", futureColor)
        .on("mouseover", (event, d) => {
          tooltip
            .html(`Future: ${d.future}`)
            .style("visibility", "visible")
            .style("top", `${event.pageY - 10}px`)
            .style("left", `${event.pageX + 10}px`);
        })
        .on("mousemove", (event) =>
          tooltip
            .style("top", `${event.pageY - 10}px`)
            .style("left", `${event.pageX + 10}px`)
        )
        .on("mouseout", () =>
          tooltip
            .style("visibility", "hidden")
            .style("top", "-9999px")
            .style("left", "-9999px")
        );

      /* Legend */
      svg
        .append("circle")
        .attr("cx", width - margin.right + 20)
        .attr("cy", margin.top)
        .attr("r", 8)
        .style("fill", currentColor);
      svg
        .append("text")
        .attr("x", width - margin.right + 35)
        .attr("y", margin.top)
        .attr("alignment-baseline", "middle")
        .attr("fill", "white")
        .style("font-size", "12px")
        .text("Present");

      svg
        .append("circle")
        .attr("cx", width - margin.right + 20)
        .attr("cy", margin.top + 20)
        .attr("r", 8)
        .style("fill", futureColor);
      svg
        .append("text")
        .attr("x", width - margin.right + 35)
        .attr("y", margin.top + 20)
        .attr("alignment-baseline", "middle")
        .attr("fill", "white")
        .style("font-size", "12px")
        .text("Future");
    } else {
      /* -------- Single Likert distribution -------- */
      const colour = d3
        .scaleOrdinal()
        .domain([
          "Strongly Disagree",
          "Disagree",
          "Neutral",
          "Agree",
          "Strongly Agree",
        ])
        .range(["#FF0000", "#FFA500", "#FFFF00", "#00FF00", "#006400"]);

      svg
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", (d) => x(d.label))
        .attr("y", (d) => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", (d) => height - margin.bottom - y(d.value))
        .attr("fill", (d) => colour(d.label))
        .attr("stroke", "#333")
        .attr("stroke-width", 1)
        .on("mouseover", (event, d) => {
          tooltip
            .html(`Count: ${d.value}`)
            .style("visibility", "visible")
            .style("top", `${event.pageY - 10}px`)
            .style("left", `${event.pageX + 10}px`);
        })
        .on("mousemove", (event) =>
          tooltip
            .style("top", `${event.pageY - 10}px`)
            .style("left", `${event.pageX + 10}px`)
        )
        .on("mouseout", () =>
          tooltip
            .style("visibility", "hidden")
            .style("top", "-9999px")
            .style("left", "-9999px")
        );
    }

    /* Title */
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(question);

    return () => tooltip.remove();
  }, [data, futureData, question, dims]);

  return (
    <div ref={wrapperRef} className="w-full">
      <svg ref={svgRef} className="w-full h-auto select-none" />
    </div>
  );
};

export default LikertBar;
