import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const LikertBar = ({ data, question }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const width = 600;
    const height = 350;
    const margin = { top: 40, right: 40, bottom: 80, left: 70 };

    d3.select(svgRef.current).selectAll("*").remove();

    // Create SVG element
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("class", "likert-bar-chart");

    // Define scales
    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([margin.left, width - margin.right])
      .padding(0.3);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) * 1.1])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Define color scheme
    const colorScale = d3
      .scaleOrdinal()
      .domain([
        "Strongly Disagree",
        "Disagree",
        "Neutral",
        "Agree",
        "Strongly Agree",
      ])
      .range(["#FF0000", "#FFA500", "#FFFF00", "#00FF00", "#006400"]);

    // Y gridlines
    svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${margin.left},0)`)
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-width + margin.left + margin.right)
          .tickFormat(""),
      )
      .selectAll("line")
      .attr("stroke", "#ddd")
      .attr("stroke-dasharray", "3,3");

    // Add X axis with white tick labels
    const xAxisElement = svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale))
      .attr("class", "axis");
      

    // Add Y axis with white tick labels
    const yAxisElement = svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(
        d3
          .axisLeft(yScale)
          .tickFormat((d) => (d % 1 === 0 ? d : "")),
      )
      .attr("class", "axis");

    yAxisElement.selectAll("text").attr("fill", "white");

    // Create tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden");

    // Draw bars
    svg
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d.label))
      .attr("y", (d) => yScale(d.value))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => height - margin.bottom - yScale(d.value))
      .attr("fill", (d) => colorScale(d.label))
      .on("mouseover", function (event, d) {
        d3.select(this).transition().duration(200).attr("stroke-width", "2px");
        tooltip
          .html(`Count: ${d.value}`)
          .style("visibility", "visible")
          .style("top", event.pageY - 10 + "px")
          .style("left", event.pageX + 10 + "px");

        d3.select(this).attr("fill", d3.rgb(colorScale(d.label)).darker(0.8));
      })
      .on("mousemove", function (event) {
        tooltip
          .style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", function (event, d) {
        tooltip.style("visibility", "hidden");
        d3.select(this)
          .transition()
          .duration(200)
          .attr("stroke-width", "1px")
          .attr("fill", colorScale(d.label));
      });

    // Add chart title
    svg
      .append("text")
      .attr("class", "chart-title")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .text(question);

    // Cleanup: remove tooltip on unmount
    return () => {
      tooltip.remove();
    };
  }, [data, question]);

  return (
    <div className="likert-bar-chart-container">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default LikertBar;
