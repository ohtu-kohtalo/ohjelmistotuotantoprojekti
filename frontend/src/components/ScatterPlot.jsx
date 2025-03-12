import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const ScatterPlot = ({ data, xAxis, clusterBy = "response", title }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const width = 800;
    const height = 650;
    const margin = { top: 50, right: 30, bottom: 50, left: 50 };

    // Remove previous SVG before rendering new one
    d3.select(svgRef.current).selectAll("*").remove();

    // Create SVG element (Transparent background)
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g");

    // Add Title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "24px")
      .attr("font-weight", "bold")
      .attr("fill", "white");

    // Check if X-Axis is categorical
    const isCategorical = typeof data[0][xAxis] === "string";

    // Define X scale
    const xScale = isCategorical
      ? d3
          .scaleBand()
          .domain([...new Set(data.map((d) => d[xAxis]))])
          .range([margin.left, width - margin.right])
          .padding(0.5)
      : d3
          .scaleLinear()
          .domain([
            d3.min(data, (d) => d[xAxis]) * 0.9,
            d3.max(data, (d) => d[xAxis]) * 1.1,
          ])
          .range([margin.left, width - margin.right]);

    // Define Y scale (Response Score is always numeric)
    const yScale = d3
      .scaleLinear()
      .domain([1, 5]) // Likert scale from 1 to 5
      .range([height - margin.bottom, margin.top]);

    // Define color scale (Light-friendly colors)
    const colorScale = d3
      .scaleOrdinal()
      .domain([...new Set(data.map((d) => d[clusterBy]))])
      .range(["#ff7f50", "#ffcc00", "#66c2a5", "#5e81ac", "#ff6f61"]);

    // Create tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "white")
      .style("color", "#333")
      .style("padding", "8px")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("visibility", "hidden")
      .style("font-size", "20px")
      .style("box-shadow", "2px 2px 5px rgba(0,0,0,0.2)");

    // Add gridlines
    const gridColor = "#ddd"; // Light grey grid for visibility

    // X Gridlines
    svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(
        isCategorical
          ? d3
              .axisBottom(xScale)
              .tickSize(-height + margin.top + margin.bottom)
              .tickFormat("")
          : d3
              .axisBottom(xScale)
              .tickSize(-height + margin.top + margin.bottom)
              .tickFormat("")
      )
      .selectAll("line")
      .attr("stroke", gridColor)
      .attr("stroke-dasharray", "3,3");

    // Y Gridlines
    svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${margin.left},0)`)
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-width + margin.left + margin.right)
          .tickFormat("")
      )
      .selectAll("line")
      .attr("stroke", gridColor)
      .attr("stroke-dasharray", "3,3");
    // Add X axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(
        isCategorical ? d3.axisBottom(xScale) : d3.axisBottom(xScale).ticks(6)
      )
      .attr("class", "axis")
      .selectAll("text")
      .attr("fill", "white"); // Dark grey text for readability

    // X axis label
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .attr("font-size", "20px")
      .attr("font-weight", "bold")
      .attr("fill", "white")
      .text(xAxis);

    // Add Y axis
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(5))
      .attr("class", "axis")
      .selectAll("text")
      .attr("fill", "white");

    // Y axis label
    svg
      .append("text")
      .attr("x", -height / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("font-size", "20px")
      .attr("font-weight", "bold")
      .attr("fill", "white")
      .text("Response Score");

    // Add data points
    svg
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) =>
        isCategorical
          ? xScale(d[xAxis]) + xScale.bandwidth() / 2
          : xScale(d[xAxis])
      )
      .attr("cy", (d) => yScale(d[clusterBy]))
      .attr("r", 6)
      .attr("fill", (d) => colorScale(d[clusterBy]))
      .attr("stroke", "#333") // Dark stroke for visibility
      .attr("stroke-width", "1px")
      .style("cursor", "pointer")
      .attr("opacity", 0.9)

      // Hover effects
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 8)
          .attr("stroke-width", "2px");

        tooltip.style("visibility", "visible").html(
          `<strong>${d.name}</strong><br>
            ${xAxis}: ${d[xAxis]}<br>
            Response Score: ${d.response}`
        );
      })
      .on("mousemove", function (event) {
        tooltip
          .style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 6)
          .attr("stroke-width", "1px");

        tooltip.style("visibility", "hidden");
      });

    // Cleanup function
    return () => {
      tooltip.remove();
    };
  }, [data, xAxis, clusterBy, title]);

  return (
    <div className="scatterplot-container">
      <h3 className="chart-title">{title || `Distribution of ${xAxis}`}</h3>
      <svg ref={svgRef} />
    </div>
  );
};

export default ScatterPlot;
