import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Play, RefreshCw, Layers, Clock, Zap, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { MAPBOX_TOKEN, MAP_CENTER, MAP_ZOOM, ROUTE_COORDS } from '../data/cityData.js';
import * as turf from '@turf/turf';

// Map congestion labels from Mapbox API to display values
const CONGESTION_CONFIG = {
  unknown:  { color: '#06b6d4', label: 'Unknown',  textColor: '#06b6d4' },
  low:      { color: '#10b981', label: 'Clear',     textColor: '#10b981' },
  moderate: { color: '#f59e0b', label: 'Moderate',  textColor: '#f59e0b' },
  heavy:    { color: '#ef4444', label: 'Heavy',     textColor: '#ef4444' },
  severe:   { color: '#dc2626', label: 'Severe',    textColor: '#dc2626' },
};

export default function MapView() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const { locations, hospitals, edges, emergencyResult, emergencyRequest } = useApp();

  const [isAnimating, setIsAnimating]         = useState(false);
  const [isFetchingRoute, setIsFetchingRoute] = useState(false);
  const [showTrafficLayer, setShowTrafficLayer] = useState(true);
  const [liveRouteData, setLiveRouteData]     = useState(null); // { distance, duration, congestionSummary }
  const [routeLastUpdated, setRouteLastUpdated] = useState(null);

  const ambulanceMarkerRef  = useRef(null);
  const mapRouteGeometryRef = useRef(null);
  const animFrameRef        = useRef(null);

  // ─── Fetch live directions and draw route ────────────────────────────────
  const fetchAndDrawRoute = useCallback((map, path) => {
    if (!path || path.length < 2) return;

    setIsFetchingRoute(true);

    // Remove old route layers/sources if they exist (for refresh)
    ['highlight-route', 'highlight-route-bg', 'highlight-route-congestion'].forEach(id => {
      if (map.getLayer(id)) map.removeLayer(id);
    });
    ['highlight-route', 'highlight-route-congestion'].forEach(id => {
      if (map.getSource(id)) map.removeSource(id);
    });

    const pathCoordsString = path.map(nodeId => {
      const loc = locations.find(l => l.id === nodeId);
      return `${loc.lng},${loc.lat}`;
    }).join(';');

    // driving-traffic gives live traffic-aware route + congestion annotations per segment
    fetch(`https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${pathCoordsString}?geometries=geojson&overview=full&annotations=congestion,duration&access_token=${MAPBOX_TOKEN}`)
      .then(res => res.json())
      .then(data => {
        setIsFetchingRoute(false);
        if (!data.routes || data.routes.length === 0) return;

        const route      = data.routes[0];
        const geometry   = route.geometry;
        mapRouteGeometryRef.current = geometry;

        // Aggregate congestion across all legs
        const allCongestion = data.routes[0].legs.flatMap(leg =>
          (leg.annotation?.congestion || [])
        );
        const counts = { low: 0, moderate: 0, heavy: 0, severe: 0, unknown: 0 };
        allCongestion.forEach(c => { if (counts[c] !== undefined) counts[c]++; });
        const total    = allCongestion.length || 1;
        const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];

        setLiveRouteData({
          distance:           (route.distance / 1000).toFixed(2),
          duration:           Math.round(route.duration / 60),
          dominantCongestion: dominant,
          congestionCounts:   counts,
          total,
          lastFetched:        new Date(),
        });
        setRouteLastUpdated(new Date());

        // Build a GeoJSON FeatureCollection with congestion per segment for color-coding
        const coords = geometry.coordinates;
        const congestionPerCoord = data.routes[0].legs.flatMap(leg =>
          (leg.annotation?.congestion || [])
        );

        // Draw glow bg
        map.addSource('highlight-route', {
          type: 'geojson',
          data: { type: 'Feature', properties: {}, geometry }
        });
        map.addLayer({
          id: 'highlight-route-bg',
          type: 'line',
          source: 'highlight-route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#06b6d4', 'line-width': 14, 'line-opacity': 0.18, 'line-blur': 8 }
        });

        // Build per-segment congestion features
        const segmentFeatures = [];
        for (let i = 0; i < coords.length - 1; i++) {
          const cong = congestionPerCoord[i] || 'unknown';
          const cfg  = CONGESTION_CONFIG[cong] || CONGESTION_CONFIG.unknown;
          segmentFeatures.push({
            type: 'Feature',
            properties: { color: cfg.color },
            geometry: { type: 'LineString', coordinates: [coords[i], coords[i + 1]] }
          });
        }

        map.addSource('highlight-route-congestion', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: segmentFeatures }
        });
        map.addLayer({
          id: 'highlight-route-congestion',
          type: 'line',
          source: 'highlight-route-congestion',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': ['get', 'color'],
            'line-width': 5.5
          }
        });
      })
      .catch(err => {
        console.error('Live traffic fetch failed, using fallback:', err);
        setIsFetchingRoute(false);
        // Fallback static route
        const fallbackCoords = [];
        for (let i = 0; i < path.length - 1; i++) {
          const from = path[i], to = path[i + 1];
          const edgeId = [from, to].sort().join('-');
          const edge   = edges.find(e => [e.from, e.to].sort().join('-') === edgeId);
          if (edge && ROUTE_COORDS[edge.id]) {
            let seg = [...ROUTE_COORDS[edge.id]];
            const fromNode = locations.find(l => l.id === from);
            if (fromNode && Math.abs(seg[0][0] - fromNode.lng) > 0.001) seg.reverse();
            if (i > 0) seg.shift();
            fallbackCoords.push(...seg);
          }
        }
        if (fallbackCoords.length > 0) {
          mapRouteGeometryRef.current = { type: 'LineString', coordinates: fallbackCoords };
          map.addSource('highlight-route', {
            type: 'geojson',
            data: { type: 'Feature', properties: {}, geometry: mapRouteGeometryRef.current }
          });
          map.addLayer({ id: 'highlight-route-bg', type: 'line', source: 'highlight-route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#06b6d4', 'line-width': 10, 'line-opacity': 0.25, 'line-blur': 5 }
          });
          map.addLayer({ id: 'highlight-route', type: 'line', source: 'highlight-route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#06b6d4', 'line-width': 4.5 }
          });
        }
      });
  }, [locations, edges]);

  // ─── Map initialization ────────────────────────────────────────────────
  useEffect(() => {
    mapboxgl.accessToken = MAPBOX_TOKEN;
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [MAP_CENTER.lng, MAP_CENTER.lat],
      zoom: MAP_ZOOM,
      attributionControl: false
    });
    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.on('load', () => {
      // ── 1. Add Mapbox Live Traffic layer ──────────────────────────────
      map.addSource('mapbox-traffic', {
        type: 'vector',
        url: 'mapbox://mapbox.mapbox-traffic-v1'
      });
      map.addLayer({
        id: 'traffic-layer',
        type: 'line',
        source: 'mapbox-traffic',
        'source-layer': 'traffic',
        layout: { 'line-join': 'round', 'line-cap': 'round', visibility: 'visible' },
        paint: {
          'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1.5, 15, 4],
          'line-color': [
            'match', ['get', 'congestion'],
            'low',      '#10b981',
            'moderate', '#f59e0b',
            'heavy',    '#ef4444',
            'severe',   '#dc2626',
            '#94a3b8'
          ],
          'line-opacity': 0.75
        }
      });

      // ── 2. Draw background graph edges ────────────────────────────────
      edges.forEach(edge => {
        const coords = ROUTE_COORDS[edge.id] || [];
        if (coords.length > 0) {
          map.addSource(`route-${edge.id}`, {
            type: 'geojson',
            data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } }
          });
          map.addLayer({
            id: `route-${edge.id}`, type: 'line', source: `route-${edge.id}`,
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#334155', 'line-width': 2.5, 'line-opacity': 0.45 }
          });
        }
      });

      // ── 3. Distance badges ─────────────────────────────────────────────
      edges.forEach(edge => {
        const coords = ROUTE_COORDS[edge.id];
        if (coords && coords.length > 0) {
          const midIdx = Math.floor(coords.length / 2);
          const [lng, lat] = coords[midIdx];
          const el = document.createElement('div');
          el.innerText = `${edge.weight.toFixed(1)} km`;
          Object.assign(el.style, {
            fontSize: '9px', fontWeight: '800', color: '#0f172a',
            background: 'rgba(255,255,255,0.92)', border: '1.5px solid #94a3b8',
            padding: '1px 5px', borderRadius: '6px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
            fontFamily: 'monospace', pointerEvents: 'none'
          });
          new mapboxgl.Marker({ element: el, anchor: 'center' }).setLngLat([lng, lat]).addTo(map);
        }
      });

      // ── 4. Draw live route ────────────────────────────────────────────
      if (emergencyResult?.primary) {
        fetchAndDrawRoute(map, emergencyResult.primary.path);
      }

      // ── 5. Node & hospital markers ────────────────────────────────────
      locations.forEach(loc => {
        const container = document.createElement('div');
        container.className = 'marker-container';
        const el = document.createElement('div');

        const isSource      = emergencyRequest && loc.id === emergencyRequest.sourceNodeId;
        const isDestination = emergencyResult?.primary?.hospital?.nodeId === loc.id;

        if (loc.isHospital) {
          el.className = 'hospital-marker';
          el.innerHTML = isDestination ? '🎯' : '🏥';
          if (isDestination) {
            el.style.background = '#10b981';
            el.style.boxShadow  = '0 0 0 4px rgba(16,185,129,0.35)';
          }
        } else {
          el.className = isSource ? 'location-marker source-marker' : 'location-marker';
          el.innerHTML = `${loc.id}`;
        }

        container.appendChild(el);
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<h4>${loc.name}</h4><p>${loc.area}</p>${loc.isHospital ? `<p style="color:#10b981;font-weight:700">🏥 Hospital</p>` : ''}`
        );
        new mapboxgl.Marker({ element: container, anchor: 'center' })
          .setLngLat([loc.lng, loc.lat])
          .setPopup(popup)
          .addTo(map);
      });
    });

    return () => { map.remove(); if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [edges, locations, emergencyResult, emergencyRequest, fetchAndDrawRoute]);

  // ─── Toggle traffic layer visibility ──────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    if (map.getLayer('traffic-layer')) {
      map.setLayoutProperty('traffic-layer', 'visibility', showTrafficLayer ? 'visible' : 'none');
    }
  }, [showTrafficLayer]);

  // ─── Refresh route with current traffic ───────────────────────────────
  const handleRefreshRoute = () => {
    const map = mapRef.current;
    if (!map || !emergencyResult?.primary) return;
    fetchAndDrawRoute(map, emergencyResult.primary.path);
  };

  // ─── Ambulance animation ───────────────────────────────────────────────
  const runAnimation = () => {
    if (!emergencyResult?.primary || !mapRef.current || isAnimating) return;
    setIsAnimating(true);

    const pathCoords = mapRouteGeometryRef.current?.coordinates;
    if (!pathCoords || pathCoords.length < 2) { setIsAnimating(false); return; }

    const route       = { type: 'Feature', geometry: { type: 'LineString', coordinates: pathCoords } };
    const lineDistance = turf.length(route, { units: 'kilometers' });

    const el = document.createElement('div');
    el.innerHTML = '🚑';
    Object.assign(el.style, {
      fontSize: '30px', lineHeight: '1',
      filter: 'drop-shadow(0 0 10px rgba(6,182,212,0.9))',
      transformOrigin: 'center center',
      transition: 'transform 0.1s linear'
    });
    el.className = 'ambulance-marker';

    if (ambulanceMarkerRef.current) ambulanceMarkerRef.current.remove();
    const marker = new mapboxgl.Marker({ element: el, rotationAlignment: 'map' })
      .setLngLat(pathCoords[0]).addTo(mapRef.current);
    ambulanceMarkerRef.current = marker;

    // Fit map to route with animation
    const bounds = pathCoords.reduce((b, c) => b.extend(c), new mapboxgl.LngLatBounds(pathCoords[0], pathCoords[0]));
    mapRef.current.fitBounds(bounds, { padding: 80, duration: 1000 });

    let startTime = null;
    const duration = 8000;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const distance = progress * lineDistance;
      const point    = turf.along(route, distance, { units: 'kilometers' });
      const [lng, lat] = point.geometry.coordinates;
      marker.setLngLat([lng, lat]);

      // Rotate ambulance to face direction of travel
      if (progress < 1 && progress > 0.001) {
        const prevDist   = Math.max(0, distance - 0.02);
        const prevPoint  = turf.along(route, prevDist, { units: 'kilometers' });
        const bearing    = turf.bearing(prevPoint, point);
        marker.setRotation(bearing);
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        marker.setLngLat(pathCoords[pathCoords.length - 1]);
        setIsAnimating(false);
      }
    };
    animFrameRef.current = requestAnimationFrame(animate);
  };

  // ─── Helpers ───────────────────────────────────────────────────────────
  const getCongestionColor = (multiplier) => {
    if (multiplier > 1.7) return { color: 'var(--accent-red)',   label: 'Heavy',    speed: 30 };
    if (multiplier > 1.3) return { color: 'var(--accent-amber)', label: 'Moderate', speed: 40 };
    if (multiplier > 1.0) return { color: 'var(--accent-cyan)',  label: 'Light',    speed: 50 };
    return                       { color: 'var(--accent-green)', label: 'Clear',    speed: 60 };
  };

  const dominantCfg = liveRouteData
    ? (CONGESTION_CONFIG[liveRouteData.dominantCongestion] || CONGESTION_CONFIG.unknown)
    : null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="page-header">
        <h1 className="page-title">Interactive Map</h1>
        <p className="page-subtitle">Real-world routing with OpenStreetMap & Mapbox — Live Traffic Enabled</p>
        <div className="subject-badges mt-sm">
          <span className="subject-badge gt">BCS405B GT</span>
          <span className="subject-badge ada">BCS401 ADA</span>
          {liveRouteData && (
            <span style={{ background: '#10b981', color: '#fff', fontSize: '10px', fontWeight: '800',
              padding: '2px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              🟢 LIVE TRAFFIC
            </span>
          )}
        </div>
      </div>

      {/* ── Live Stats Bar ─────────────────────────────────────────────── */}
      {liveRouteData && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '10px', marginBottom: '12px'
          }}
        >
          {[
            { icon: <Zap size={14}/>, label: 'Mapbox Distance', value: `${liveRouteData.distance} km`, color: '#06b6d4' },
            { icon: <Clock size={14}/>, label: 'Live ETA', value: `${liveRouteData.duration} mins`, color: '#8b5cf6' },
            { icon: <AlertTriangle size={14}/>, label: 'Congestion', value: dominantCfg.label, color: dominantCfg.color },
            { icon: <RefreshCw size={14}/>, label: 'Last Updated',
              value: routeLastUpdated ? routeLastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—',
              color: '#f59e0b' },
          ].map((stat, i) => (
            <div key={i} className="glass-card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ color: stat.color, flexShrink: 0 }}>{stat.icon}</div>
              <div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>{stat.label}</div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: stat.color, fontFamily: 'JetBrains Mono, monospace' }}>{stat.value}</div>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      <div className="map-container relative" style={{ display: 'grid', gridTemplateColumns: '3fr 1.5fr', gap: '16px', height: '68vh' }}>
        {/* ── Map ──────────────────────────────────────────────────────── */}
        <div className="relative" style={{ width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
          <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

          {/* Traffic toggle pill */}
          <div style={{
            position: 'absolute', bottom: '12px', left: '12px', zIndex: 10,
            display: 'flex', gap: '6px'
          }}>
            <button
              onClick={() => setShowTrafficLayer(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                background: showTrafficLayer ? 'rgba(16,185,129,0.92)' : 'rgba(30,41,59,0.92)',
                color: '#fff', border: 'none', borderRadius: '20px',
                padding: '5px 12px', fontSize: '11px', fontWeight: '700',
                cursor: 'pointer', backdropFilter: 'blur(8px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.25)', transition: 'all 0.2s'
              }}
            >
              <Layers size={12} /> {showTrafficLayer ? '🟢 Traffic ON' : '⚫ Traffic OFF'}
            </button>
          </div>

          {/* Traffic legend */}
          {showTrafficLayer && (
            <div style={{
              position: 'absolute', bottom: '12px', right: '12px', zIndex: 10,
              background: 'rgba(15,23,42,0.88)', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
              padding: '8px 10px', fontSize: '10px', color: '#fff'
            }}>
              <div style={{ fontWeight: '700', marginBottom: '5px', opacity: 0.7, letterSpacing: '0.05em' }}>LIVE TRAFFIC</div>
              {[
                { c: '#10b981', l: 'Clear' },
                { c: '#f59e0b', l: 'Moderate' },
                { c: '#ef4444', l: 'Heavy' },
                { c: '#dc2626', l: 'Severe' },
              ].map(({ c, l }) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                  <div style={{ width: '24px', height: '4px', borderRadius: '2px', background: c }} />
                  <span style={{ opacity: 0.85 }}>{l}</span>
                </div>
              ))}
            </div>
          )}

          {isFetchingRoute && (
            <div style={{
              position: 'absolute', top: '12px', left: '12px', zIndex: 10,
              background: 'rgba(6,182,212,0.15)', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(6,182,212,0.4)', borderRadius: '8px',
              padding: '6px 12px', fontSize: '11px', color: '#06b6d4', fontWeight: '700',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#06b6d4', animation: 'pulse 1s infinite' }} />
              Fetching live traffic route...
            </div>
          )}
        </div>

        {/* ── Right Info Panel ─────────────────────────────────────────── */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', maxHeight: '68vh', padding: '16px' }}>
          {emergencyResult?.primary ? (
            <>
              {/* Route header */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <h4 className="text-accent-cyan" style={{ margin: 0 }}>Current Route</h4>
                  <button
                    onClick={handleRefreshRoute}
                    disabled={isFetchingRoute}
                    title="Refresh route with current traffic"
                    style={{
                      background: 'transparent', border: '1px solid var(--border-subtle)',
                      borderRadius: '6px', padding: '3px 7px', cursor: 'pointer',
                      color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '3px',
                      fontSize: '10px', fontWeight: '700', opacity: isFetchingRoute ? 0.5 : 1
                    }}
                  >
                    <RefreshCw size={10} style={{ animation: isFetchingRoute ? 'spin 1s linear infinite' : 'none' }} />
                    Refresh
                  </button>
                </div>
                <div className="text-md font-bold" style={{ color: 'var(--text-primary)' }}>
                  {emergencyResult.primary.hospital.name}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '6px', color: 'var(--accent-cyan)', fontWeight: '700', fontFamily: 'monospace' }}>
                    Graph: {emergencyResult.primary.cost.toFixed(2)} km
                  </span>
                  {liveRouteData && (
                    <span style={{ fontSize: '11px', background: 'rgba(16,185,129,0.12)', padding: '2px 8px', borderRadius: '6px', color: '#10b981', fontWeight: '700', fontFamily: 'monospace', border: '1px solid rgba(16,185,129,0.3)' }}>
                      Live: {liveRouteData.distance} km • {liveRouteData.duration} min
                    </span>
                  )}
                </div>

                <button className="btn btn-primary w-full" style={{ marginTop: '10px' }} onClick={runAnimation} disabled={isAnimating || isFetchingRoute}>
                  <Play size={16} /> {isAnimating ? '🚑 En Route...' : 'Run Animation'}
                </button>
              </div>

              {/* Algorithm Info */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                <div className="text-xs font-bold text-accent-amber mb-xs" style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Routing Algorithm
                </div>
                <div style={{ fontSize: '11px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', padding: '8px 10px', borderRadius: '6px', lineHeight: '1.5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
                    <strong>Dijkstra's SSSP + Mapbox Live Traffic</strong>
                    <span style={{ background: '#10b981', color: '#fff', fontSize: '9px', fontWeight: '800', padding: '1px 5px', borderRadius: '4px' }}>🟢 LIVE</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    Graph SSSP (O((V+E)logV)) finds optimal hospital. <strong>Mapbox driving-traffic</strong> API then fetches the real-time traffic-aware road path from node <strong>{emergencyRequest?.sourceNodeId}</strong> with per-segment congestion colors.
                  </div>
                </div>
              </div>

              {/* Live Congestion Summary */}
              {liveRouteData && (
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                  <div className="text-xs font-bold mb-sm" style={{ textTransform: 'uppercase', letterSpacing: '0.04em', color: dominantCfg.color }}>
                    Live Congestion Summary
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {Object.entries(liveRouteData.congestionCounts)
                      .filter(([, count]) => count > 0)
                      .sort((a, b) => b[1] - a[1])
                      .map(([level, count]) => {
                        const cfg = CONGESTION_CONFIG[level] || CONGESTION_CONFIG.unknown;
                        const pct = Math.round((count / liveRouteData.total) * 100);
                        return (
                          <div key={level}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', fontSize: '10px' }}>
                              <span style={{ color: cfg.color, fontWeight: '700' }}>● {cfg.label}</span>
                              <span style={{ color: 'var(--text-muted)' }}>{pct}%</span>
                            </div>
                            <div style={{ height: '4px', borderRadius: '2px', background: 'var(--bg-primary)', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: cfg.color, borderRadius: '2px', transition: 'width 0.6s ease' }} />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Road Legs Breakdown */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                <div className="text-xs font-bold text-accent-cyan mb-sm" style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Road Legs Breakdown
                </div>
                <div className="flex flex-col gap-sm">
                  {(() => {
                    const path = emergencyResult.primary.path;
                    return path.slice(0, -1).map((fromId, i) => {
                      const toId    = path[i + 1];
                      const fromNode = locations.find(l => l.id === fromId);
                      const toNode   = locations.find(l => l.id === toId);
                      const edgeId   = [fromId, toId].sort().join('-');
                      const edge     = edges.find(e => [e.from, e.to].sort().join('-') === edgeId);
                      const weight   = edge ? edge.weight : 0;
                      const roadName = edge ? edge.roadName : 'Direct Road';
                      const { color, label, speed } = getCongestionColor(edge?.trafficMultiplier || 1.0);
                      const duration = Math.max(1, Math.round((weight / speed) * 60));

                      return (
                        <div key={i} style={{ background: 'var(--bg-primary)', border: `1px solid var(--border-subtle)`, borderRadius: '8px', padding: '10px', fontSize: '11px', borderLeft: `3px solid ${color}` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontWeight: '800', color: 'var(--text-primary)' }}>Node {fromId} ➔ Node {toId}</span>
                            <span style={{ color: 'var(--accent-cyan)', fontWeight: '700', fontFamily: 'monospace' }}>{weight.toFixed(1)} km</span>
                          </div>
                          <div style={{ color: 'var(--text-secondary)', marginBottom: '6px', fontSize: '10px' }}>
                            {fromNode?.name} → {toNode?.name}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--border-subtle)', paddingTop: '5px' }}>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{roadName}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ color, fontWeight: '800', fontSize: '10px' }}>● {label}</span>
                              <span style={{ fontFamily: 'monospace', fontWeight: '700', color, fontSize: '11px' }}>{duration} min</span>
                            </div>
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px' }}>
                            Avg: <strong style={{ color: 'var(--text-primary)' }}>{speed} km/h</strong>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🗺️</div>
              <h4 className="text-accent-amber mb-xs">No Active Emergency</h4>
              <p className="text-xs" style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Create an emergency case on the Dashboard to calculate and visualize the shortest live-traffic-aware driving route with real-time congestion data.
              </p>
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '10px', color: 'var(--text-muted)' }}>
                {showTrafficLayer && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                    <div style={{ width: '16px', height: '3px', background: 'linear-gradient(to right, #10b981, #f59e0b, #ef4444)', borderRadius: '2px' }} />
                    Live traffic layer is active on the map
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
