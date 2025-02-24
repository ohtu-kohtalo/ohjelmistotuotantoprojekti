import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const PieChart = ({ data, category }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    d3.select(svgRef.current).selectAll("*").remove(); // Clear previous chart

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Tooltip setup
    const tooltip = d3.select("body").append("div").attr("class", "tooltip");

    // Define the color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Process data based on selected category
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

    // Convert to array with counts and average scores
    const pieData = Array.from(groupedData, ([key, values]) => ({
      key,
      value: values.length,
      avgScore: (
        values.reduce((sum, d) => sum + d.response, 0) / values.length
      ).toFixed(2),
    }));

    const pie = d3.pie().value((d) => d.value);
    const arc = d3
      .arc()
      .innerRadius(0)
      .outerRadius(radius - 10);

    // Draw pie slices
    const slices = svg
      .selectAll("path")
      .data(pie(pieData))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => color(d.data.key))
      .attr("stroke", "white")
      .style("stroke-width", "2px")
      .style("cursor", "pointer")
      .attr("opacity", 0.9);

    // Hover effects
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

    // Add labels
    const textArc = d3
      .arc()
      .innerRadius(radius / 2)
      .outerRadius(radius);

    svg
      .selectAll("text")
      .data(pie(pieData))
      .enter()
      .append("text")
      .attr("transform", (d) => `translate(${textArc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "white")
      .text((d) => d.data.key);

    return () => {
      tooltip.remove(); // Cleanup on unmount
    };
  }, [data, category]);

  return (
    <div className="piechart-container">
      <h3 className="chart-title">{`Distribution of answers by ${category.charAt(0).toUpperCase() + category.slice(1)}`}</h3>
      <svg ref={svgRef} />
    </div>
  );
};

export default PieChart;
