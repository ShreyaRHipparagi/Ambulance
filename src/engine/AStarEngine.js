import PriorityQueue from './PriorityQueue.js';

export default class AStarEngine {
  constructor(graph) {
    this.graph = graph;
  }

  static haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  run(startId, targetId, useTraffic = false) {
    if (!this.graph.hasNode(startId) || !this.graph.hasNode(targetId)) {
      return { found: false, cost: Infinity, path: [], steps: [], visitedCount: 0 };
    }

    const targetNode = this.graph.getNode(targetId);

    const gScore = {}; // Actual cost from start to n
    const fScore = {}; // gScore + h(n)
    const previous = {};
    const visited = new Set();
    const pq = new PriorityQueue();
    const steps = [];

    for (const [nodeId] of this.graph.getAllNodes().entries()) {
      gScore[nodeId] = Infinity;
      fScore[nodeId] = Infinity;
      previous[nodeId] = null;
    }

    gScore[startId] = 0;
    const startNode = this.graph.getNode(startId);
    fScore[startId] = AStarEngine.haversineDistance(startNode.lat, startNode.lng, targetNode.lat, targetNode.lng);
    
    pq.insert(startId, fScore[startId]);

    steps.push({
      type: 'init',
      currentNode: null,
      distances: { ...gScore }, // For UI compatibility with Dijkstra
      gScore: { ...gScore },
      fScore: { ...fScore },
      previous: { ...previous },
      pq: pq.toArray(),
      visited: Array.from(visited),
      relaxedEdge: null,
      path: [],
      message: `Initialized A* from node ${startId}`
    });

    let found = false;

    while (!pq.isEmpty()) {
      const minEntry = pq.extractMin();
      const currentId = minEntry.item;
      const currentF = minEntry.priority;

      steps.push({
        type: 'extract_min',
        currentNode: currentId,
        distances: { ...gScore },
        gScore: { ...gScore },
        fScore: { ...fScore },
        previous: { ...previous },
        pq: pq.toArray(),
        visited: Array.from(visited),
        relaxedEdge: null,
        path: [],
        message: `Extracted node ${currentId} with fScore ${currentF.toFixed(2)}`
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
        const tentativeGScore = gScore[currentId] + edgeWeight;

        if (tentativeGScore < gScore[neighborId]) {
          const oldGScore = gScore[neighborId];
          previous[neighborId] = currentId;
          gScore[neighborId] = tentativeGScore;
          
          const nNode = this.graph.getNode(neighborId);
          const hScore = AStarEngine.haversineDistance(nNode.lat, nNode.lng, targetNode.lat, targetNode.lng);
          fScore[neighborId] = gScore[neighborId] + hScore;
          
          pq.insert(neighborId, fScore[neighborId]);

          steps.push({
            type: 'relax',
            currentNode: currentId,
            distances: { ...gScore },
            gScore: { ...gScore },
            fScore: { ...fScore },
            previous: { ...previous },
            pq: pq.toArray(),
            visited: Array.from(visited),
            relaxedEdge: { from: currentId, to: neighborId, oldDist: oldGScore, newDist: tentativeGScore },
            path: [],
            message: `Relaxed edge ${currentId}-${neighborId}: gScore updated to ${tentativeGScore.toFixed(2)}`
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
      cost = gScore[targetId];
      steps.push({
        type: 'found',
        currentNode: targetId,
        distances: { ...gScore },
        gScore: { ...gScore },
        fScore: { ...fScore },
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
        distances: { ...gScore },
        gScore: { ...gScore },
        fScore: { ...fScore },
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
