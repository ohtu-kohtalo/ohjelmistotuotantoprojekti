import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const LikertBar = ({ data, question }) => {
  const chartRef = useRef();

  useEffect(() => {
    const svg = d3.select(chartRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 350;
    const margin = { top: 40, right: 40, bottom: 80, left: 70 };

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

    const svgContainer = svg.attr("width", width).attr("height", height);

    svgContainer
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xScale))
      .attr("class", "axis")
      .selectAll("text")
      .attr("class", "axis-text");

    svgContainer
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale).ticks(6))
      .attr("class", "axis y-axis-label");

    svgContainer
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d.label))
      .attr("y", (d) => yScale(d.value))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => height - margin.bottom - yScale(d.value))
      .attr("fill", (d) => colorScale(d.label))
      .attr("class", "bar")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("fill", d3.rgb(colorScale(d.label)).darker(0.8));
      })
      .on("mouseout", function (event, d) {
        d3.select(this).attr("fill", colorScale(d.label));
      });

    svgContainer
      .append("text")
      .attr("class", "chart-title")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .text(question);
  }, [data]);

  return (
    <div className="chart-container p-4">
      <svg ref={chartRef}></svg>
    </div>
  );
};

export default LikertBar;
