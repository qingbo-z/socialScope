import * as d3 from "d3"

export function drawGraph(selector, { nodes, edges }) {
  const width = 800, height = 600
  const color = d3.scaleOrdinal(d3.schemeCategory10)

  const svg = d3
    .select(selector)
    .append("svg")
    .attr("width", width)
    .attr("height", height)

  const sim = d3
    .forceSimulation(nodes)
    .force("link", d3.forceLink(edges).id(d => d.id).distance(80))
    .force("charge", d3.forceManyBody().strength(-200))
    .force("center", d3.forceCenter(width / 2, height / 2))

  const link = svg
    .append("g")
    .attr("stroke", "#aaa")
    .selectAll("line")
    .data(edges)
    .join("line")

  const node = svg
    .append("g")
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("r", 6)
    .attr("fill", d => color(d.community))
    .call(drag(sim))

  const label = svg
    .append("g")
    .selectAll("text")
    .data(nodes)
    .join("text")
    .text(d => d.id)
    .attr("font-size", 10)
    .attr("dx", 8)
    .attr("dy", 4)

  sim.on("tick", () => {
    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y)

    node.attr("cx", d => d.x).attr("cy", d => d.y)
    label.attr("x", d => d.x).attr("y", d => d.y)
  })

  function drag(simulation) {
    return d3
      .drag()
      .on("start", event => {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        event.subject.fx = event.subject.x
        event.subject.fy = event.subject.y
      })
      .on("drag", event => {
        event.subject.fx = event.x
        event.subject.fy = event.y
      })
      .on("end", event => {
        if (!event.active) simulation.alphaTarget(0)
        event.subject.fx = null
        event.subject.fy = null
      })
  }
}