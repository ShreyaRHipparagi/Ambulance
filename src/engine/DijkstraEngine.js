import PriorityQueue from './PriorityQueue.js';

export default class DijkstraEngine {
  constructor(graph) {
    this.graph = graph;
  }

  run(startId, targetId, useTraffic = false) {
    if (!this.graph.hasNode(startId) || !this.graph.hasNode(targetId)) {
      return { found: false, cost: Infinity, path: [], steps: [], visitedCount: 0 };
    }

    const distances = {};
    const previous = {};
    const visited = new Set();
    const pq = new PriorityQueue();
    const steps = [];

    // Initialize distances
    for (const [nodeId] of this.graph.getAllNodes().entries()) {
      distances[nodeId] = Infinity;
      previous[nodeId] = null;
    }
    distances[startId] = 0;
    pq.insert(startId, 0);

    steps.push({
      type: 'init',
      currentNode: null,
      distances: { ...distances },
      previous: { ...previous },
      pq: pq.toArray(),
      visited: Array.from(visited),
      relaxedEdge: null,
      path: [],
      message: `Initialized Dijkstra from node ${startId}`
    });

    let found = false;

    while (!pq.isEmpty()) {
      const minEntry = pq.extractMin();
      const currentId = minEntry.item;
      const currentDist = minEntry.priority;

      steps.push({
        type: 'extract_min',
        currentNode: currentId,
        distances: { ...distances },
        previous: { ...previous },
        pq: pq.toArray(),
        visited: Array.from(visited),
        relaxedEdge: null,
        path: [],
        message: `Extracted node ${currentId} with distance ${currentDist.toFixed(2)}`
      });

      if (currentId === targetId) {
        found = true;
        break;
      }

      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const neighbors = this.graph.getNeighbors(currentId);
      for (const neighbor of neighbors) {
        const neighborId = neighbor.nodeId;
        if (visited.has(neighborId)) continue;

        const edgeWeight = this.graph.getEffectiveWeight(currentId, neighborId, useTraffic);
        const newDist = currentDist + edgeWeight;

        if (newDist < distances[neighborId]) {
          const oldDist = distances[neighborId];
          distances[neighborId] = newDist;
          previous[neighborId] = currentId;
          pq.insert(neighborId, newDist);

          steps.push({
            type: 'relax',
            currentNode: currentId,
            distances: { ...distances },
            previous: { ...previous },
            pq: pq.toArray(),
            visited: Array.from(visited),
            relaxedEdge: { from: currentId, to: neighborId, oldDist, newDist },
            path: [],
            message: `Relaxed edge ${currentId}-${neighborId}: dist updated to ${newDist.toFixed(2)}`
          });
        } else {
          steps.push({
            type: 'skip',
            currentNode: currentId,
            distances: { ...distances },
            previous: { ...previous },
            pq: pq.toArray(),
            visited: Array.from(visited),
            relaxedEdge: null,
            path: [],
            message: `Skipped relaxing edge ${currentId}-${neighborId} (no improvement)`
          });
        }
      }
    }

    const path = [];
    let cost = Infinity;
    if (found) {
      let curr = targetId;
      while (curr !== null) {
        path.unshift(curr);
        curr = previous[curr];
      }
      cost = distances[targetId];
      steps.push({
        type: 'found',
        currentNode: targetId,
        distances: { ...distances },
        previous: { ...previous },
        pq: pq.toArray(),
        visited: Array.from(visited),
        relaxedEdge: null,
        path,
        message: `Found shortest path to target ${targetId}! Total cost: ${cost.toFixed(2)}`
      });
    } else {
      steps.push({
        type: 'not_found',
        currentNode: null,
        distances: { ...distances },
        previous: { ...previous },
        pq: pq.toArray(),
        visited: Array.from(visited),
        relaxedEdge: null,
        path: [],
        message: `Priority queue empty. Target ${targetId} is unreachable.`
      });
    }

    return { found, cost, path, steps, visitedCount: visited.size };
  }
}
