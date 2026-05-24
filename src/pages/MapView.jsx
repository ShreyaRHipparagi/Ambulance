import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Play } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { MAPBOX_TOKEN, MAP_CENTER, MAP_ZOOM, ROUTE_COORDS } from '../data/cityData.js';
import * as turf from '@turf/turf';

export default function MapView() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const { locations, hospitals, edges, emergencyResult, emergencyRequest } = useApp();
  const [isAnimating, setIsAnimating] = useState(false);
  const [isFetchingRoute, setIsFetchingRoute] = useState(false);
  const ambulanceMarkerRef = useRef(null);
  const mapRouteGeometryRef = useRef(null);

  useEffect(() => {
    mapboxgl.accessToken = MAPBOX_TOKEN;
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12', // Mapbox Default Day Streets style
      center: [MAP_CENTER.lng, MAP_CENTER.lat],
      zoom: MAP_ZOOM,
      attributionControl: false
    });
    
    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.on('load', () => {
      // Draw all background roads
      edges.forEach(edge => {
        const coords = ROUTE_COORDS[edge.id] || [];
        if (coords.length > 0) {
          map.addSource(`route-${edge.id}`, {
            type: 'geojson',
            data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } }
          });
          map.addLayer({
            id: `route-${edge.id}`,
            type: 'line',
            source: `route-${edge.id}`,
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 
              'line-color': '#475569', 
              'line-width': 3, 
              'line-opacity': 0.5 
            }
          });
        }
      });

      // Draw road distances as small floating badges on midpoints
      edges.forEach(edge => {
        const coords = ROUTE_COORDS[edge.id];
        if (coords && coords.length > 0) {
          const midIdx = Math.floor(coords.length / 2);
          const [lng, lat] = coords[midIdx];
          
          const el = document.createElement('div');
          el.className = 'map-distance-badge';
          el.innerText = `${edge.weight.toFixed(1)} km`;
          el.style.fontSize = '9px';
          el.style.fontWeight = '800';
          el.style.color = '#0f172a';
          el.style.background = '#ffffff';
          el.style.border = '1.5px solid #64748b';
          el.style.padding = '1px 4px';
          el.style.borderRadius = '6px';
          el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.15)';
          el.style.fontFamily = 'monospace';
          el.style.pointerEvents = 'none';
          
          new mapboxgl.Marker({ element: el, anchor: 'center' })
            .setLngLat([lng, lat])
            .addTo(map);
        }
      });

      // Highlight result path if exists
      if (emergencyResult?.primary) {
        const path = emergencyResult.primary.path;
        setIsFetchingRoute(true);

        const pathCoordsString = path.map(nodeId => {
          const loc = locations.find(l => l.id === nodeId);
          return `${loc.lng},${loc.lat}`;
        }).join(';');

        // Query live driving road directions from Mapbox with LIVE TRAFFIC
        fetch(`https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${pathCoordsString}?geometries=geojson&overview=full&annotations=congestion,duration&access_token=${MAPBOX_TOKEN}`)
          .then(res => res.json())
          .then(data => {
            setIsFetchingRoute(false);
            if (data.routes && data.routes.length > 0) {
              const routeGeometry = data.routes[0].geometry;
              mapRouteGeometryRef.current = routeGeometry;

              // Draw the detailed street driving route
              map.addSource('highlight-route', {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  properties: {},
                  geometry: routeGeometry
                }
              });
              map.addLayer({
                id: 'highlight-route-bg',
                type: 'line',
                source: 'highlight-route',
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: { 'line-color': '#06b6d4', 'line-width': 9, 'line-opacity': 0.35, 'line-blur': 5 }
              });
              map.addLayer({
                id: 'highlight-route',
                type: 'line',
                source: 'highlight-route',
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: { 'line-color': '#06b6d4', 'line-width': 4.5 }
              });
            }
          })
          .catch(err => {
            console.error('Error fetching Mapbox directions:', err);
            setIsFetchingRoute(false);
            
            // Fallback: draw static lines if network request fails
            const fallbackPathCoords = [];
            for (let i = 0; i < path.length - 1; i++) {
              const from = path[i];
              const to = path[i+1];
              const edgeId = [from, to].sort().join('-');
              const edge = edges.find(e => [e.from, e.to].sort().join('-') === edgeId);
              
              if (edge && ROUTE_COORDS[edge.id]) {
                let segmentCoords = ROUTE_COORDS[edge.id];
                const fromNode = locations.find(l => l.id === from);
                if (fromNode && Math.abs(segmentCoords[0][0] - fromNode.lng) > 0.001) {
                  segmentCoords = [...segmentCoords].reverse();
                }
                if (i > 0) segmentCoords.shift();
                fallbackPathCoords.push(...segmentCoords);
              }
            }

            if (fallbackPathCoords.length > 0) {
              map.addSource('highlight-route', {
                type: 'geojson',
                data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: fallbackPathCoords } }
              });
              map.addLayer({
                id: 'highlight-route-bg',
                type: 'line',
                source: 'highlight-route',
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: { 'line-color': '#06b6d4', 'line-width': 8, 'line-opacity': 0.3, 'line-blur': 4 }
              });
              map.addLayer({
                id: 'highlight-route',
                type: 'line',
                source: 'highlight-route',
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: { 'line-color': '#06b6d4', 'line-width': 4 }
              });
            }
          });
      }

      // Add markers
      locations.forEach(loc => {
        const container = document.createElement('div');
        container.className = 'marker-container';

        const el = document.createElement('div');
        if (loc.isHospital) {
          el.className = 'hospital-marker';
          el.innerHTML = '🏥';
        } else {
          el.className = 'location-marker';
          el.innerHTML = `${loc.id}`; // Display Node ID inside the marker
        }
        
        if (emergencyRequest && loc.id === emergencyRequest.sourceNodeId) {
          el.className += ' source-marker';
        }

        container.appendChild(el);

        new mapboxgl.Marker({ element: container, anchor: 'center' })
          .setLngLat([loc.lng, loc.lat])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<h4>${loc.name}</h4><p>${loc.area}</p>`))
          .addTo(map);
      });
    });

    return () => map.remove();
  }, [edges, locations, emergencyResult, emergencyRequest]);

  const runAnimation = () => {
    if (!emergencyResult?.primary || !mapRef.current || isAnimating) return;
    
    setIsAnimating(true);
    
    let pathCoords = [];
    // Prioritize dynamically fetched street geometries from Directions API
    if (mapRouteGeometryRef.current) {
      pathCoords = mapRouteGeometryRef.current.coordinates;
    } else {
      // Static coords fallback
      const path = emergencyResult.primary.path;
      for (let i = 0; i < path.length - 1; i++) {
        const from = path[i];
        const to = path[i+1];
        const edgeId = [from, to].sort().join('-');
        const edge = edges.find(e => [e.from, e.to].sort().join('-') === edgeId);
        
        if (edge && ROUTE_COORDS[edge.id]) {
          let segmentCoords = ROUTE_COORDS[edge.id];
          const fromNode = locations.find(l => l.id === from);
          if (fromNode && Math.abs(segmentCoords[0][0] - fromNode.lng) > 0.001) {
            segmentCoords = [...segmentCoords].reverse();
          }
          if (i > 0) segmentCoords.shift();
          pathCoords.push(...segmentCoords);
        }
      }
    }

    if (pathCoords.length < 2) {
      setIsAnimating(false);
      return;
    }

    const route = { type: 'Feature', geometry: { type: 'LineString', coordinates: pathCoords } };
    const lineDistance = turf.length(route, { units: 'kilometers' });
    
    const el = document.createElement('div');
    el.innerHTML = '🚑';
    el.style.fontSize = '32px';
    el.style.filter = 'drop-shadow(0 0 12px rgba(6, 182, 212, 0.95))';
    el.className = 'ambulance-marker';
    
    if (ambulanceMarkerRef.current) ambulanceMarkerRef.current.remove();
    const marker = new mapboxgl.Marker({ element: el }).setLngLat(pathCoords[0]).addTo(mapRef.current);
    ambulanceMarkerRef.current = marker;

    let startTime = null;
    const duration = 6500; // Extra smooth 6.5s animation

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / duration;

      if (progress < 1) {
        const distance = progress * lineDistance;
        const segment = turf.along(route, distance, { units: 'kilometers' });
        marker.setLngLat(segment.geometry.coordinates);
        requestAnimationFrame(animate);
      } else {
        marker.setLngLat(pathCoords[pathCoords.length - 1]);
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="page-header">
        <h1 className="page-title">Interactive Map</h1>
        <p className="page-subtitle">Real-world routing with OpenStreetMap & Mapbox</p>
        <div className="subject-badges mt-sm">
          <span className="subject-badge gt">BCS405B GT</span>
          <span className="subject-badge ada">BCS401 ADA</span>
        </div>
      </div>

      <div className="map-container relative" style={{ display: 'grid', gridTemplateColumns: '3fr 1.5fr', gap: '16px', height: '70vh' }}>
        <div className="relative" style={{ width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
          <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
        </div>
        
        {/* Right Info Panel with Edge breakdown and Algorithm description */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', maxHeight: '70vh', padding: '16px' }}>
          {emergencyResult?.primary ? (
            <>
              <div>
                <h4 className="text-accent-cyan mb-xs">Current Route</h4>
                <div className="text-md font-bold" style={{ color: 'var(--text-primary)' }}>
                  {emergencyResult.primary.hospital.name}
                </div>
                <div className="text-xs text-muted mb-sm">
                  Total Driving Distance: <strong>{emergencyResult.primary.cost.toFixed(2)} km</strong>
                  {isFetchingRoute && <span style={{ color: 'var(--accent-cyan)', marginLeft: '8px' }}> (syncing...)</span>}
                </div>
                
                <button className="btn btn-primary w-full" onClick={runAnimation} disabled={isAnimating || isFetchingRoute}>
                  <Play size={16} /> {isAnimating ? 'En Route...' : 'Run Animation'}
                </button>
              </div>

              {/* SSSP Algorithm Explanation */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                <div className="text-xs font-bold text-accent-amber mb-xs" style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Routing Algorithm
                </div>
                <div style={{ fontSize: '11px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', padding: '8px 10px', borderRadius: '6px', lineHeight: '1.4' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <strong>Dijkstra's SSSP + Mapbox Live Traffic</strong>
                    <span style={{ background: '#10b981', color: '#fff', fontSize: '9px', fontWeight: '800', padding: '1px 5px', borderRadius: '4px', letterSpacing: '0.05em' }}>🟢 LIVE</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    Graph SSSP finds the optimal hospital. Route geometry is then fetched from <strong>Mapbox driving-traffic</strong> API using real-time congestion data to draw the fastest actual road path from node <strong>{emergencyRequest?.sourceNodeId}</strong>.
                  </div>
                </div>
              </div>

              {/* Dynamic Path Leg Breakdown */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                <div className="text-xs font-bold text-accent-cyan mb-sm" style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Road Legs Breakdown
                </div>
                <div className="flex flex-col gap-sm">
                  {(() => {
                    const path = emergencyResult.primary.path;
                    const legs = [];
                    for (let i = 0; i < path.length - 1; i++) {
                      const fromId = path[i];
                      const toId = path[i+1];
                      const fromNode = locations.find(l => l.id === fromId);
                      const toNode = locations.find(l => l.id === toId);
                      
                      // Find matching edge
                      const edgeId = [fromId, toId].sort().join('-');
                      const edge = edges.find(e => [e.from, e.to].sort().join('-') === edgeId);
                      const weight = edge ? edge.weight : 0;
                      const roadName = edge ? edge.roadName : 'Direct Connecting Road';
                      
                      // Traffic & Speed Calculations (Speed decreases as congestion multiplier increases)
                      const multiplier = (edge && edge.trafficMultiplier) ? edge.trafficMultiplier : 1.0;
                      let speed = 60; // baseline speed in km/h
                      let trafficStatus = 'Clear';
                      let trafficColor = 'var(--accent-green)';
                      
                      if (multiplier > 1.7) {
                        speed = 30;
                        trafficStatus = 'Heavy Traffic';
                        trafficColor = 'var(--accent-red)';
                      } else if (multiplier > 1.3) {
                        speed = 40;
                        trafficStatus = 'Moderate Traffic';
                        trafficColor = 'var(--accent-amber)';
                      } else if (multiplier > 1.0) {
                        speed = 50;
                        trafficStatus = 'Light Traffic';
                        trafficColor = 'var(--accent-cyan)';
                      }
                      
                      const duration = Math.max(1, Math.round((weight / speed) * 60));
                      
                      legs.push(
                        <div key={i} className="p-sm rounded-lg" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', fontSize: '11px' }}>
                          <div className="flex justify-between font-bold text-sm mb-xs">
                            <span style={{ color: 'var(--text-primary)' }}>Node {fromId} ➔ Node {toId}</span>
                            <span style={{ color: 'var(--accent-cyan)' }}>{weight.toFixed(1)} km</span>
                          </div>
                          
                          <div className="text-xs font-semibold mb-sm" style={{ color: 'var(--accent-purple)' }}>
                            {fromNode ? fromNode.name : `Node ${fromId}`} to {toNode ? toNode.name : `Node ${toId}`}
                          </div>
                          
                          <div className="flex flex-wrap justify-between items-center gap-xs mt-xs pt-xs" style={{ borderTop: '1px dashed var(--border-subtle)' }}>
                            <span className="font-mono text-muted" style={{ fontSize: '10px' }}>{roadName}</span>
                            <span className="font-bold font-mono" style={{ color: trafficColor }}>{duration} mins</span>
                          </div>
                          
                          <div className="flex justify-between items-center mt-xs text-muted" style={{ fontSize: '10px' }}>
                            <span>Avg Speed: <strong style={{ color: 'var(--text-primary)' }}>{speed} km/h</strong></span>
                            <span style={{ color: trafficColor, fontWeight: '700' }}>● {trafficStatus}</span>
                          </div>
                        </div>
                      );
                    }
                    return legs;
                  })()}
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
              <h4 className="text-accent-amber mb-xs">No Active Emergency</h4>
              <p className="text-xs">Create an emergency case on the Dashboard to calculate and display the shortest driving route legs.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
