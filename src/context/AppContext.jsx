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

  // Hospital data with mutable bed counts — fetched from SQLite backend
  const [hospitals, setHospitals] = useState(HOSPITALS.map(h => ({ ...h })));

  useEffect(() => {
    fetch('http://localhost:3001/api/hospitals')
      .then(res => res.json())
      .then(data => {
        setHospitals(HOSPITALS.map(h => {
          const dbData = data.find(d => d.id === h.id);
          return dbData ? { ...h, icuBedsAvailable: dbData.icuBedsAvailable, generalBedsAvailable: dbData.generalBedsAvailable } : { ...h };
        }));
      })
      .catch(err => console.error("Failed to fetch hospitals from DB", err));
  }, []);

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

  // History — fetched from SQLite backend
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/history')
      .then(res => res.json())
      .then(data => setHistory(data))
      .catch(err => console.error("Failed to fetch history from DB", err));
  }, []);



  const addToHistory = useCallback((entry) => {
    const newEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    };
    
    // Save to SQLite DB
    fetch('http://localhost:3001/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEntry)
    })
    .then(res => res.json())
    .then(data => {
      setHistory(prev => [{ ...newEntry, id: data.id }, ...prev]);
    })
    .catch(err => console.error("Failed to save history to DB", err));
  }, []);

  const clearHistory = useCallback(() => {
    fetch('http://localhost:3001/api/history', { method: 'DELETE' })
      .then(() => setHistory([]))
      .catch(err => console.error("Failed to clear history in DB", err));
  }, []);

  // Update hospital beds — persist to SQLite database
  const updateBeds = useCallback((hospitalId, field, value) => {
    setHospitals(prev => {
      const updated = prev.map(h =>
        h.id === hospitalId ? { ...h, [field]: Math.max(0, value) } : h
      );
      
      const targetHospital = updated.find(h => h.id === hospitalId);
      if (targetHospital) {
        fetch(`http://localhost:3001/api/hospitals/${hospitalId}/beds`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            icuBedsAvailable: targetHospital.icuBedsAvailable,
            generalBedsAvailable: targetHospital.generalBedsAvailable
          })
        }).catch(err => console.error("Failed to update beds in DB", err));
      }
      
      return updated;
    });
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
        needsIcu: request.needsIcu,       // Bug 5 fix: was missing
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
    clearHistory,
    recommendationService,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
