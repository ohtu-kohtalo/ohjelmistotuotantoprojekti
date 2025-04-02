import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const LikertBar = ({ data, futureData, question }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const width = 600;
    const height = 350;
    const margin = { top: 40, right: 80, bottom: 80, left: 30 };

    d3.select(svgRef.current).selectAll("*").remove();

    // Calculate the max value from both data and futureData
    const maxValue = Math.max(
      d3.max(data, (d) => d.value),
      futureData && futureData.length > 0
        ? d3.max(futureData, (d) => d.value)
        : 0,
    );

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
      .domain([0, maxValue * 1.1])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Define color scheme for current data
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

    // Define colors for current and future data
    const currentColor = "#4682B4"; // Current data color (blue)
    const futureColor = "#8A2BE2"; // Future data color (purple)

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
      .call(d3.axisLeft(yScale).tickFormat((d) => (d % 1 === 0 ? d : "")))
      .attr("class", "axis");

    yAxisElement.selectAll("text").attr("fill", "white");

    // Create tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden");

    if (futureData && futureData.length > 0) {
      // Grouped bar chart: if futureData not empty
      const groupedData = data.map((d) => ({
        label: d.label,
        current: d.value,
        future: futureData.find((f) => f.label === d.label)?.value || 0,
      }));

      // Create bars for grouped bar chart
      svg
        .selectAll(".bar-group")
        .data(groupedData)
        .enter()
        .append("g")
        .attr("class", "bar-group")
        .attr("transform", (d) => `translate(${xScale(d.label)},0)`)
        .each(function (d) {
          const group = d3.select(this);

          group
            .append("rect")
            .attr("x", 0)
            .attr("y", (d) => yScale(d.current))
            .attr("width", xScale.bandwidth() / 2)
            .attr("height", (d) => height - margin.bottom - yScale(d.current))
            .attr("fill", currentColor)
            .on("mouseover", function (event, d) {
              d3.select(this)
                .transition()
                .duration(200)
                .attr("stroke-width", "2px");
              tooltip
                .html(`Current Count: ${d.current}`)
                .style("visibility", "visible")
                .style("top", event.pageY - 10 + "px")
                .style("left", event.pageX + 10 + "px");

              d3.select(this).attr("fill", d3.rgb(currentColor).darker(0.8));
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
                .attr("fill", currentColor);
            });

          group
            .append("rect")
            .attr("x", xScale.bandwidth() / 2)
            .attr("y", (d) => yScale(d.future))
            .attr("width", xScale.bandwidth() / 2)
            .attr("height", (d) => height - margin.bottom - yScale(d.future))
            .attr("fill", futureColor)
            .on("mouseover", function (event, d) {
              d3.select(this)
                .transition()
                .duration(200)
                .attr("stroke-width", "2px");
              tooltip
                .html(`Future Count: ${d.future}`)
                .style("visibility", "visible")
                .style("top", event.pageY - 10 + "px")
                .style("left", event.pageX + 10 + "px");

              d3.select(this).attr("fill", d3.rgb(futureColor).darker(0.8));
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
                .attr("fill", futureColor);
            });

          svg
            .append("circle")
            .attr("cx", width - margin.right + 20)
            .attr("cy", margin.top + 90)
            .attr("r", 8)
            .style("fill", currentColor);

          svg
            .append("text")
            .attr("x", width - margin.right + 35)
            .attr("y", margin.top + 90)
            .text("Present")
            .style("font-size", "12px")
            .attr("fill", "white")
            .attr("alignment-baseline", "middle");

          svg
            .append("circle")
            .attr("cx", width - margin.right + 20)
            .attr("cy", margin.top + 110)
            .attr("r", 8)
            .style("fill", futureColor);

          svg
            .append("text")
            .attr("x", width - margin.right + 35)
            .attr("y", margin.top + 110)
            .text("Future")
            .style("font-size", "12px")
            .attr("fill", "white")
            .attr("alignment-baseline", "middle");
        });
    } else {
      // Standard bar chart (original behavior)
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
          d3.select(this)
            .transition()
            .duration(200)
            .attr("stroke-width", "2px");
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
    }

    // Add chart title
    svg
      .append("text")
      .attr("class", "likert-chart-title")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .text(question);

    // Cleanup: remove tooltip on unmount
    return () => {
      tooltip.remove();
    };
  }, [data, futureData, question]);

  return (
    <div className="likert-bar-chart-container">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default LikertBar;
