import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const ScatterPlot = ({ data, xAxis, clusterBy = "response" }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const width = 500;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 50, left: 50 };

    // Remove previous SVG before rendering new one
    d3.select(svgRef.current).selectAll("*").remove();

    // Create SVG element
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    // Check if X-Axis is categorical (e.g., gender)
    const isCategorical = typeof data[0][xAxis] === "string";

    // Define X scale (categorical: `scaleBand`, numerical: `scaleLinear`)
    const xScale = isCategorical
      ? d3
          .scaleBand()
          .domain([...new Set(data.map((d) => d[xAxis]))]) // Unique categories
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
      .domain([1, 5]) // Responses are on a Likert scale from 1 to 5
      .range([height - margin.bottom, margin.top]);

    // Define color scale for response clusters
    const colorScale = d3
      .scaleOrdinal()
      .domain([...new Set(data.map((d) => d[clusterBy]))])
      .range(["#FF0000", "#FFA500", "#FFFF00", "#008000", "#0000FF"]);

    // Add X axis
    const xAxisElement = svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(
        isCategorical
          ? d3.axisBottom(xScale) // Categorical axis
          : d3.axisBottom(xScale).ticks(6) // Numerical axis
      );

    xAxisElement
      .append("text")
      .attr("x", width / 2)
      .attr("y", 35)
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .text(xAxis);

    // Add Y axis (Response scores)
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d3.format("d"))) // Format as whole numbers (1-5)
      .append("text")
      .attr("x", -height / 2)
      .attr("y", -40)
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .text("Response Score");

    // Create tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "white")
      .style("padding", "5px")
      .style("border", "1px solid black")
      .style("border-radius", "5px")
      .style("visibility", "hidden")
      .style("font-size", "12px");

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
      ) // Center dots on categorical axis
      .attr("cy", (d) => yScale(d[clusterBy])) // Y-axis is response scores
      .attr("r", 6)
      .attr("fill", (d) => colorScale(d[clusterBy])) // Color based on response scores
      .style("cursor", "pointer")
      .on("mouseover", (event, d) => {
        tooltip.style("visibility", "visible").html(
          `<strong>${d.name}</strong><br>
          ${xAxis}: ${d[xAxis]}<br>
          Response Score: ${d.response}`
        );
      })
      .on("mousemove", (event) => {
        tooltip
          .style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      });

    // Cleanup function
    return () => {
      tooltip.remove();
    };
  }, [data, xAxis, clusterBy]);

  return <svg ref={svgRef} />;
};

export default ScatterPlot;
