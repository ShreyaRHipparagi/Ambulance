import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { NODE_POSITIONS } from '../data/cityData.js';
import BFSEngine from '../engine/BFSEngine.js';
import DFSEngine from '../engine/DFSEngine.js';
import DijkstraEngine from '../engine/DijkstraEngine.js';
import AStarEngine from '../engine/AStarEngine.js';

export default function AlgorithmVisualizer() {
  const { 
    graph, 
    locations, 
    selectedAlgorithm, 
    setSelectedAlgorithm, 
    sourceNode, 
    setSourceNode, 
    targetNode, 
    setTargetNode, 
    trafficEnabled, 
    setTrafficEnabled,
    emergencyRequest,
    emergencyResult 
  } = useApp();

  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(500);

  const timerRef = useRef(null);

  // Synchronize with active emergency case automatically when page is loaded or case is active
  useEffect(() => {
    if (emergencyRequest && emergencyRequest.sourceNodeId) {
      setSourceNode(emergencyRequest.sourceNodeId);
    }
    if (emergencyResult && emergencyResult.primary && emergencyResult.primary.hospital && emergencyResult.primary.hospital.nodeId) {
      setTargetNode(emergencyResult.primary.hospital.nodeId);
    }
  }, [emergencyRequest, emergencyResult, setSourceNode, setTargetNode]);

  // Generate nodes and edges for drawing
  const drawNodes = locations.map(loc => {
    const pos = NODE_POSITIONS[loc.id];
    return { ...loc, x: pos.x, y: pos.y };
  });

  const drawEdges = graph.getAllEdges();

  const handleRun = () => {
    setIsPlaying(false);
    clearInterval(timerRef.current);
    
    let engine;
    let result;

    switch (selectedAlgorithm) {
      case 'bfs': engine = new BFSEngine(graph); result = engine.run(sourceNode, targetNode); break;
      case 'dfs': engine = new DFSEngine(graph); result = engine.run(sourceNode, targetNode); break;
      case 'dijkstra': engine = new DijkstraEngine(graph); result = engine.run(sourceNode, targetNode, trafficEnabled); break;
      case 'astar': engine = new AStarEngine(graph); result = engine.run(sourceNode, targetNode, trafficEnabled); break;
      default: engine = new DijkstraEngine(graph); result = engine.run(sourceNode, targetNode, trafficEnabled);
    }

    setSteps(result.steps);
    setCurrentStepIndex(0);
  };

  const handleReset = () => {
    setIsPlaying(false);
    clearInterval(timerRef.current);
    setSteps([]);
    setCurrentStepIndex(-1);
  };

  const togglePlay = () => {
    if (steps.length === 0) {
      handleRun();
      setIsPlaying(true);
      return;
    }
    if (currentStepIndex >= steps.length - 1) {
      setCurrentStepIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            clearInterval(timerRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, speedMs);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, speedMs, steps.length]);

  const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] : null;

  // Determine node class based on current step state
  const getNodeClass = (nodeId) => {
    // ALWAYS prioritize source and target selected nodes
    if (nodeId === sourceNode) return 'node-source';
    if (nodeId === targetNode) return 'node-target';

    if (!currentStep) {
      const isHosp = drawNodes.find(n => n.id === nodeId)?.isHospital;
      return isHosp ? 'node-hospital' : 'node-unvisited';
    }
    
    if (currentStep.path && currentStep.path.includes(nodeId)) return 'node-path';
    if (currentStep.currentNode === nodeId) return 'node-visiting';
    if (currentStep.visited && currentStep.visited.includes(nodeId)) return 'node-visited';
    
    const isHosp = drawNodes.find(n => n.id === nodeId)?.isHospital;
    return isHosp ? 'node-hospital' : 'node-unvisited';
  };

  const getEdgeClass = (from, to) => {
    if (!currentStep) return 'edge-unvisited';
    
    if (currentStep.path && currentStep.path.length > 0) {
      for (let i = 0; i < currentStep.path.length - 1; i++) {
        if ((currentStep.path[i] === from && currentStep.path[i+1] === to) || 
            (currentStep.path[i] === to && currentStep.path[i+1] === from)) {
          return 'edge-path';
        }
      }
    }

    if (currentStep.relaxedEdge && 
        ((currentStep.relaxedEdge.from === from && currentStep.relaxedEdge.to === to) ||
         (currentStep.relaxedEdge.from === to && currentStep.relaxedEdge.to === from))) {
      return 'edge-exploring';
    }

    return 'edge-unvisited';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="page-header">
        <h1 className="page-title">Algorithm Visualizer</h1>
        <p className="page-subtitle">Step-by-step visualization of routing algorithms</p>
        <div className="subject-badges mt-sm">
          <span className="subject-badge ada">BCS401 ADA</span>
          <span className="subject-badge gt">BCS405B GT</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '24px', height: '70vh' }}>
        {/* LEFT: GRAPH CANVAS */}
        <div className="graph-container">
          <svg className="graph-svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
            {/* Draw Edges */}
            {drawEdges.map((edge, idx) => {
              const n1 = drawNodes.find(n => n.id === edge.from);
              const n2 = drawNodes.find(n => n.id === edge.to);
              const edgeClass = getEdgeClass(edge.from, edge.to);
              
              // Calculate midpoint for label
              const mx = (n1.x + n2.x) / 2;
              const my = (n1.y + n2.y) / 2;
              const weight = graph.getEffectiveWeight(edge.from, edge.to, trafficEnabled);
              
              return (
                <g key={`edge-${idx}`} className={`graph-edge ${edgeClass}`}>
                  <line x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y} style={{ strokeWidth: '4px' }} />
                  {/* Backdrop Pill for Weight */}
                  <rect 
                    x={mx - 21} 
                    y={my - 11} 
                    width="42" 
                    height="22" 
                    fill="var(--bg-tertiary)" 
                    stroke="var(--border-light)" 
                    strokeWidth="1.5" 
                    rx="11" 
                  />
                  <text 
                    x={mx} 
                    y={my + 1} 
                    textAnchor="middle" 
                    dominantBaseline="middle" 
                    style={{
                      fontSize: '11px', 
                      fontWeight: 'bold', 
                      fill: 'var(--text-secondary)',
                      fontFamily: 'JetBrains Mono, monospace'
                    }}
                  >
                    {weight.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {/* Draw Nodes */}
            {drawNodes.map(node => {
              const nodeClass = getNodeClass(node.id);
              return (
                <g key={`node-${node.id}`} className={`graph-node ${nodeClass}`} transform={`translate(${node.x}, ${node.y})`}>
                  {/* Circle */}
                  <circle r="22" style={{ strokeWidth: '3.5px' }} />
                  
                  {/* Numeric ID in Center */}
                  <text 
                    y="0.5" 
                    textAnchor="middle" 
                    dominantBaseline="middle" 
                    style={{
                      fontSize: '14px', 
                      fill: (nodeClass === 'node-unvisited') ? 'var(--node-unvisited-text)' : '#fff', 
                      fontWeight: '800'
                    }}
                  >
                    {node.id}
                  </text>
                  
                  {/* Backdrop label box for node details */}
                  <g transform="translate(0, 0)">
                    <rect 
                      x="-75" 
                      y="28" 
                      width="150" 
                      height="30" 
                      rx="6" 
                      fill="var(--bg-card)" 
                      stroke="var(--border-subtle)" 
                      strokeWidth="1.5" 
                      style={{ filter: 'drop-shadow(var(--shadow-sm))' }}
                    />
                    {/* Node Name */}
                    <text 
                      y="37" 
                      textAnchor="middle" 
                      style={{
                        fontSize: '9px', 
                        fill: 'var(--text-primary)', 
                        fontWeight: '700'
                      }}
                    >
                      {node.name.length > 22 ? node.name.substring(0, 20) + '..' : node.name}
                    </text>
                    {/* Node Area */}
                    <text 
                      y="48" 
                      textAnchor="middle" 
                      style={{
                        fontSize: '8px', 
                        fill: 'var(--text-muted)', 
                        fontWeight: '500'
                      }}
                    >
                      {node.area}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
          
          <div style={{ position: 'absolute', bottom: 16, left: 16, background: 'var(--bg-glass)', backdropFilter: 'blur(8px)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-subtle)', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 10, boxShadow: 'var(--shadow-md)' }}>
            <strong style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px', marginBottom: '2px' }}>Graph Legend Index</strong>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
              <div className="flex items-center gap-sm"><div style={{width:12,height:12,borderRadius:6,background:'var(--accent-red)',border:'1px solid #fff'}}></div> Source Selected</div>
              <div className="flex items-center gap-sm"><div style={{width:12,height:12,borderRadius:6,background:'var(--accent-amber)',border:'1px solid #fff'}}></div> Target Selected</div>
              <div className="flex items-center gap-sm"><div style={{width:12,height:12,borderRadius:6,background:'var(--node-unvisited-fill)',border:'1px solid var(--node-unvisited-border)'}}></div> Unvisited Node</div>
              <div className="flex items-center gap-sm"><div style={{width:12,height:12,borderRadius:6,background:'var(--accent-cyan)',border:'1px solid #fff'}}></div> Currently Visiting</div>
              <div className="flex items-center gap-sm"><div style={{width:12,height:12,borderRadius:6,background:'var(--accent-blue)',border:'1px solid #fff',opacity:0.7}}></div> Visited / Relaxed</div>
              <div className="flex items-center gap-sm"><div style={{width:12,height:4,background:'var(--accent-cyan)'}}></div> Edge in Optimal Path</div>
              <div className="flex items-center gap-sm"><div style={{width:12,height:4,borderBottom:'2px dashed var(--accent-cyan)'}}></div> Edge in Relaxation</div>
            </div>
          </div>
        </div>

        {/* RIGHT: ALGORITHM PANEL */}
        <div className="algo-panel flex flex-col">
          <div className="algo-controls" style={{ flexWrap: 'wrap' }}>
            <div className="algo-selector">
              <button className={selectedAlgorithm === 'bfs' ? 'active' : ''} onClick={() => { setSelectedAlgorithm('bfs'); handleReset(); }}>BFS</button>
              <button className={selectedAlgorithm === 'dfs' ? 'active' : ''} onClick={() => { setSelectedAlgorithm('dfs'); handleReset(); }}>DFS</button>
              <button className={selectedAlgorithm === 'dijkstra' ? 'active' : ''} onClick={() => { setSelectedAlgorithm('dijkstra'); handleReset(); }}>Dijkstra</button>
              <button className={selectedAlgorithm === 'astar' ? 'active' : ''} onClick={() => { setSelectedAlgorithm('astar'); handleReset(); }}>A*</button>
            </div>
            
            <div className="flex gap-sm w-full mt-sm">
              <select className="form-select" style={{padding:'4px 8px'}} value={sourceNode} onChange={e => {setSourceNode(Number(e.target.value)); handleReset();}}>
                {locations.map(l => <option key={l.id} value={l.id}>Src: {l.id} {l.area}</option>)}
              </select>
              <select className="form-select" style={{padding:'4px 8px'}} value={targetNode} onChange={e => {setTargetNode(Number(e.target.value)); handleReset();}}>
                {locations.map(l => <option key={l.id} value={l.id}>Tgt: {l.id} {l.area}</option>)}
              </select>
            </div>
            
            <div className="flex items-center gap-md w-full mt-sm">
              <div className="flex gap-sm">
                <button className="btn-icon" onClick={handleReset} title="Reset"><RotateCcw size={16} /></button>
                <button className="btn-icon" onClick={() => { setIsPlaying(false); setCurrentStepIndex(Math.max(0, currentStepIndex - 1)); }} disabled={currentStepIndex <= 0} title="Step Back"><SkipBack size={16} /></button>
                <button className="btn-icon" onClick={togglePlay} style={{ background: isPlaying ? 'var(--accent-red)' : 'var(--accent-green)', borderColor: 'transparent', color: 'white' }}>
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <button className="btn-icon" onClick={() => { setIsPlaying(false); setCurrentStepIndex(Math.min(steps.length - 1, currentStepIndex + 1)); }} disabled={steps.length > 0 && currentStepIndex >= steps.length - 1} title="Step Forward"><SkipForward size={16} /></button>
              </div>
              
              <div className="speed-control">
                <label>Speed</label>
                <input type="range" min="100" max="1500" step="100" value={1600 - speedMs} onChange={e => setSpeedMs(1600 - Number(e.target.value))} className="speed-slider" style={{ direction: 'rtl' }} />
              </div>
            </div>
            
            <div className="text-xs text-muted w-full text-center mt-sm font-mono">
              {steps.length > 0 ? `Step ${currentStepIndex + 1} of ${steps.length}` : 'Ready to run'}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {currentStep ? (
              <>
                <div className="p-md" style={{ background: 'rgba(6, 182, 212, 0.1)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div className="text-sm font-bold text-accent-cyan">Action: {currentStep.type.toUpperCase()}</div>
                  <div className="text-xs mt-xs">{currentStep.message}</div>
                </div>

                {/* Math Explanation Panel for A* */}
                {selectedAlgorithm === 'astar' && (
                  <div className="p-md m-md" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', borderRadius: '8px', fontSize: '11.5px', lineHeight: '1.4' }}>
                    <strong style={{ color: 'var(--accent-amber)', display: 'block', marginBottom: '4px' }}>💡 A* Search Math Principle:</strong>
                    <code style={{ fontSize: '12px', background: 'var(--bg-primary)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginBottom: '6px', fontWeight: 'bold' }}>f(n) = g(n) + h(n)</code>
                    <div style={{ paddingLeft: '4px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <div>• <strong>g(n)</strong>: Path cost (driving distance) from start to node <strong>n</strong>.</div>
                      <div>• <strong>h(n)</strong>: Heuristic (straight-line GPS distance) from node <strong>n</strong> to target hospital.</div>
                      <div>• <strong>f(n)</strong>: Total estimated path cost through node <strong>n</strong>.</div>
                    </div>
                  </div>
                )}

                {/* Data Structure */}
                <div className="data-structure">
                  <div className="ds-title">
                    {selectedAlgorithm === 'bfs' ? 'Queue (FIFO)' : selectedAlgorithm === 'dfs' ? 'Stack (LIFO)' : 'Priority Queue (Min-Heap)'}
                  </div>
                  <div className="ds-items">
                    {currentStep.queue && currentStep.queue.map((id, i) => <span key={i} className={`ds-item ${i===0 ? 'active' : ''}`}>{id}</span>)}
                    {currentStep.stack && currentStep.stack.map((id, i) => <span key={i} className={`ds-item ${i===currentStep.stack.length-1 ? 'active' : ''}`}>{id}</span>)}
                    {currentStep.pq && currentStep.pq.map((entry, i) => (
                      <span key={i} className={`ds-item ${i===0 ? 'active' : ''}`}>
                        {entry.item}({entry.priority.toFixed(1)})
                      </span>
                    ))}
                    {(!currentStep.queue && !currentStep.stack && !currentStep.pq) || 
                     (currentStep.queue?.length===0 || currentStep.stack?.length===0 || currentStep.pq?.length===0) 
                     ? <span className="text-xs text-muted">Empty</span> : null}
                  </div>
                </div>

                <div className="data-structure">
                  <div className="ds-title">Visited Set</div>
                  <div className="ds-items">
                    {currentStep.visited && currentStep.visited.map(id => <span key={id} className="ds-item">{id}</span>)}
                  </div>
                </div>

                {selectedAlgorithm === 'astar' && currentStep.gScore && currentStep.fScore ? (
                  <div className="p-md">
                    <div className="ds-title mb-sm">A* Nodes Evaluation Array (f = g + h)</div>
                    <table className="distance-table">
                      <thead>
                        <tr>
                          <th>Node</th>
                          <th>g(n) (Cost)</th>
                          <th>h(n) (Heur)</th>
                          <th>f(n) (Total)</th>
                          <th>Prev</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(currentStep.gScore).map(([id, gScoreVal]) => {
                          const fScoreVal = currentStep.fScore[id];
                          const hScoreVal = fScoreVal !== Infinity && gScoreVal !== Infinity ? (fScoreVal - gScoreVal) : Infinity;
                          
                          return (
                            <tr key={id} className={currentStep.relaxedEdge?.to === Number(id) ? 'updated' : ''}>
                              <td><strong>{id}</strong></td>
                              <td className={gScoreVal === Infinity ? 'infinity' : ''}>
                                {gScoreVal === Infinity ? '∞' : `${gScoreVal.toFixed(1)}`}
                              </td>
                              <td className={hScoreVal === Infinity ? 'infinity' : ''}>
                                {hScoreVal === Infinity ? '∞' : `${hScoreVal.toFixed(1)}`}
                              </td>
                              <td className={fScoreVal === Infinity ? 'infinity' : ''} style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>
                                {fScoreVal === Infinity ? '∞' : `${fScoreVal.toFixed(1)}`}
                              </td>
                              <td>{currentStep.previous[id] || '-'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  (selectedAlgorithm === 'dijkstra' || selectedAlgorithm === 'bfs' || selectedAlgorithm === 'dfs') && currentStep.distances && (
                    <div className="p-md">
                      <div className="ds-title mb-sm">Distances Array</div>
                      <table className="distance-table">
                        <thead><tr><th>Node</th><th>Dist</th><th>Prev</th></tr></thead>
                        <tbody>
                          {Object.entries(currentStep.distances).map(([id, dist]) => (
                            <tr key={id} className={currentStep.relaxedEdge?.to === Number(id) ? 'updated' : ''}>
                              <td>{id}</td>
                              <td className={dist === Infinity ? 'infinity' : ''}>{dist === Infinity ? '∞' : dist.toFixed(1)}</td>
                              <td>{currentStep.previous[id] || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted p-xl text-center">
                <Play size={48} className="mb-md" style={{ opacity: 0.2 }} />
                <p>Click Play to visualize the algorithm step by step</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
