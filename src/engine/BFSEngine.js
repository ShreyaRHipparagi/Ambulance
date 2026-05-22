export default class BFSEngine {
  constructor(graph) {
    this.graph = graph;
  }

  run(startId, targetId) {
    if (!this.graph.hasNode(startId) || !this.graph.hasNode(targetId)) {
      return { found: false, path: [], steps: [], visitedCount: 0 };
    }

    const queue = [startId];
    const visited = new Set([startId]);
    const prev = new Map();
    const steps = [];
    let found = false;

    steps.push({
      type: 'init',
      currentNode: null,
      queue: [...queue],
      visited: Array.from(visited),
      path: [],
      layer: 0,
      message: `Initialized BFS from node ${startId}`
    });

    while (queue.length > 0) {
      const currentId = queue.shift();
      
      steps.push({
        type: 'dequeue',
        currentNode: currentId,
        queue: [...queue],
        visited: Array.from(visited),
        path: [],
        layer: 0, // Simplified layer info
        message: `Dequeued node ${currentId}`
      });

      if (currentId === targetId) {
        found = true;
        break;
      }

      const neighbors = this.graph.getNeighbors(currentId);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.nodeId)) {
          visited.add(neighbor.nodeId);
          prev.set(neighbor.nodeId, currentId);
          queue.push(neighbor.nodeId);
          
          steps.push({
            type: 'enqueue',
            currentNode: currentId,
            queue: [...queue],
            visited: Array.from(visited),
            path: [],
            layer: 0,
            message: `Enqueued unvisited neighbor ${neighbor.nodeId}`
          });
        }
      }
    }

    const path = [];
    if (found) {
      let curr = targetId;
      while (curr !== undefined) {
        path.unshift(curr);
        curr = prev.get(curr);
      }
      steps.push({
        type: 'found',
        currentNode: targetId,
        queue: [...queue],
        visited: Array.from(visited),
        path,
        layer: 0,
        message: `Found target node ${targetId}! Reconstructed path.`
      });
    } else {
      steps.push({
        type: 'not_found',
        currentNode: null,
        queue: [...queue],
        visited: Array.from(visited),
        path: [],
        layer: 0,
        message: `Queue empty. Target ${targetId} not reachable.`
      });
    }

    return { found, path, steps, visitedCount: visited.size };
  }
}
