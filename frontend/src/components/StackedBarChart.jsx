import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const StackedBarChart = ({ data, xAxis }) => {
  const svgRef = useRef();
  const wrapperRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width } = entries[0].contentRect;
      setDimensions({ width, height: 400});
    });

    if (wrapperRef.current) observer.observe(wrapperRef.current);

    return () => {
      if (wrapperRef.current) observer.unobserve(wrapperRef.current);
    };
  
  }, []);

  useEffect(() => {
    if (!data || data.length === 0 || dimensions.width === 0) return;

    const { width, height } = dimensions;
    const margin = { top: 50, right: 30, bottom: 100, left: 60 };

    d3.select(svgRef.current).selectAll("*").remove();

    // Create SVG element
    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .classed("rounded-xl", true);

    // Define categories and group the data by category
    let categories = [];
    let groupedData = {};

    if (xAxis === "age") {
      categories = ["16", "17", "18", "19", "20", "21", "22", "23", "24", "25"];
      groupedData = Object.fromEntries(categories.map((age) => [age, []]));
      data.forEach((d) => {
        const key = d.age?.toString();
        if (groupedData[key]) groupedData[key].push(d.response);
      });
    } else if (xAxis === "gender") {
      categories = ["Male", "Female", "Other"];
      groupedData = { Male: [], Female: [], Other: [] };
      data.forEach((d) => {
        if (groupedData[d.gender]) {
          groupedData[d.gender].push(d.response);
        } else {
          groupedData["Other"].push(d.response);
        }
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

    const maxCount = d3.max(avgData, (d) => d.count);
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(avgData, (d) => d.count) * 1.1])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Define color scheme
    const colorScale = d3
      .scaleOrdinal()
      .domain(categories)
      .range([
        "#01AFD2",
        "#FD82B0",
        "#89E2A4",
        "#B82EB7",
        "#F6DC99",
        "#5B8BF7",
        "#C678DD",
        "#80ff80",
        "#FFFF8F",
        "#7BDFF2",
      ]);

    // Add gridlines (using light grey with dashed lines)

    // Y gridlines
    svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${margin.left},0)`)
      .call(
        d3.axisLeft(yScale)
          .tickSize(-width + margin.left + margin.right)
          .tickFormat(""),
      )
      .selectAll("line")
      .attr("stroke", "#444")
      .attr("stroke-dasharray", "4,4");

    // Add X axis with white tick labels
    const xAxisElement = svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale))
      .attr("class", "axis");

    xAxisElement.selectAll("text")
      .attr("fill", "white")
      .attr("font-size", "12px")
      .attr("font-weight", "bold");

    // X axis label (centered, 14px, bold, white)
    xAxisElement
      .append("text")
      .attr("x", width / 2)
      .attr("y", 50)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .attr("fill", "white")
      .text(xAxis);

    // Add Y axis with white tick labels
    const yAxisElement = svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).tickFormat((d) => (d % 1 === 0 ? d : "")))
      .attr("class", "axis");

    yAxisElement.selectAll("text").attr("fill", "white");

    // Y axis label (rotated, centered, 20px, bold, white)
    yAxisElement
      .append("text")
      .attr("x", -height / 2)
      .attr("y", -45)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .attr("fill", "white")
      .attr("transform", "rotate(-90)")
      .text("Respondents");

    // Create tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "bg-slate-900 text-white text-sm px-3 py-2 rounded shadow-md absolute z-50")
      .style("visibility", "hidden");

    // Draw bars
    svg
      .selectAll("rect")
      .data(avgData)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d.category))
      .attr("y", (d) => yScale(d.count))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => height - margin.bottom - yScale(d.count))
      .attr("fill", (d) => colorScale(d.category))
      .attr("stroke", "#333")
      .attr("stroke-width", "1px")
      .attr("opacity", 0.9)
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this).transition().duration(200).attr("stroke-width", "2px");
        tooltip
          .html(`<strong>${d.category}</strong><br/>Count: ${d.count}`)
          .style("visibility", "visible")
          .style("top", event.pageY - 10 + "px")
          .style("left", event.pageX + 10 + "px");

        d3.select(this).attr("fill", d3.rgb(colorScale(d.category)).darker(0.8));
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
          .attr("fill", colorScale(d.category));
      });

    svg
      .selectAll("text.bar-label")
      .data(avgData)
      .enter()
      .append("text")
      .attr("x", (d) => xScale(d.category) + xScale.bandwidth() / 2)
      .attr("y", (d) => yScale(d.count) - 10)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "12px")
      .attr("class", "bar-label")
      .text((d) => d.count);
  }, [data, xAxis, dimensions]);

  return (
    <div className="w-full overflow-x-auto" ref={wrapperRef}>
      <svg ref={svgRef} className="w-full h-[400px]" />
    </div>
  );
};

export default StackedBarChart;
