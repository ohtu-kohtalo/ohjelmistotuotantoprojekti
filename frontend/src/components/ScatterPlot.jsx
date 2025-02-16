import React, { useEffect, useRef} from "react";
import * as d3 from "d3"; // Import D3.js for data visualization

const ScatterPlot = ({ data, xAxis }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const container = d3.select(svgRef.current.parentNode) // gets thed dimensions of the parent container
    const width = container.node().clientWidth || 500 // sets the width to match parent container dynamically
    const height = container.node().clientHeight || 400 // sets the height to match parent container dynamically
    const margin = { top: 20, right: 30, bottom: 50, left: 50 };

    // Select the SVG element, set its attributes (width, height, margin)
    const svg = d3.select(svgRef.current) // Select the SVG element using a reference
      .attr("width", "100%") // Set the width of the chart
      .attr("height", "100%") // Set the height of the chart
      .style("background", "#f9f9f9");

    // Remove all existing elements inside the SVG to prevent duplicates
    svg.selectAll("*").remove();

    const isCategorical = xAxis === "gender"  //checks whether the option is gender or something else, so string or numerical

    const xScale = isCategorical
    ? d3.scalePoint() //uses scalepoint to display options as male or female
      .domain(["Male", "Female"])
      .range([margin.left + 50, width - margin.right - 50])
      .padding(0,5)
    : d3.scaleLinear()  //uses scaleLinear to show values on x-axis
      .domain([0, d3.max(data, d => d[xAxis])])
      .range([margin.left, width - margin.right - 25])

    const yScale = d3.scaleLinear() //uses scaleLinear to show 1-10 on the y-axis
      .domain([1, 10])
      .range([height - margin.bottom, margin.top])

    const xAxisElement = d3.axisBottom(xScale).ticks(5);
    const yAxisElement = d3.axisLeft(yScale).ticks(10);

    svg.append("g")  //adds the x-axis to svg
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(xAxisElement)

    svg.append("g") // adds the y-axis to svg
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(yAxisElement);

    const tooltip = d3.select("body").append("div")
      .style("position", "absolute")
      .style("background", "#fff")
      .style("padding", "5px")
      .style("border", "1px solid #ccc")
      .style("border-radius", "5px")
      .style("display", "none");

    // Bind data to circles and append them to the SVG
    svg
      .selectAll("circle") // Select all circles (none exist initially)
      .data(data) // Bind the data array to the selection
      .enter() // Create placeholders for new elements
      .append("circle") // Append a circle for each data point
      .attr("cx", d => xScale(isCategorical ? d.gender : d[xAxis])) // Set the x-position based on index
      .attr("cy", d => yScale(d.response)) // Set the y-position (scaling data)
      .attr("r", 6) // Set the radius of the circle
      .attr("fill", "blue") // Set the fill color of the circles
      .on("mouseover", (event, d) => {
        tooltip.style("display", "block")
          .html(`Agent: ${d.name} <br> ${xAxis}: ${d[xAxis]} <br> Response: ${d.response}`)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 10}px`);
      })
      .on("mouseout", () => tooltip.style("display", "none"));
  }, [data, xAxis]);

    return <svg ref={svgRef}></svg>; // Render an empty SVG element to be manipulated by D3
};

export default ScatterPlot; // Export the component for use in other files
