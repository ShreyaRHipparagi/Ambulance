# Smart Ambulance Routing System — Comprehensive Technical Documentation

> **Complete architectural blueprint, function call traces, data flows, algorithm analyses, bug audit, and database design.**  
> Last updated: May 2026 — reflects all fixes and enhancements.

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Data Layer — Static Database](#2-data-layer--static-database)
3. [Graph Engine — Data Structures & Algorithms](#3-graph-engine--data-structures--algorithms)
4. [State Management — AppContext](#4-state-management--appcontext)
5. [Page-by-Page Function Traces](#5-page-by-page-function-traces)
6. [MapView Deep Dive — Live Traffic Pipeline](#6-mapview-deep-dive--live-traffic-pipeline)
7. [Algorithm Visualizer Deep Dive](#7-algorithm-visualizer-deep-dive)
8. [Database Schema (DBMS / BCS403)](#8-database-schema-dbms--bcs403)
9. [localStorage Persistence Layer](#9-localstorage-persistence-layer)
10. [Bug Audit & Fixes](#10-bug-audit--fixes)
11. [Complete Function Call Trace — App Startup to Result](#11-complete-function-call-trace--app-startup-to-result)

---

## 1. System Architecture Overview

### Component Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BROWSER (Client Only)                        │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                     React SPA (Vite)                          │   │
│  │                                                               │   │
│  │  ┌─────────────┐   ┌──────────────┐   ┌─────────────────┐   │   │
│  │  │  App.jsx    │   │ AppContext   │   │   cityData.js   │   │   │
│  │  │  Router     │──►│ Global State │◄──│  Static DB      │   │   │
│  │  │  Navbar     │   │ localStorage │   │  13 nodes       │   │   │
│  │  └──────┬──────┘   │ Persistence  │   │  23 edges       │   │   │
│  │         │           └──────┬───────┘   │  6 hospitals    │   │   │
│  │         │                  │            └─────────────────┘   │   │
│  │  ┌──────▼──────────────────▼──────────────────────────────┐   │   │
│  │  │                     Pages                               │   │   │
│  │  │  Dashboard  EmergencyEntry  Results  MapView            │   │   │
│  │  │  AlgorithmVisualizer  Hospitals  ERDiagram  History     │   │   │
│  │  └─────────────────────────┬──────────────────────────────┘   │   │
│  │                             │                                   │   │
│  │  ┌──────────────────────────▼──────────────────────────────┐   │   │
│  │  │                   Engine Layer                           │   │   │
│  │  │  CityGraph  PriorityQueue  DijkstraEngine  AStarEngine  │   │   │
│  │  │  BFSEngine  DFSEngine  RecommendationService            │   │   │
│  │  └─────────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│   localStorage:  theme | emergency_history | hospital_beds            │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │ HTTPS fetch
                          ┌────────▼──────────────┐
                          │  Mapbox API (External) │
                          │  driving-traffic route │
                          │  GeoJSON + congestion  │
                          └───────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| UI Framework | React 18 | Component tree, hooks, context |
| Build Tool | Vite 5 | Dev server, HMR, production bundling |
| Maps | Mapbox GL JS 3 | Real OSM map rendering |
| Geospatial | Turf.js 6 | Along-path interpolation, bearing, distance |
| Animation | Framer Motion 11 | Page transitions, mount animations |
| Icons | Lucide React | All UI icons |
| Styling | Vanilla CSS | Design system via CSS custom properties |
| Persistence | localStorage | theme, history, hospital beds |
| External API | Mapbox Directions | Live traffic-aware route geometry |

---

## 2. Data Layer — Static Database

**File:** `src/data/cityData.js`

This file is the **static database** of the application. All graph data, hospital records, route waypoints, and configuration are exported from here.

### Exports

```javascript
MAPBOX_TOKEN      // Mapbox API access key (split string for git safety)
MAP_CENTER        // { lat: 12.9080, lng: 77.5250 } — center of Bangalore area
MAP_ZOOM          // 12.5 — initial zoom level
LOCATIONS         // Array<Location> — 13 GPS-verified nodes
EDGES             // Array<Edge> — 23 weighted bidirectional road connections
ROUTE_COORDS      // { [edgeId]: [lng,lat][] } — Mapbox waypoints per edge
HOSPITALS         // Array<Hospital> — 6 real hospitals with beds & specializations
EMERGENCY_TYPES   // Array<EmergencyType> — 6 types with icon & description
NODE_POSITIONS    // { [nodeId]: {x,y} } — SVG canvas positions for visualizer
SUBJECTS          // Academic subject metadata
PAGE_SUBJECTS     // Which subjects each page demonstrates
```

### Location Node Schema

```typescript
interface Location {
  id: number;           // 1–13
  name: string;         // Display name
  area: string;         // Bangalore area name
  lat: number;          // GPS latitude (verified)
  lng: number;          // GPS longitude (verified)
  isHospital: boolean;  // true if this node is a hospital
  hospitalId?: string;  // 'H1'–'H6' if isHospital === true
}
```

### Edge Schema

```typescript
interface Edge {
  id: string;              // 'e1'–'e24' (note: no e12 — deleted during restructure)
  from: number;            // Source node ID
  to: number;              // Destination node ID
  weight: number;          // Distance in km (base graph weight)
  roadName: string;        // Real Bangalore road name
  trafficMultiplier: number; // 1.0=clear, 1.5=moderate, 2.0=heavy
}
```

### Hospital Schema

```typescript
interface Hospital {
  id: string;                       // 'H1'–'H6'
  name: string;                     // Full name
  shortName: string;                // Abbreviated name
  nodeId: number;                   // Which graph node this hospital sits at
  contact: string;                  // Phone number
  address: string;                  // Real address
  specializations: string[];        // ['CARDIAC', 'TRAUMA', ...]
  icuBedsTotal: number;
  icuBedsAvailable: number;         // Mutable — updated via Hospitals page
  generalBedsTotal: number;
  generalBedsAvailable: number;     // Mutable — updated via Hospitals page
  color: string;                    // Hex color for UI display
}
```

### Key Design Decision: `ROUTE_COORDS`

Because Mapbox Directions API calls are async and can fail (network issues, rate limits), every edge also has a `ROUTE_COORDS` entry — an array of `[lng, lat]` waypoints that manually approximate the road path. These are used as a **fallback** when the live API fails.

```javascript
'e2': [[77.5028, 12.9060], [77.4984, 12.9000], [77.4984, 12.8985]]
//      Node 1 start          intermediate         Node 5 (BGS) end
```

---

## 3. Graph Engine — Data Structures & Algorithms

### `CityGraph.js` — Adjacency List Graph

```javascript
class CityGraph {
  nodes: Map<nodeId, LocationData>
  edges: Map<nodeId, Array<{nodeId, weight, data}>>
  
  addNode(id, data)              // O(1) — map insert
  addEdge(from, to, weight, data) // O(1) — pushes to both from and to arrays (bidirectional)
  getNeighbors(nodeId)           // O(1) — map lookup → neighbor array
  getNode(nodeId)                // O(1)
  getEdge(from, to)              // O(degree) — linear scan of neighbor list
  getAllNodes()                  // O(1) — returns Map
  getAllEdges()                  // O(V+E) — deduplicates with Set
  hasNode(nodeId)                // O(1)
  
  getEffectiveWeight(from, to, useTraffic):
    // Returns edge.weight * (useTraffic ? edge.data.trafficMultiplier : 1)
    // This is the key function that makes traffic-aware routing work
}
```

**Graph properties:**
- V = 13 vertices, E = 23 edges (undirected, so 46 directed adjacency entries)
- All edges have positive weights → Dijkstra is valid
- Graph is connected (all nodes reachable from any other)

### `PriorityQueue.js` — Binary Min-Heap

Implements a binary min-heap where the element with **lowest priority** is always at the root.

```javascript
class PriorityQueue {
  heap: Array<{item, priority}>
  
  insert(item, priority)  // O(log N) — push + bubbleUp
  extractMin()            // O(log N) — swap root with last, pop, sinkDown
  peek()                  // O(1)
  isEmpty()               // O(1)
  size()                  // O(1)
  toArray()               // O(N) — snapshot for step visualization
}
```

**bubbleUp:** After insert at index `i`, compares with parent at `⌊(i-1)/2⌋` and swaps upward until heap property is satisfied.

**sinkDown:** After extractMin places last element at root, compares with children at `2i+1` and `2i+2`, swaps down with smaller child.

### `DijkstraEngine.js` — Single Source Shortest Path

**Complexity:** O((V+E) log V) — each node extracted once, each edge relaxed once, with O(log V) PQ operations.

```javascript
run(startId, targetId, useTraffic):
  distances = {all: Infinity, start: 0}
  previous = {all: null}
  visited = Set()
  pq = new PriorityQueue()
  steps = []              // ← captures every state for AlgorithmVisualizer
  
  pq.insert(start, 0)
  
  while pq not empty:
    {item: u, priority: d} = pq.extractMin()
    
    if u === target: found = true; break
    if visited(u): continue           // handles duplicate PQ entries (lazy deletion)
    visited.add(u)
    
    for each neighbor v of u:
      w = graph.getEffectiveWeight(u, v, useTraffic)
      if d + w < distances[v]:
        distances[v] = d + w
        previous[v] = u
        pq.insert(v, distances[v])    // lazy insert (may have stale entries)
        steps.push({ type:'relax', ... })
  
  // Reconstruct path via previous[] backtracking
  path = []
  curr = target
  while curr != null: path.unshift(curr); curr = previous[curr]
  
  return { found, cost: distances[target], path, steps, visitedCount }
```

**Key insight:** We use **lazy deletion** — when a better distance is found for a node already in the PQ, we insert a new entry and ignore the stale one when extracted (via `if visited(u): continue`).

### `AStarEngine.js` — Heuristic Search

**Heuristic:** Haversine great-circle distance from node to target. This is **admissible** (never overestimates real road distance) so A* finds the optimal path.

```javascript
h(node) = haversineDistance(node.lat, node.lng, target.lat, target.lng)

f(node) = g(node) + h(node)
// g = actual cost from start (gScore)
// h = straight-line GPS estimate to target
// f = priority in the queue
```

A* prunes nodes that are geographically far from the target, converging faster than pure Dijkstra in practice (though both yield optimal results on this graph size).

### `BFSEngine.js` — Breadth-First Search

Queue-based level traversal. Not optimal for weighted graphs (finds path with fewest hops, not minimum distance). Used for educational visualization only.

### `DFSEngine.js` — Depth-First Search

Stack-based (or recursive) exploration. Demonstrates graph traversal patterns, backtracking, and connectivity. Not optimal for pathfinding.

### `RecommendationService.js` — Hospital Selection Pipeline

```javascript
recommend(request):
  // Stage 1: Specialization filter
  candidates = hospitals.filter(h => h.specializations.includes(emergencyType))
  
  // Stage 2: Bed availability filter
  candidates = candidates.filter(h =>
    needsIcu ? h.icuBedsAvailable > 0 : h.generalBedsAvailable > 0
  )
  
  // Stage 3: Dijkstra per candidate
  validCandidates = []
  for hospital in candidates:
    result = dijkstra.run(sourceNodeId, hospital.nodeId, useTraffic)
    if result.found:
      validCandidates.push({ hospital, cost: result.cost, path: result.path })
  
  validCandidates.sort((a,b) => a.cost - b.cost)
  
  return {
    primary: validCandidates[0],      // cheapest reachable qualifying hospital
    backup: validCandidates[1],       // second cheapest
    allCandidates: validCandidates,
    filterSteps,                       // for display on Results page
    explanation                        // human-readable string
  }
```

**Why run Dijkstra per candidate hospital instead of all-targets?**  
Dijkstra from a single source computes shortest paths to ALL reachable nodes in one pass. We could compute once and read off costs for all hospitals. The current implementation runs once per candidate — slightly less efficient but simpler and correctness-proven for this scale (6 hospitals, 13 nodes).

---

## 4. State Management — AppContext

**File:** `src/context/AppContext.jsx`

The AppContext is the **single source of truth** for all runtime state. It wraps the entire application tree.

### State Variables

```javascript
// Graph (memo — built once from cityData.js)
const graph = useMemo(() => new CityGraph() + addNodes + addEdges, [])

// Hospitals — initialized from cityData.js, with localStorage bed overrides
const [hospitals, setHospitals] = useState(() => {
  const saved = localStorage.getItem('hospital_beds');
  if (saved) merge saved bed counts into HOSPITALS base data;
  else return HOSPITALS.map(h => ({...h}));
})

// Theme — persisted to localStorage
const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
useEffect(() => { localStorage.setItem('theme', theme); }, [theme])

// Emergency state (in-memory only — cleared on page refresh)
const [emergencyResult, setEmergencyResult] = useState(null)
const [emergencyRequest, setEmergencyRequest] = useState(null)

// Visualizer state
const [selectedAlgorithm, setSelectedAlgorithm] = useState('dijkstra')
const [sourceNode, setSourceNode] = useState(1)
const [targetNode, setTargetNode] = useState(5)
const [trafficEnabled, setTrafficEnabled] = useState(true)

// History — persisted to localStorage
const [history, setHistory] = useState(() => {
  const saved = localStorage.getItem('emergency_history');
  return saved ? JSON.parse(saved) : [];
})
useEffect(() => {
  localStorage.setItem('emergency_history', JSON.stringify(history));
}, [history])
```

### Key Actions

```javascript
// Run emergency recommendation — full SSSP pipeline
runRecommendation(request):
  setEmergencyRequest(request)
  service = new RecommendationService(graph, hospitals)
  result = service.recommend(request)
  setEmergencyResult(result)
  if result.primary: addToHistory({...entry, needsIcu: request.needsIcu})
  return result

// Update bed count + persist to localStorage
updateBeds(hospitalId, field, value):
  setHospitals(prev => {
    updated = prev.map(h => h.id===hospitalId ? {...h, [field]: max(0, value)} : h)
    localStorage.setItem('hospital_beds', JSON.stringify(
      updated.map(h => ({ id, icuBedsAvailable, generalBedsAvailable }))
    ))
    return updated
  })

// Add history entry (auto-persisted via useEffect)
addToHistory(entry):
  setHistory(prev => [{ ...entry, id: Date.now(), timestamp: new Date().toISOString() }, ...prev])

// Clear all history
clearHistory():
  setHistory([])
  localStorage.removeItem('emergency_history')
```

---

## 5. Page-by-Page Function Traces

### Dashboard.jsx

**Route:** `/`  
**Reads from context:** `locations, hospitals, edges, emergencyTypes, history`

- Renders 4 stat cards: locations.length, hospitals.length, edges.length, emergencyTypes.length
- Renders hospital status bars: `(icuBedsAvailable / icuBedsTotal) * 100%` width
- Shows last 3 history entries from `history.slice(0, 3)`
- Navigation buttons to `/emergency`, `/visualizer`, `/map`

---

### EmergencyEntry.jsx

**Route:** `/emergency`  
**Reads from context:** `locations, emergencyTypes, runRecommendation, trafficEnabled, setTrafficEnabled`

```
Component mounts
  ↓
useState formData = {
  patientName: '',
  age: '',
  contact: '',
  bloodGroup: 'A+',
  sourceLocationId: locations[0].id,   // number type
  emergencyType: 'CARDIAC',
  needsIcu: true
}

User selects source location:
  onChange → parseInt(e.target.value)  // always store as number, not string

User clicks "Find Best Hospital & Route":
  handleSubmit(e)
    e.preventDefault()
    if !formData.patientName → alert
    runRecommendation({
      sourceNodeId: parseInt(formData.sourceLocationId),
      emergencyType: formData.emergencyType,
      needsIcu: formData.needsIcu,
      patientName: formData.patientName,
      useTraffic: trafficEnabled
    })
    navigate('/results')
```

---

### Results.jsx

**Route:** `/results`  
**Reads from context:** `emergencyResult, emergencyRequest, locations`

- If `!emergencyResult` → shows "No Results Available" with navigation to `/emergency`
- Displays patient summary bar (name, type, ICU, source location)
- **Primary hospital card:** name, address, specializations, ETA (`cost/50*60` minutes), distance, path visualization, explanation
- **Backup hospital card:** name, distance, path
- **Filter steps timeline:** shows Specialization → Bed Availability → Shortest Path stages
- Buttons: "View on Map" → `/map`, "Visualize Algorithm" → `/visualizer`

---

### Hospitals.jsx

**Route:** `/hospitals`  
**Reads from context:** `hospitals, updateBeds`

- Lists all 6 hospitals with bed count editors (increment/decrement buttons)
- `updateBeds(hospitalId, 'icuBedsAvailable', newValue)` → persists to localStorage
- Shows color-coded bed bars: green (>50%), amber (>0%), red (0%)
- Displays specialization badges

---

### History.jsx

**Route:** `/history`  
**Reads from context:** `history, locations, clearHistory`

- Renders full timeline of all case records (persisted across refreshes)
- Each record shows: timestamp, patient name, emergency type, ICU requirement, from/to locations, primary/backup hospital, distance, node path
- "Clear History" button → `clearHistory()` → clears state + `localStorage.removeItem('emergency_history')`

---

### About.jsx

**Route:** `/about`

- Static page mapping all 4 academic subjects to project features
- Each subject card shows: code, name, specific features demonstrated

---

### ERDiagram.jsx

**Route:** `/er-diagram`

- SVG-rendered interactive ER diagram with 8 entities
- Hover over any entity: connected relationship lines highlight with Bezier curves
- Shows PK/FK relationships, cardinalities (1:N, 1:1)

---

## 6. MapView Deep Dive — Live Traffic Pipeline

**Route:** `/map`  
**File:** `src/pages/MapView.jsx`

### State

```javascript
const [isAnimating, setIsAnimating]             // ambulance animation running
const [isFetchingRoute, setIsFetchingRoute]     // API call in progress
const [liveRouteData, setLiveRouteData]         // { distance, duration, dominantCongestion, congestionCounts }
const [routeLastUpdated, setRouteLastUpdated]   // Date object
const ambulanceMarkerRef                         // Mapbox Marker ref
const mapRouteGeometryRef                        // GeoJSON LineString from Directions API
const animFrameRef                               // requestAnimationFrame ID
```

### Map Initialization (useEffect)

```javascript
mapboxgl.accessToken = MAPBOX_TOKEN
map = new mapboxgl.Map({
  container: mapContainer.current,
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [77.5250, 12.9080],
  zoom: 12.5,
  attributionControl: false
})
map.addControl(new mapboxgl.NavigationControl(), 'top-right')

map.on('load', () => {
  // 1. Draw 23 graph edges as dark-grey lines
  edges.forEach(edge => {
    map.addSource(`route-${edge.id}`, GeoJSON LineString from ROUTE_COORDS[edge.id])
    map.addLayer({ color: '#334155', width: 2.5, opacity: 0.45 })
  })
  
  // 2. Distance badges at edge midpoints
  edges.forEach(edge => {
    midIdx = Math.floor(ROUTE_COORDS[edge.id].length / 2)
    mapboxgl.Marker({ element: div('X.X km') }).setLngLat(midpoint).addTo(map)
  })
  
  // 3. Fetch live traffic route if emergency exists
  if (emergencyResult?.primary) fetchAndDrawRoute(map, path)
  
  // 4. Node markers
  locations.forEach(loc => {
    el = isHospital ? div('🏥') : div(loc.id)
    if (isSource) el.className += ' source-marker'  // pulsing animation
    if (isDestination) el.innerHTML = '🎯', el.style.background = '#10b981'
    new mapboxgl.Marker({ element: container, anchor: 'center' })
      .setLngLat([loc.lng, loc.lat])
      .setPopup(popup with name + area)
      .addTo(map)
  })
})
```

### `fetchAndDrawRoute(map, path)` — Live Traffic API

```javascript
// Remove any existing route layers
['highlight-route-bg', 'highlight-route-congestion'].forEach(remove)
['highlight-route', 'highlight-route-congestion'].forEach(removeSource)

// Build coordinate string for Mapbox API
pathCoordsString = path.map(id => `${loc.lng},${loc.lat}`).join(';')

// Mapbox Directions API — driving-traffic profile for LIVE TRAFFIC
fetch(`https://api.mapbox.com/directions/v5/mapbox/driving-traffic/
       ${pathCoordsString}
       ?geometries=geojson
       &overview=full
       &annotations=congestion,duration
       &access_token=${MAPBOX_TOKEN}`)

// Response structure:
{
  routes: [{
    distance: meters,
    duration: seconds,
    geometry: { type: 'LineString', coordinates: [[lng,lat], ...] },
    legs: [{
      annotation: {
        congestion: ['low', 'moderate', 'heavy', ...],  // per road segment
        duration: [seconds, ...]
      }
    }]
  }]
}

// Process response:
dominantCongestion = most frequent value in allCongestion[]
setLiveRouteData({ distance(km), duration(min), dominantCongestion, congestionCounts })

// Draw glow background layer
map.addSource('highlight-route', geometry)
map.addLayer('highlight-route-bg', { color: '#06b6d4', width: 14, opacity: 0.18, blur: 8 })

// Build per-segment GeoJSON with congestion color
segmentFeatures = coords.slice(0,-1).map((c, i) => ({
  type: 'Feature',
  properties: { color: CONGESTION_CONFIG[congestion[i]].color },
  geometry: { type: 'LineString', coordinates: [c, coords[i+1]] }
}))

map.addSource('highlight-route-congestion', FeatureCollection(segmentFeatures))
map.addLayer('highlight-route-congestion', {
  'line-color': ['get', 'color'],  // data-driven expression
  'line-width': 5.5
})
```

### Congestion Color Config

```javascript
const CONGESTION_CONFIG = {
  unknown:  { color: '#06b6d4', label: 'Unknown'  },
  low:      { color: '#10b981', label: 'Clear'    },
  moderate: { color: '#f59e0b', label: 'Moderate' },
  heavy:    { color: '#ef4444', label: 'Heavy'    },
  severe:   { color: '#dc2626', label: 'Severe'   },
}
```

### Ambulance Animation

```javascript
runAnimation():
  pathCoords = mapRouteGeometryRef.current.coordinates
  route = turf.feature(LineString(pathCoords))
  lineDistance = turf.length(route, { units: 'kilometers' })
  
  // Create ambulance marker
  el = div('🚑', fontSize: 30px, drop-shadow glow)
  marker = new mapboxgl.Marker({ element: el, rotationAlignment: 'map' })
            .setLngLat(pathCoords[0]).addTo(map)
  
  // Auto-fit map to show entire route
  bounds = LngLatBounds from all pathCoords
  map.fitBounds(bounds, { padding: 80, duration: 1000 })
  
  // Animation loop
  startTime = null
  duration = 8000ms  // 8 second animation

  animate(timestamp):
    progress = min((timestamp - startTime) / 8000, 1)
    distance = progress * lineDistance
    point = turf.along(route, distance, { units: 'km' })
    marker.setLngLat(point.geometry.coordinates)
    
    // ★ KEY FIX: 🚑 emoji faces RIGHT (east=90°) by default
    // Mapbox setRotation(0) = facing north (up)
    // So we offset by -90° so the front of the ambulance aligns with bearing
    prevPoint = turf.along(route, max(0, distance - 0.025))
    bearing = turf.bearing(prevPoint, point)
    marker.setRotation(bearing - 90)
    
    if progress < 1: requestAnimationFrame(animate)
    else: marker.setLngLat(last point); setIsAnimating(false)
```

### Right Panel Components

1. **Route Header** — hospital name, graph distance, Mapbox live distance + duration
2. **Refresh Button** — calls `fetchAndDrawRoute` again with current traffic
3. **Algorithm Info Box** — "Dijkstra SSSP + Mapbox Live Traffic 🟢 LIVE" badge
4. **Live Congestion Summary** — progress bars per congestion level (% of route)
5. **Road Legs Breakdown** — per edge: nodes, distance, road name, traffic status, speed, duration
   - Left border color matches traffic: green/amber/red/purple

### Live Stats Bar (above map)

4 metric cards: Mapbox Distance | Live ETA | Congestion | Last Updated  
Appears via Framer Motion `initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}` when `liveRouteData` is set.

---

## 7. Algorithm Visualizer Deep Dive

**Route:** `/visualizer`  
**File:** `src/pages/AlgorithmVisualizer.jsx`

### SVG Canvas Layout

- All 13 nodes placed at `NODE_POSITIONS[id] = {x, y}` (0–800 × 0–600 coordinate space)
- 23 edges drawn as SVG `<line>` elements
- Nodes drawn as SVG `<circle>` + `<text>` groups
- Edge labels show `weight.toFixed(1) km` at midpoint

### Node Class Assignment

```javascript
getNodeClass(nodeId):
  step = steps[currentStepIndex]
  if nodeId === sourceNode → 'node-source'       // red fill
  if nodeId === targetNode → 'node-target'       // amber fill
  if step.path.includes(nodeId) → 'node-path'   // bright cyan fill
  if step.visited.includes(nodeId) → 'node-visited'   // blue fill
  if nodeId === step.currentNode → 'node-visiting'     // cyan with pulse
  if locations.find(l => l.id===nodeId)?.isHospital → 'node-hospital' // green
  return 'node-default'  // dark fill
```

### Edge Class Assignment

```javascript
getEdgeClass(edge):
  step = steps[currentStepIndex]
  // Is this edge on the optimal path?
  path = step.path
  for i in 0..path.length-2:
    if [path[i],path[i+1]] matches [edge.from,edge.to] (either direction):
      return 'edge-path'  // thick solid cyan
  // Is this edge actively being explored?
  if step.relaxedEdge matches edge: return 'edge-exploring'  // dashed pulsing
  return 'edge-default'  // grey
```

### Step Types

| Type | Meaning |
|------|---------|
| `init` | Algorithm initialized, distances set to Infinity |
| `extract_min` | Node u extracted from PQ |
| `relax` | Edge (u,v) relaxed — new shorter path found |
| `skip` | Edge (u,v) not improved — skipped |
| `found` | Target node reached — optimal path reconstructed |
| `not_found` | PQ empty, target unreachable |

### Algorithm Dispatch

```javascript
handleRun():
  switch selectedAlgorithm:
    'dijkstra' → new DijkstraEngine(graph).run(source, target, trafficEnabled)
    'astar'    → new AStarEngine(graph).run(source, target, trafficEnabled)
    'bfs'      → new BFSEngine(graph).run(source, target)
    'dfs'      → new DFSEngine(graph).run(source, target)
  setSteps(result.steps)
  setCurrentStep(0)

togglePlay():
  if playing: clearInterval(timer)
  else: timer = setInterval(() => setCurrentStep(i++), 800 / speed)
  // speed: 0.5x, 1x, 1.5x, 2x, 3x
```

---

## 8. Database Schema (DBMS / BCS403)

### Conceptual Relational Schema (8 Tables, 3NF)

```sql
-- Table 1: Patients
CREATE TABLE patients (
  patient_id   INT PRIMARY KEY AUTO_INCREMENT,
  name         VARCHAR(100) NOT NULL,
  age          INT,
  blood_group  VARCHAR(5),
  contact      VARCHAR(15)
);

-- Table 2: Location Nodes
CREATE TABLE location_nodes (
  node_id  INT PRIMARY KEY,
  name     VARCHAR(150),
  area     VARCHAR(100),
  lat      DECIMAL(9,7),
  lng      DECIMAL(10,7)
);

-- Table 3: Road Edges
CREATE TABLE road_edges (
  edge_id           VARCHAR(5) PRIMARY KEY,
  from_node_id      INT REFERENCES location_nodes(node_id),
  to_node_id        INT REFERENCES location_nodes(node_id),
  weight_km         DECIMAL(5,2),
  road_name         VARCHAR(150),
  traffic_multiplier DECIMAL(3,1) DEFAULT 1.0
);

-- Table 4: Hospitals
CREATE TABLE hospitals (
  hospital_id    VARCHAR(5) PRIMARY KEY,
  name           VARCHAR(200),
  short_name     VARCHAR(50),
  address        TEXT,
  contact        VARCHAR(15),
  location_node  INT REFERENCES location_nodes(node_id)
);

-- Table 5: Hospital Specializations
CREATE TABLE hospital_specializations (
  spec_id      INT PRIMARY KEY AUTO_INCREMENT,
  hospital_id  VARCHAR(5) REFERENCES hospitals(hospital_id),
  emergency_type VARCHAR(20)  -- 'CARDIAC','TRAUMA','NEURO','BURNS','MATERNITY','GENERAL'
);

-- Table 6: Hospital Resources
CREATE TABLE hospital_resources (
  resource_id           INT PRIMARY KEY AUTO_INCREMENT,
  hospital_id           VARCHAR(5) REFERENCES hospitals(hospital_id) UNIQUE,
  icu_beds_total        INT,
  icu_beds_available    INT,
  general_beds_total    INT,
  general_beds_available INT
);

-- Table 7: Emergency Cases
CREATE TABLE emergency_cases (
  case_id            INT PRIMARY KEY AUTO_INCREMENT,
  patient_id         INT REFERENCES patients(patient_id),
  source_location_id INT REFERENCES location_nodes(node_id),
  emergency_type     VARCHAR(20),
  needs_icu          BOOLEAN,
  timestamp          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 8: Allocations (audit log)
CREATE TABLE allocations (
  allocation_id  INT PRIMARY KEY AUTO_INCREMENT,
  case_id        INT REFERENCES emergency_cases(case_id),
  hospital_id    VARCHAR(5) REFERENCES hospitals(hospital_id),
  backup_hosp_id VARCHAR(5) REFERENCES hospitals(hospital_id),
  route_cost_km  DECIMAL(6,2),
  path_nodes     TEXT,        -- JSON array e.g. '[1,9,5]'
  algorithm      VARCHAR(20),
  allocated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Functional Dependencies (3NF verification)

- **patients**: `patient_id → name, age, blood_group, contact` ✓
- **hospitals**: `hospital_id → name, address, contact, location_node` ✓
- **hospital_specializations**: `spec_id → hospital_id, emergency_type`; no partial/transitive deps ✓
- **hospital_resources**: `resource_id → hospital_id → beds` (1:1 with hospital) ✓
- **road_edges**: `edge_id → from_node_id, to_node_id, weight_km, road_name, traffic_multiplier` ✓
- **emergency_cases**: `case_id → patient_id, source_location_id, emergency_type, needs_icu, timestamp` ✓
- **allocations**: `allocation_id → case_id, hospital_id, backup_hosp_id, route_cost_km, path_nodes` ✓

All tables are in **3NF**: no partial dependencies (all non-key attributes depend on whole PK) and no transitive dependencies.

---

## 9. localStorage Persistence Layer

Since this app has **no backend**, browser localStorage is used for persistence:

### `localStorage['theme']`
- **Written:** `AppContext.toggleTheme()` via `useEffect([theme])`
- **Read:** `AppContext useState initializer` → `localStorage.getItem('theme') || 'dark'`
- **Format:** String — `'dark'` or `'light'`

### `localStorage['emergency_history']`
- **Written:** `useEffect([history])` — fires on every history state change
- **Read:** `AppContext useState initializer` → `JSON.parse(saved)`
- **Format:** JSON array of case records
- **Cleared by:** `clearHistory()` → `localStorage.removeItem('emergency_history')`
- **Record structure:**
  ```json
  {
    "id": 1716529200000,
    "timestamp": "2026-05-24T05:30:00.000Z",
    "patientName": "John Doe",
    "emergencyType": "CARDIAC",
    "sourceNodeId": 1,
    "needsIcu": true,
    "primaryHospital": "BGS Gleneagles Global Hospital",
    "backupHospital": "Astra Super Speciality Hospital",
    "routeCost": 1.2,
    "path": [1, 5],
    "algorithm": "Dijkstra"
  }
  ```

### `localStorage['hospital_beds']`
- **Written:** `AppContext.updateBeds()` — fires on each bed count update
- **Read:** `AppContext useState initializer` — merges saved bed counts into static HOSPITALS data
- **Format:** JSON array of partial hospital records
  ```json
  [
    { "id": "H1", "icuBedsAvailable": 1, "generalBedsAvailable": 5 },
    { "id": "H3", "icuBedsAvailable": 0, "generalBedsAvailable": 4 }
  ]
  ```
- **Merge strategy:** Static HOSPITALS data provides all other fields (name, specializations, etc.); saved data overrides only bed counts

---

## 10. Bug Audit & Fixes

All bugs discovered and fixed during development review:

### Critical Bugs (Data Loss)

**Bug 1 — History wiped on refresh**
- **Root cause:** `useState([])` initializes empty every mount
- **Impact:** All case history disappears on F5 or navigation away
- **Fix:** Persist to `localStorage['emergency_history']` with `useEffect([history])`; initialize via lazy `useState(() => JSON.parse(localStorage.getItem('emergency_history')) || [])`

**Bug 2 — Hospital bed edits lost on refresh**
- **Root cause:** `useState(() => HOSPITALS.map(h => ({...h})))` always reads from static data
- **Impact:** Bed count changes made on Hospitals page reset on refresh
- **Fix:** `updateBeds()` now calls `localStorage.setItem('hospital_beds', ...)` after each update; `useState` initializer merges saved bed counts with base HOSPITALS data

**Bug 3 — MATERNITY emergency always fails ("No Hospital Found")**
- **Root cause:** `EMERGENCY_TYPES` included MATERNITY but zero hospitals had `'MATERNITY'` in their `specializations` array
- **Impact:** Selecting MATERNITY emergency always returned no results, confusing users
- **Fix:** Added MATERNITY to RRMCH (H1) and BGS Gleneagles (H3) specializations

### Medium Bugs (Incorrect Behavior)

**Bug 4 — Edge e14 route coords didn't reach Node 9**
- **Root cause:** Last waypoint `[77.4780, 12.9135]` was 400m from Node 9 `[77.4810, 12.9115]`
- **Impact:** Ambulance animation showed a gap at the Kengeri end of edge e14
- **Fix:** Corrected to `[77.4810, 12.9115]`

**Bug 5 — `needsIcu` missing from history entries**
- **Root cause:** `addToHistory()` call didn't include `needsIcu: request.needsIcu`
- **Impact:** `History.jsx` displayed `undefined` for the ICU requirement field
- **Fix:** Added `needsIcu: request.needsIcu` to the history entry object

**Bug 6 — Results page ETA used 40 km/h (too slow)**
- **Root cause:** Hardcoded `(primary.cost / 40) * 60` — unrealistically slow for emergency vehicles
- **Impact:** ETA was ~25% higher than realistic
- **Fix:** Changed to 50 km/h (realistic for Bangalore emergency vehicles with right-of-way)

**Bug 7 — `sourceLocationId` type mismatch (string vs number)**
- **Root cause:** HTML `<select>` always returns string values, but comparison with node IDs (numbers) could fail
- **Impact:** Select option highlight could visually not match stored value
- **Fix:** `onChange: parseInt(e.target.value)` ensures consistent number type

### Routing Bugs

**Bug 10 — Ambulance route looped through JSS campus**
- **Root cause:** Node 1 coordinates `(12.9026, 77.5030)` were inside the campus grounds; Mapbox snapped the route to campus internal roads
- **Impact:** Route made an oval loop through the campus track before reaching the main road
- **Fix:** Moved Node 1 to `(12.9060, 77.5028)` — the main road junction north of campus on Uttarahalli Main Road

**Bug 11 — Using static `driving` profile (no live traffic)**
- **Root cause:** Mapbox Directions URL used `mapbox/driving/` — no traffic awareness
- **Impact:** Route ignored current road conditions (accidents, congestion, peak hours)
- **Fix:** Switched to `mapbox/driving-traffic/` with `annotations=congestion,duration`

### Visual Bugs

**Bug 12 — Ambulance emoji facing wrong direction**
- **Root cause:** `🚑` emoji faces **right** (east) by default. `mapboxgl.Marker.setRotation(bearing)` treats 0° as **north** (up). Net effect: ambulance always appeared rotated 90° off its travel direction
- **Fix:** `setRotation(bearing - 90)` compensates the offset

**Bug 13 — All roads painted green (traffic tile overlay on entire map)**
- **Root cause:** Added `mapbox://mapbox.mapbox-traffic-v1` vector tile source which painted every road segment with its current traffic color. Since Bangalore traffic was mostly "low" at the time, everything appeared green
- **Impact:** Map was visually overwhelming; all roads appeared green making it look broken
- **Fix:** Removed the `mapbox-traffic-v1` tile source entirely. Route-level congestion coloring (per segment) is still shown on the ambulance route only

### Minor Bugs

**Bug 8 — No way to clear persisted history**  
Added "Clear History" button in History.jsx + `clearHistory()` in AppContext

**Bug 9 — Comment said "9 nodes" but there are 13**  
Updated `cityData.js` comment to reflect actual count

---

## 11. Complete Function Call Trace — App Startup to Result

### Phase 1: Application Bootstrap

```
Browser loads index.html
  → <script type="module" src="src/main.jsx">

main.jsx:
  ReactDOM.createRoot(document.getElementById('root'))
  .render(
    <React.StrictMode>
      <AppProvider>          ← context wraps everything
        <App />
      </AppProvider>
    </React.StrictMode>
  )

AppProvider mounts:
  graph = useMemo(() => {
    g = new CityGraph()
    LOCATIONS.forEach(loc => g.addNode(loc.id, loc))
    EDGES.forEach(edge => g.addEdge(edge.from, edge.to, edge.weight, {
      roadName, trafficMultiplier, id
    }))
    return g
  }, [])
  // CityGraph now has: nodes Map (13 entries), edges Map (13 keys, each with neighbor arrays)

  hospitals = useState(() => {
    saved = localStorage.getItem('hospital_beds')
    if saved: merge saved beds into HOSPITALS[]
    else: HOSPITALS.map(h => ({...h}))
  })

  theme = useState(() => localStorage.getItem('theme') || 'dark')
  useEffect([theme] → document.documentElement.setAttribute('data-theme', theme))

  history = useState(() => {
    saved = localStorage.getItem('emergency_history')
    JSON.parse(saved) || []
  })

App.jsx mounts:
  <BrowserRouter>
    <Navbar />
    <Routes>
      / → <Dashboard>
      /emergency → <EmergencyEntry>
      /results → <Results>
      /map → <MapView>
      /visualizer → <AlgorithmVisualizer>
      /hospitals → <Hospitals>
      /er-diagram → <ERDiagram>
      /history → <History>
      /about → <About>
    </Routes>
  </BrowserRouter>
```

### Phase 2: Emergency Case Entry

```
User navigates to /emergency
  → EmergencyEntry.jsx mounts
  → formData state initialized with defaults

User fills form:
  patientName: "Shreya" (text input)
  age: 22 (number input)
  sourceLocationId: 9 (select → parseInt → 9 as number)
  emergencyType: "CARDIAC" (card click → setFormData)
  needsIcu: true (toggle click → !formData.needsIcu)
  trafficEnabled: true (toggle from context)

User clicks "Find Best Hospital & Route":
  handleSubmit(event)
    event.preventDefault()
    if (!formData.patientName) → alert(); return
    
    runRecommendation({
      sourceNodeId: parseInt(9) = 9,
      emergencyType: "CARDIAC",
      needsIcu: true,
      patientName: "Shreya",
      useTraffic: true
    })
```

### Phase 3: Recommendation Engine

```
AppContext.runRecommendation({ sourceNodeId:9, emergencyType:'CARDIAC', needsIcu:true }):
  setEmergencyRequest(request)
  
  service = new RecommendationService(graph, hospitals)
  
  service.recommend(request):
    
    // Stage 1: Specialization filter
    candidates = hospitals.filter(h => h.specializations.includes('CARDIAC'))
    // → H3 BGS (CARDIAC,GENERAL,MATERNITY), H5 Apollo (CARDIAC,NEURO,BURNS), H6 Fortis (CARDIAC,TRAUMA,NEURO)
    // filterSteps[0] = { step: 'Specialization Filter', count: 3 }
    
    // Stage 2: Bed filter (needsIcu=true → icuBedsAvailable > 0)
    candidates = candidates.filter(h => h.icuBedsAvailable > 0)
    // → H3(2 ICU), H5(5 ICU), H6(4 ICU) — all pass
    // filterSteps[1] = { step: 'Bed Availability Filter', count: 3 }
    
    // Stage 3: Dijkstra per candidate
    
    // For H3 BGS (nodeId=5):
    dijkstra.run(9, 5, true):
      distances = {1:∞, 2:∞, 3:∞, 4:∞, 5:∞, ..., 9:0}
      pq = [{item:9, priority:0}]
      
      iter1: extract 9 (dist=0), not visited
        neighbors of 9: 
          8 (e13, w=4.8*1.0=4.8): 0+4.8=4.8 < ∞ → distances[8]=4.8, prev[8]=9
          1 (e5, w=3.8*1.0=3.8): 0+3.8=3.8 < ∞ → distances[1]=3.8, prev[1]=9
          5 (e14, w=2.9*1.2=3.48): 0+3.48=3.48 < ∞ → distances[5]=3.48, prev[5]=9
        pq = [{5:3.48}, {1:3.8}, {8:4.8}]
      
      iter2: extract 5 (dist=3.48) → TARGET FOUND!
        found=true; break
      
      path reconstruction: prev[5]=9 → path = [9, 5]
      cost = 3.48 km
    
    // For H5 Apollo (nodeId=11): Dijkstra finds path via 9→1→3→...→11
    // For H6 Fortis (nodeId=13): similar
    
    validCandidates.sort by cost ascending
    // → H3(3.48km), then H5/H6 (longer paths)
    
    return {
      primary: { hospital: H3_BGS, cost: 3.48, path: [9,5] },
      backup: { hospital: H5_Apollo, ... },
      filterSteps,
      explanation: "Selected BGS Gleneagles Global Hospital as primary..."
    }
  
  setEmergencyResult(result)
  
  addToHistory({
    patientName: "Shreya",
    emergencyType: "CARDIAC",
    sourceNodeId: 9,
    needsIcu: true,
    primaryHospital: "BGS Gleneagles Global Hospital",
    backupHospital: "Apollo Hospital Bannerghatta Road",
    routeCost: 3.48,
    path: [9, 5],
    algorithm: "Dijkstra"
  })
  // → setHistory(prev => [newEntry, ...prev])
  // → useEffect triggers → localStorage.setItem('emergency_history', JSON.stringify(history))
  
navigate('/results')
```

### Phase 4: Results Display

```
Results.jsx mounts:
  { primary, backup, filterSteps, explanation } = emergencyResult
  sourceName = locations.find(l => l.id === 9).name  // "Kengeri Bus Terminal"
  
  Renders:
    Patient bar: "Shreya (CARDIAC • ICU) — From Kengeri Bus Terminal"
    Primary card:
      BGS Gleneagles Global Hospital
      Address: 67, Uttarahalli Main Road, Sunkalpalya...
      Specializations: [CARDIAC] [GENERAL] [MATERNITY]
      ETA: Math.round((3.48 / 50) * 60) = 4 min
      Distance: 3.48 km
      Path: Node 9 → Node 5
      Explanation: "Selected BGS Gleneagles because..."
      Call: 080-2625-5555
    Backup card: Apollo Hospital Bannerghatta...
    Filter steps timeline
```

### Phase 5: Map Route Rendering

```
User clicks "View on Map" → navigate('/map')

MapView.jsx mounts + useEffect fires:
  map = new mapboxgl.Map({style: 'streets-v12', center: [77.525, 12.908]})
  
  map.on('load'):
    Draw 23 dark-grey graph edges...
    Add km distance badge markers...
    
    fetchAndDrawRoute(map, [9, 5]):
      pathCoordsString = "77.4810,12.9115;77.4984,12.8985"
      
      fetch('https://api.mapbox.com/directions/v5/mapbox/driving-traffic/
             77.4810,12.9115;77.4984,12.8985
             ?geometries=geojson&overview=full&annotations=congestion,duration
             &access_token=pk.eyJ1...')
      
      → Response: {
          routes: [{
            distance: 3250,  // meters
            duration: 420,   // seconds
            geometry: { type:'LineString', coordinates: [[77.481,12.911], [77.483,12.909], ..., [77.498,12.898]] },
            legs: [{ annotation: { congestion: ['low','low','moderate',...] } }]
          }]
        }
      
      mapRouteGeometryRef.current = geometry
      setLiveRouteData({ distance:'3.25', duration:7, dominantCongestion:'low', ... })
      
      // Draw glow layer (cyan, opacity 0.18, blur 8)
      // Draw per-segment congestion line with data-driven color
      // → mostly green (#10b981) for 'low' congestion segments
    
    Add 13 node markers:
      Node 9 (source): pulsing cyan badge with '9'
      Node 5 (destination): 🎯 green emoji
      Other hospitals: 🏥
      Other nodes: numbered badges

Stats bar appears (4 cards): 3.25 km | 7 mins | Clear | 10:45:30

User clicks "Run Animation":
  runAnimation():
    pathCoords = [[77.481,12.911], ..., [77.498,12.898]]  // 45 points
    route = turf LineString feature
    lineDistance = turf.length = 3.25 km
    
    🚑 marker created, placed at pathCoords[0]
    map.fitBounds(all coords, padding:80) → map zooms to show full route
    
    requestAnimationFrame loop (8000ms duration):
      t=0ms:    progress=0.000, point=[77.481,12.911], rotation=220-90=130°
      t=800ms:  progress=0.100, point=[77.483,12.910], bearing computed, 🚑 moves
      t=4000ms: progress=0.500, point midway...
      t=8000ms: progress=1.000, point=[77.498,12.898], animation ends
```

---

*End of Comprehensive Documentation*
