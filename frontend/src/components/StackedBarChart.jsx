import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const StackedBarChart = ({ data, xAxis }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Use the same dimensions and margins as ScatterPlot
    const width = 425;
    const height = 350;
    const margin = { top: 50, right: 30, bottom: 50, left: 50 };

    // Remove previous SVG before rendering new one
    d3.select(svgRef.current).selectAll("*").remove();

    // Create SVG element
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    // Define categories and group the data by category
    let categories = [];
    let groupedData = {};

    if (xAxis === "age") {
      categories = ["18-30", "31-40", "41-50", "51-60", "60+"];
      groupedData = {
        "18-30": [],
        "31-40": [],
        "41-50": [],
        "51-60": [],
        "60+": [],
      };
      data.forEach((d) => {
        if (d.age <= 30) groupedData["18-30"].push(d.response);
        else if (d.age <= 40) groupedData["31-40"].push(d.response);
        else if (d.age <= 50) groupedData["41-50"].push(d.response);
        else if (d.age <= 60) groupedData["51-60"].push(d.response);
        else groupedData["60+"].push(d.response);
      });
    } else if (xAxis === "income") {
      categories = ["10k-20k", "20k-30k", "30k-40k", "50k-100k", "100k+"];
      groupedData = {
        "10k-20k": [],
        "20k-30k": [],
        "30k-40k": [],
        "50k-100k": [],
        "100k+": [],
      };
      data.forEach((d) => {
        if (d.income <= 20000) groupedData["10k-20k"].push(d.response);
        else if (d.income <= 30000) groupedData["20k-30k"].push(d.response);
        else if (d.income <= 40000) groupedData["30k-40k"].push(d.response);
        else if (d.income <= 100000) groupedData["50k-100k"].push(d.response);
        else groupedData["100k+"].push(d.response);
      });
    } else if (xAxis === "gender") {
      categories = ["Male", "Female"];
      groupedData = { Male: [], Female: [] };
      data.forEach((d) => {
        groupedData[d.gender].push(d.response);
      });
    }

    // Compute averages and counts for each category
    const avgData = categories.map((category) => {
      const responses = groupedData[category];
      const avg = responses.length ? d3.mean(responses) : 0;
      return { category, avg, count: responses.length };
    });

    // Define scales
    const xScale = d3
      .scaleBand()
      .domain(categories)
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, 5])
      .range([height - margin.bottom, margin.top]);

    // Use the same color scheme as ScatterPlot
    const colorScale = d3
      .scaleOrdinal()
      .domain(categories)
      .range(["#ff7f50", "#ffcc00", "#66c2a5", "#5e81ac", "#ff6f61"]);

    // Add gridlines (using light grey with dashed lines)
    // X gridlines
    svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickSize(-height + margin.top + margin.bottom)
          .tickFormat(""),
      )
      .selectAll("line")
      .attr("stroke", "#ddd")
      .attr("stroke-dasharray", "3,3");

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

    xAxisElement.selectAll("text").attr("fill", "white");

    // X axis label (centered, 20px, bold, white)
    xAxisElement
      .append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", "white")
      .text(xAxis);

    // Add Y axis with white tick labels
    const yAxisElement = svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale))
      .attr("class", "axis");

    yAxisElement.selectAll("text").attr("fill", "white");

    // Y axis label (rotated, centered, 20px, bold, white)
    yAxisElement
      .append("text")
      .attr("x", -height / 2)
      .attr("y", -40)
      .attr("text-anchor", "middle")
      .attr("font-size", "20px")
      .attr("font-weight", "bold")
      .attr("fill", "white")
      .attr("transform", "rotate(-90)")
      .text("Response Score");

    // Create tooltip with ScatterPlot styling
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

    // Draw bars with similar transitions and hover effects as ScatterPlot
    svg
      .selectAll("rect")
      .data(avgData)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d.category))
      .attr("y", (d) => yScale(d.avg))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => height - margin.bottom - yScale(d.avg))
      .attr("fill", (d) => colorScale(d.category))
      .attr("stroke", "#333")
      .attr("stroke-width", "1px")
      .attr("opacity", 0.9)
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this).transition().duration(200).attr("stroke-width", "2px");
        tooltip.style("visibility", "visible").html(
          `<strong>${d.category}</strong><br>
             Avg Score: ${d.avg.toFixed(2)}<br>
             Responses: ${d.count}`,
        );
      })
      .on("mousemove", function (event) {
        tooltip
          .style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", function () {
        d3.select(this).transition().duration(200).attr("stroke-width", "1px");
        tooltip.style("visibility", "hidden");
      });

    // Cleanup: remove tooltip on unmount
    return () => {
      tooltip.remove();
    };
  }, [data, xAxis]);

  return (
    <div className="stackedbarchart-container">
      <h3 className="chart-title">
        {`Average response score categorized by ${xAxis}`}
      </h3>
      <svg ref={svgRef} />
    </div>
  );
};

export default StackedBarChart;
