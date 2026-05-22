export default class DFSEngine {
  constructor(graph) {
    this.graph = graph;
  }

  run(startId, targetId) {
    if (!this.graph.hasNode(startId) || !this.graph.hasNode(targetId)) {
      return { found: false, path: [], steps: [], visitedCount: 0 };
    }

    const stack = [startId];
    const visited = new Set();
    const prev = new Map();
    const steps = [];
    let found = false;

    steps.push({
      type: 'init',
      currentNode: null,
      stack: [...stack],
      visited: Array.from(visited),
      path: [],
      depth: 0,
      message: `Initialized DFS from node ${startId}`
    });

    while (stack.length > 0) {
      const currentId = stack.pop();

      steps.push({
        type: 'pop',
        currentNode: currentId,
        stack: [...stack],
        visited: Array.from(visited),
        path: [],
        depth: 0,
        message: `Popped node ${currentId} from stack`
      });

      if (!visited.has(currentId)) {
        visited.add(currentId);
        
        steps.push({
          type: 'visit',
          currentNode: currentId,
          stack: [...stack],
          visited: Array.from(visited),
          path: [],
          depth: 0,
          message: `Visited node ${currentId}`
        });

        if (currentId === targetId) {
          found = true;
          break;
        }

        const neighbors = this.graph.getNeighbors(currentId);
        // Reverse to maintain expected traversal order (similar to recursion)
        for (let i = neighbors.length - 1; i >= 0; i--) {
          const neighbor = neighbors[i];
          if (!visited.has(neighbor.nodeId)) {
            stack.push(neighbor.nodeId);
            if (!prev.has(neighbor.nodeId)) {
                prev.set(neighbor.nodeId, currentId);
            }
            steps.push({
              type: 'push',
              currentNode: currentId,
              stack: [...stack],
              visited: Array.from(visited),
              path: [],
              depth: 0,
              message: `Pushed unvisited neighbor ${neighbor.nodeId}`
            });
          }
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
        stack: [...stack],
        visited: Array.from(visited),
        path,
        depth: 0,
        message: `Found target node ${targetId}! Reconstructed path.`
      });
    } else {
      steps.push({
        type: 'not_found',
        currentNode: null,
        stack: [...stack],
        visited: Array.from(visited),
        path: [],
        depth: 0,
        message: `Stack empty. Target ${targetId} not reachable.`
      });
    }

    return { found, path, steps, visitedCount: visited.size };
  }
}
