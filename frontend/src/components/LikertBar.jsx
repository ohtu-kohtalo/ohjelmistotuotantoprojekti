import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const LikertBar = ({ data = [], futureData = [], question = "" }) => {
  const svgRef = useRef();
  const wrapperRef = useRef();
  const [dims, setDims] = useState({ width: 0, height: 0 });
  const hasAnimated = useRef(false);
  const prevQuestion = useRef(question); // Track the previous question

  // Responsive sizing
  useEffect(() => {
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (!w) return;
      const rawH = Math.round(w * 0.6);
      const h = Math.max(320, Math.min(rawH, window.innerHeight * 0.8));
      setDims({ width: w, height: h });
    });
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, []);

  // Reset animation ONLY if question changes
  useEffect(() => {
    if (question !== prevQuestion.current) {
      hasAnimated.current = false;
      prevQuestion.current = question;
    }
  }, [question]);

  useEffect(() => {
    if (!data.length || !dims.width) return;

    const { width, height } = dims;
    const margin = { top: 80, right: 80, bottom: 40, left: 40 };

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .classed("rounded-xl", true);

    svg.selectAll("*").remove();

    // Fade-in animation
    svg.style("opacity", 0).transition().duration(1000).style("opacity", 1);

    const maxVal = Math.max(
      d3.max(data, (d) => d.value),
      futureData.length ? d3.max(futureData, (d) => d.value) : 0
    );

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([margin.left, width - margin.right])
      .padding(0.3);

    const y = d3
      .scaleLinear()
      .domain([0, maxVal * 1.1])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Grid
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(
        d3
          .axisLeft(y)
          .tickSize(-width + margin.left + margin.right)
          .tickFormat("")
      )
      .selectAll("line")
      .attr("stroke", "#444")
      .attr("stroke-dasharray", "4,4");

    // Axes
    const xAxisG = svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));
    xAxisG.selectAll("text").attr("fill", "white");

    const yAxisG = svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format("d")));
    yAxisG.selectAll("text").attr("fill", "white");

    // Tooltip
    d3.select("body").selectAll(".chart-tooltip").remove();
    const tooltip = d3
      .select("body")
      .append("div")
      .attr(
        "class",
        "chart-tooltip fixed z-50 pointer-events-none rounded-md bg-gray-900 text-white px-3 py-2 text-sm leading-tight shadow-lg"
      )
      .style("visibility", "hidden")
      .style("transform", "translate(-50%, -100%)");

    const currentColor = "#4682B4";
    const futureColor = "#8A2BE2";

    if (futureData.length) {
      // Grouped bars (Present + Future)
      const grouped = data.map((d) => ({
        label: d.label,
        current: d.value,
        future: futureData.find((f) => f.label === d.label)?.value || 0,
      }));

      const group = svg
        .selectAll(".bar-group")
        .data(grouped)
        .enter()
        .append("g")
        .attr("class", "bar-group")
        .attr("transform", (d) => `translate(${x(d.label)},0)`);

      const presentBars = group
        .append("rect")
        .attr("x", 0)
        .attr("width", x.bandwidth() / 2)
        .attr("fill", currentColor)
        .on("mouseenter", function (event, d) {
          const rect = this.getBoundingClientRect();
          tooltip
            .html(`<strong>Present:</strong> ${d.current}`)
            .style("visibility", "visible")
            .style("left", `${rect.left + rect.width / 2}px`)
            .style("top", `${rect.top}px`);
          d3.select(this).attr("stroke", "#fff").attr("stroke-width", 2);
        })
        .on("mousemove", function () {
          const rect = this.getBoundingClientRect();
          tooltip
            .style("left", `${rect.left + rect.width / 2}px`)
            .style("top", `${rect.top}px`);
        })
        .on("mouseleave", function () {
          tooltip.style("visibility", "hidden");
          d3.select(this).attr("stroke", "none");
        });

      const futureBars = group
        .append("rect")
        .attr("x", x.bandwidth() / 2)
        .attr("width", x.bandwidth() / 2)
        .attr("fill", futureColor)
        .on("mouseenter", function (event, d) {
          const rect = this.getBoundingClientRect();
          tooltip
            .html(`<strong>Future:</strong> ${d.future}`)
            .style("visibility", "visible")
            .style("left", `${rect.left + rect.width / 2}px`)
            .style("top", `${rect.top}px`);
          d3.select(this).attr("stroke", "#fff").attr("stroke-width", 2);
        })
        .on("mousemove", function () {
          const rect = this.getBoundingClientRect();
          tooltip
            .style("left", `${rect.left + rect.width / 2}px`)
            .style("top", `${rect.top}px`);
        })
        .on("mouseleave", function () {
          tooltip.style("visibility", "hidden");
          d3.select(this).attr("stroke", "none");
        });

      // Animate bars
      if (!hasAnimated.current) {
        presentBars
          .attr("y", y(0))
          .attr("height", 0)
          .transition()
          .duration(800)
          .attr("y", (d) => y(d.current))
          .attr("height", (d) => height - margin.bottom - y(d.current));

        futureBars
          .attr("y", y(0))
          .attr("height", 0)
          .transition()
          .duration(800)
          .attr("y", (d) => y(d.future))
          .attr("height", (d) => height - margin.bottom - y(d.future))
          .on("end", () => (hasAnimated.current = true));
      } else {
        presentBars
          .attr("y", (d) => y(d.current))
          .attr("height", (d) => height - margin.bottom - y(d.current));
        futureBars
          .attr("y", (d) => y(d.future))
          .attr("height", (d) => height - margin.bottom - y(d.future));
      }

      // Legend
      svg
        .append("circle")
        .attr("cx", width - margin.right + 20)
        .attr("cy", margin.top)
        .attr("r", 8)
        .style("fill", currentColor);
      svg
        .append("text")
        .attr("x", width - margin.right + 35)
        .attr("y", margin.top)
        .attr("alignment-baseline", "middle")
        .attr("fill", "white")
        .style("font-size", "12px")
        .text("Present");

      svg
        .append("circle")
        .attr("cx", width - margin.right + 20)
        .attr("cy", margin.top + 20)
        .attr("r", 8)
        .style("fill", futureColor);
      svg
        .append("text")
        .attr("x", width - margin.right + 35)
        .attr("y", margin.top + 20)
        .attr("alignment-baseline", "middle")
        .attr("fill", "white")
        .style("font-size", "12px")
        .text("Future");
    } else {
      // Single Likert distribution
      const colour = d3
        .scaleOrdinal()
        .domain([
          "Strongly Disagree",
          "Disagree",
          "Neutral",
          "Agree",
          "Strongly Agree",
        ])
        .range(["#FF0000", "#FFA500", "#FFFF00", "#00FF00", "#006400"]);

      const bars = svg
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", (d) => x(d.label))
        .attr("width", x.bandwidth())
        .attr("fill", (d) => colour(d.label))
        .on("mouseenter", function (event, d) {
          const rect = this.getBoundingClientRect();
          tooltip
            .html(`<strong>${d.label}:</strong> ${d.value}`)
            .style("visibility", "visible")
            .style("left", `${rect.left + rect.width / 2}px`)
            .style("top", `${rect.top}px`);
          d3.select(this).attr("stroke", "#fff").attr("stroke-width", 2);
        })
        .on("mousemove", function () {
          const rect = this.getBoundingClientRect();
          tooltip
            .style("left", `${rect.left + rect.width / 2}px`)
            .style("top", `${rect.top}px`);
        })
        .on("mouseleave", function () {
          tooltip.style("visibility", "hidden");
          d3.select(this).attr("stroke", "none");
        });

      if (!hasAnimated.current) {
        bars
          .attr("y", y(0))
          .attr("height", 0)
          .transition()
          .duration(800)
          .attr("y", (d) => y(d.value))
          .attr("height", (d) => height - margin.bottom - y(d.value))
          .on("end", () => (hasAnimated.current = true));
      } else {
        bars
          .attr("y", (d) => y(d.value))
          .attr("height", (d) => height - margin.bottom - y(d.value));
      }
    }

    // Chart Title
    const titleFontSize = Math.max(12, Math.min(20, width / 60)); // NEW
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .style("font-size", `${titleFontSize}px`) // NEW
      .style("font-weight", "bold")
      .text(question);

    return () => tooltip.remove();
  }, [data, futureData, question, dims]);

  return (
    <div ref={wrapperRef} className="w-full relative">
      <svg
        ref={svgRef}
        className="w-full h-auto select-none transition-opacity duration-500"
      />
    </div>
  );
};

export default LikertBar;
