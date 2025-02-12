import React from "react";
import * as d3 from "d3"; // Import D3.js for data visualization

class Plot extends React.Component {
  // Lifecycle method: Called once when the component is first mounted
  componentDidMount() {
    this.drawChart();
  }

  // Lifecycle method: Called every time the component updates (e.g., when props change)
  componentDidUpdate() {
    this.drawChart();
  }

  drawChart() {
    const data = this.props.data; // Retrieve data from component props

    // Select the SVG element, set its attributes (width, height, margin)
    const svg = d3
      .select(this.refs.chart) // Select the SVG element using a reference
      .attr("width", 500) // Set the width of the chart
      .attr("height", 500) // Set the height of the chart
      .style("margin-left", "50px"); // Apply some left margin for spacing

    // Remove all existing elements inside the SVG to prevent duplicates
    svg.selectAll("*").remove();

    // Bind data to circles and append them to the SVG
    svg
      .selectAll("circle") // Select all circles (none exist initially)
      .data(data) // Bind the data array to the selection
      .enter() // Create placeholders for new elements
      .append("circle") // Append a circle for each data point
      .attr("cx", (d, i) => i * 50 + 25) // Set the x-position based on index
      .attr("cy", (d) => 500 - d * 10) // Set the y-position (scaling data)
      .attr("r", 10) // Set the radius of the circle
      .attr("fill", "blue"); // Set the fill color of the circles
  }

  render() {
    // Epäselvä tää ref=
    return <svg ref="chart"></svg>; // Render an empty SVG element to be manipulated by D3
  }
}

export default Plot; // Export the component for use in other files
