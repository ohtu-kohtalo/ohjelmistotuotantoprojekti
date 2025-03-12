import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const PieChart = ({ data, category, title }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Use the same dimensions and margins as ScatterPlot
    const width = 800;
    const height = 650;
    const margin = { top: 50, right: 30, bottom: 50, left: 50 };
    // Subtract top margin to leave some padding
    const radius = Math.min(width, height) / 2 - margin.top;

    // Clear any previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    // Create the SVG element and center the chart
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Create tooltip with the same style as ScatterPlot
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

    // Group data based on the selected category
    let groupedData;
    if (category === "age") {
      groupedData = d3.group(data, (d) => {
        if (d.age >= 18 && d.age <= 30) return "18-30";
        if (d.age >= 31 && d.age <= 40) return "31-40";
        if (d.age >= 41 && d.age <= 50) return "41-50";
        if (d.age >= 51 && d.age <= 60) return "51-60";
        return "60+";
      });
    } else if (category === "income") {
      groupedData = d3.group(data, (d) => {
        if (d.income <= 20000) return "10k-20k";
        if (d.income <= 30000) return "20k-30k";
        if (d.income <= 40000) return "30k-40k";
        if (d.income <= 50000) return "40k-50k";
        if (d.income <= 60000) return "50k-100k";
        return "100k+";
      });
    } else if (category === "gender") {
      groupedData = d3.group(data, (d) => d.gender);
    }

    // Convert grouped data into an array including counts and average scores
    const pieData = Array.from(groupedData, ([key, values]) => ({
      key,
      value: values.length,
      avgScore: (
        values.reduce((sum, d) => sum + d.response, 0) / values.length
      ).toFixed(2),
    }));

    // Use the same color scheme as ScatterPlot
    const colorScale = d3
      .scaleOrdinal()
      .domain(pieData.map((d) => d.key))
      .range(["#ff7f50", "#ffcc00", "#66c2a5", "#5e81ac", "#ff6f61"]);

    // Generate the pie layout and arc generator
    const pie = d3.pie().value((d) => d.value);
    const arc = d3
      .arc()
      .innerRadius(0)
      .outerRadius(radius - 10);

    // Draw pie slices with similar stroke and opacity settings
    const slices = svg
      .selectAll("path")
      .data(pie(pieData))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => colorScale(d.data.key))
      .attr("stroke", "#333")
      .attr("stroke-width", "1px")
      .attr("opacity", 0.9)
      .style("cursor", "pointer");

    // Add hover interactions (tooltip + transition) similar to ScatterPlot
    slices
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("transform", "scale(1.06)");

        tooltip.style("visibility", "visible").html(
          `<strong>${d.data.key}</strong><br>
           Answers: ${d.data.value}<br>
           Avg Score: ${d.data.avgScore}`,
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
          .attr("transform", "scale(1)");

        tooltip.style("visibility", "hidden");
      });

    // Add labels to the pie slices, using font sizes and colors consistent with ScatterPlot
    const totalResponses = d3.sum(pieData, (d) => d.value);
    const textArc = d3
      .arc()
      .innerRadius(radius / 2)
      .outerRadius(radius);

    svg
      .selectAll("text")
      .data(pie(pieData))
      .enter()
      .append("text")
      .attr("transform", (d) => {
        const pos = textArc.centroid(d);
        pos[0] *= 0.9;
        pos[1] *= 0.9;
        return `translate(${pos})`;
      })
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("fill", "white")
      .text((d) => {
        const percentage = ((d.data.value / totalResponses) * 100).toFixed(1);
        return `${d.data.key} (${percentage}%)`;
      });

    // Cleanup tooltip on unmount
    return () => {
      tooltip.remove();
    };
  }, [data, category]);

  return (
    <div className="piechart-container">
      <h3 className="chart-title">
        {title || `Distribution of total answerers based on ${category}`}
      </h3>
      <svg ref={svgRef} />
    </div>
  );
};

export default PieChart;
