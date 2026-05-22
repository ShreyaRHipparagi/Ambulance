export default class CityGraph {
  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
  }

  addNode(id, data) {
    this.nodes.set(id, data);
    if (!this.edges.has(id)) {
      this.edges.set(id, []);
    }
  }

  addEdge(fromId, toId, weight, data) {
    if (!this.nodes.has(fromId) || !this.nodes.has(toId)) {
      throw new Error("Both nodes must exist before adding an edge.");
    }
    this.edges.get(fromId).push({ nodeId: toId, weight, data });
    this.edges.get(toId).push({ nodeId: fromId, weight, data }); // Bidirectional
  }

  getNeighbors(nodeId) {
    return this.edges.get(nodeId) || [];
  }

  getNode(nodeId) {
    return this.nodes.get(nodeId);
  }

  getAllNodes() {
    return this.nodes;
  }

  getAllEdges() {
    const allEdges = [];
    const seen = new Set();
    for (const [fromId, neighbors] of this.edges.entries()) {
      for (const edge of neighbors) {
        const edgeId = [fromId, edge.nodeId].sort().join('-');
        if (!seen.has(edgeId)) {
          seen.add(edgeId);
          allEdges.push({ from: fromId, to: edge.nodeId, weight: edge.weight, data: edge.data });
        }
      }
    }
    return allEdges;
  }

  getEdge(fromId, toId) {
    const neighbors = this.getNeighbors(fromId);
    return neighbors.find(n => n.nodeId === toId);
  }

  hasNode(nodeId) {
    return this.nodes.has(nodeId);
  }

  getEffectiveWeight(fromId, toId, useTraffic = true) {
    const edge = this.getEdge(fromId, toId);
    if (!edge) return Infinity;
    const multiplier = useTraffic && edge.data.trafficMultiplier ? edge.data.trafficMultiplier : 1;
    return edge.weight * multiplier;
  }
}
