import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const StackedBarChart = ({ data, xAxis }) => {
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

/*     svg
      .append("rect")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom)
      .attr("fill", "#ECECEC"); */

    // Define categories and bin the data
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

    // Compute averages for each category
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

    const colorScale = d3
      .scaleOrdinal()
      .domain(categories)
      .range(d3.schemeCategory10);

    svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickSize(-height + margin.top + margin.bottom)
          .tickFormat(""),
      );

    svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-width + margin.left + margin.right)
          .tickFormat(""),
      );

    // Add X axis
    const xAxisElement = svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale))
      .attr("class", "axis");

    xAxisElement
      .append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("class", "x-axis-label")
      .text(xAxis);

    // Add Y axis (response scores)
    const yAxisElement = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale))
      .attr("class", "axis");

    yAxisElement
      .append("text")
      .attr("x", -height / 2)
      .attr("y", -40)
      .attr("class", "y-axis-label")
      .attr("transform", "rotate(-90)")
      .text("Response Score");

    // Create tooltip
    const tooltip = d3.select("body").append("div").attr("class", "tooltip");

    // Draw bars
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
      .on("mouseover", (event, d) => {
        tooltip.style("visibility", "visible").html(
          `<strong>${d.category}</strong><br>
          Avg Score: ${d.avg.toFixed(2)}<br>
          Responses: ${d.count}`,
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
  }, [data, xAxis]);

  return (
    <div className="piechart-container">
        <h3 className="chart-title">{`Average response score categorized by ${xAxis}`}</h3>
        <svg ref={svgRef} />
    </div>
    );
};

export default StackedBarChart;
