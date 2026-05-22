import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { LOCATIONS, EDGES, HOSPITALS, EMERGENCY_TYPES } from '../data/cityData.js';
import CityGraph from '../engine/CityGraph.js';
import RecommendationService from '../engine/RecommendationService.js';

const AppContext = createContext(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }) {
  // Build graph from city data
  const graph = useMemo(() => {
    const g = new CityGraph();
    LOCATIONS.forEach(loc => g.addNode(loc.id, loc));
    EDGES.forEach(edge => g.addEdge(edge.from, edge.to, edge.weight, {
      roadName: edge.roadName,
      trafficMultiplier: edge.trafficMultiplier,
      id: edge.id,
    }));
    return g;
  }, []);

  // Hospital data with mutable bed counts
  const [hospitals, setHospitals] = useState(() =>
    HOSPITALS.map(h => ({ ...h }))
  );

  // Recommendation service
  const recommendationService = useMemo(() =>
    new RecommendationService(graph, hospitals),
    [graph, hospitals]
  );

  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  // Emergency state
  const [emergencyResult, setEmergencyResult] = useState(null);
  const [emergencyRequest, setEmergencyRequest] = useState(null);

  // Algorithm visualizer state
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('dijkstra');
  const [sourceNode, setSourceNode] = useState(1);
  const [targetNode, setTargetNode] = useState(5);

  // Traffic toggle
  const [trafficEnabled, setTrafficEnabled] = useState(true);

  // History
  const [history, setHistory] = useState([]);

  const addToHistory = useCallback((entry) => {
    setHistory(prev => [{
      ...entry,
      id: Date.now(),
      timestamp: new Date().toISOString(),
    }, ...prev]);
  }, []);

  // Update hospital beds
  const updateBeds = useCallback((hospitalId, field, value) => {
    setHospitals(prev => prev.map(h =>
      h.id === hospitalId ? { ...h, [field]: Math.max(0, value) } : h
    ));
  }, []);

  // Run recommendation
  const runRecommendation = useCallback((request) => {
    const service = new RecommendationService(graph, hospitals);
    const result = service.recommend(request);
    setEmergencyRequest(request);
    setEmergencyResult(result);
    if (result.primary) {
      addToHistory({
        patientName: request.patientName || 'Patient',
        emergencyType: request.emergencyType,
        sourceNodeId: request.sourceNodeId,
        needsIcu: request.needsIcu,
        primaryHospital: result.primary.hospital.name,
        backupHospital: result.backup?.hospital?.name || 'None',
        routeCost: result.primary.cost,
        path: result.primary.path,
        algorithm: 'Dijkstra',
      });
    }
    return result;
  }, [graph, hospitals, addToHistory]);

  const value = {
    // Data
    graph,
    locations: LOCATIONS,
    edges: EDGES,
    hospitals,
    emergencyTypes: EMERGENCY_TYPES,

    // State
    theme,
    toggleTheme,
    emergencyResult,
    setEmergencyResult,
    emergencyRequest,
    setEmergencyRequest,
    selectedAlgorithm,
    setSelectedAlgorithm,
    sourceNode,
    setSourceNode,
    targetNode,
    setTargetNode,
    trafficEnabled,
    setTrafficEnabled,
    history,
    
    // Actions
    runRecommendation,
    updateBeds,
    addToHistory,
    recommendationService,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
