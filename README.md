# 🚑 Smart Ambulance Routing & Hospital Allocation System

An advanced, real-time spatial pathfinding and clinical resource allocation system designed to optimize emergency response times in South Bangalore (centered around JSS Academy of Technical Education, Uttarahalli). 

This project maps physical geographies into weighted topological graph schemas, computes Single-Source Shortest Paths (SSSP) via customized Dijkstra & A* engines, matches department specialties, and audits transaction allocations inside relational database records.

---

## 🎓 Academic Syllabus Mappings (VTU 4th Semester CSE)

This application is engineered specifically to demonstrate clean implementations of four core Computer Science subjects. Each component maps directly to syllabus theory, making it highly effective for live demos, academic reviews, and viva examinations:

| Subject Badge | Academic Focus Area | project Integration |
| :--- | :--- | :--- |
| **`BCS401` ADA** | **Analysis & Design of Algorithms** | SSSP algorithms, binary min-heap Priority Queue implementations, A* heuristics search, and asymptotic time complexity analyses $O((V+E) \log V)$. |
| **`BCS405B` GT** | **Graph Theory & Applications** | Vertex-edge spatial topological network representation, key-value adjacency lists representation, BFS/DFS traversal mechanics, and degree reachability verification. |
| **`BCS403` DBMS** | **Database Management Systems** | Relational schemas normalized to 3NF, curved interactive SVG Entity-Relationship schema diagram, relational algebra joins simulation, and persistent historical transaction audit logs. |
| **`BCS402` OOCJ** | **Object Oriented Concepts** | Strict encapsulation of graph models (`CityGraph`, `Edge`), modular service components, state singletons via React context structures, and theme decoupling. |

---

## ✨ System Features

### 1. 🧮 Advanced Algorithmic Search Engines (`BCS401` / `BCS405B`)
- **Dijkstra's SSSP Engine**: Computes the absolute shortest path to all candidate hospitals by evaluating road distances and live traffic multiplier factors.
- **A\* Search Engine**: Incorporates straight-line GPS heuristic distances $h(n)$ to prune the evaluated node space and accelerate convergence.
- **Priority Queue Min-Heap**: Backs both search algorithms in JavaScript to ensure sub-millisecond computations ($O((V+E)\log V)$).
- **BFS & DFS Traversal**: Fully visualizes topological search patterns, illustrating levels queue scheduling and depth backtracking.

### 2. 🗺️ Real-world GIS Integration (`BCS405B`)
- **Mapbox Streets Day theme (`streets-v12`)**: High-contrast, clean OSM maps displaying the JSSATE Bangalore region.
- **Precise GPS Mapping**: Hardcoded GPS coordinates of major landmarks: JSSATE Uttarahalli, BGS Gleneagles Hospital, Sagar Hospitals DSI, RRMCH, and prominent road intersections.
- **Mapbox Directions API Integration**: Asynchronously requests and draws true road-matched street line paths from the live Mapbox service.
- **Ambulance Driving Animation**: Employs **Turf.js** to run smooth 60fps driving animations along calculated street routes.
- **Distance Badges**: Edge distances (in km) are projected as floating mid-point text labels directly on map routes.

### 3. 📊 Relational Schema ER Visualizer (`BCS403`)
- **Interactive SVG Grid**: Pre-positioned cards showing 8 database entities in a clean coordinate system.
- **Curved Relational Connectors**: Bezier path lines map PK-to-FK constraints with directional arrowhead endpoints.
- **Hover Highlighting & Explanations**: Hovering over lines or tables activates glowing outlines and prints active relational constraints (e.g. `1:N ON patients.patient_id = emergency_cases.patient_id`).

### 4. 🎨 State-of-the-Art UX/UI (`BCS402`)
- **Dual Mode (Light & Dark Themes)**: Fluid, instant styling toggling throughout the app.
- **High Contrast Light Theme**: Hand-tailored color palettes (e.g. slate-blue `#cbd5e1` for unvisited nodes) designed for maximum visibility.
- **Math Principle Overlay**: Interactive formulas and evaluation tables show step-by-step variables ($f(n) = g(n) + h(n)$) during search iterations.

---

## 📂 Directory Layout

```text
AMBULANCE/
├── public/                 # Static assets
├── src/
│   ├── context/
│   │   └── AppContext.jsx  # Global state manager & database mock transaction audits
│   ├── data/
│   │   └── cityData.js     # Physical coordinate systems, schema data, Mapbox keys
│   ├── engine/
│   │   ├── PriorityQueue.js # JS Binary Min-Heap
│   │   ├── CityGraph.js    # Graph structure & Adjacency lists
│   │   ├── BFSEngine.js    # Queue BFS step tracing
│   │   ├── DFSEngine.js    # Stack DFS step tracing
│   │   ├── DijkstraEngine.js # Dijkstra SSSP step tracing
│   │   └── AStarEngine.js  # A* Search step tracing
│   ├── pages/
│   │   ├── Dashboard.jsx   # Active operations monitor
│   │   ├── EmergencyEntry.jsx # Case intake form
│   │   ├── AlgorithmVisualizer.jsx # Step-by-step SVG graph animation page
│   │   ├── MapView.jsx     # Live Mapbox & Turf.js driving animation
│   │   ├── Results.jsx     # SSSP routing comparisons
│   │   ├── Hospitals.jsx   # Clinical resources database manager
│   │   ├── ERDiagram.jsx   # SVG Relational ER schema diagram
│   │   ├── History.jsx     # Simulated audit log tables
│   │   └── About.jsx       # Academic Syllabus Map
│   ├── App.css             # Component styling
│   ├── App.jsx             # Shell navbar & route coordinator
│   ├── index.css           # Global CSS variables & layout engines
│   └── main.jsx            # React root binder
├── COMPREHENSIVE_DOCUMENTATION.md # Complete architectural function traceability document
├── package.json            # Vite dependencies
└── vite.config.js          # Build setup
```

---

## 🚀 Running the Project Locally

Follow these commands to install dependencies, run the development environment, or compile a production bundle:

### 1. Prerequisite
Ensure you have **Node.js (v18.0.0 or higher)** and **npm** installed on your machine. You can check your version by running:
```bash
node -v
npm -v
```

### 2. Installation
Navigate to the project root directory and install all required modules:
```bash
# Install package dependencies
npm install
```

### 3. Development Server
Start the high-performance local Vite dev server:
```bash
# Start local environment
npm run dev
```
Once started, the terminal will print the local URI. Typically, you can access the interface at:
👉 **[http://localhost:5173](http://localhost:5173)**

### 4. Build for Production
To compile and package the application into highly-optimized, static assets inside the `dist/` directory:
```bash
# Compile project
npm run build
```

### 5. Preview Production Bundle
To spin up a local server to preview the compiled static production assets:
```bash
# Run local preview
npm run preview
```

---

## 🏗️ System Architecture & Code Traceability Blueprint

### 1. System Architecture Layout

The following diagram illustrates how the frontend components, context states, mathematical routing engines, external GIS APIs, and relational schemas interact:

```mermaid
graph TD
    %% Styling
    classDef page fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#fff
    classDef engine fill:#111827,stroke:#06b6d4,stroke-width:2px,color:#fff
    classDef context fill:#062f4f,stroke:#10b981,stroke-width:2px,color:#fff
    classDef data fill:#312e81,stroke:#ec4899,stroke-width:2px,color:#fff

    %% Components
    A[Dashboard UI / Emergency Entry]:::page
    B[AppContext Provider State]:::context
    C[Recommendation Service]:::engine
    D[CityGraph Network Topology]:::data
    E[Dijkstra Engine / A* Engine]:::engine
    F[Mapbox Directions API]:::engine
    G[Interactive SVG ER Diagram]:::page
    H[Audits Allocation Database Logs]:::data

    %% Interconnections
    A -->|1. Triggers Emergency Request| B
    B -->|2. Invokes recommendation| C
    C -->|3. Query active structure| D
    C -->|4. Runs pathfinder algorithms| E
    B -->|5. Recalls optimal path features| A
    A -->|6. Load paths onto Map View| F
    G -->|7. Documents relational schema| H
    B -->|8. Inserts audit transaction records| H
```

---

### 2. End-to-End Functional Execution Pipelines

#### Flow 1: Emergency Case Creation & Optimal Hospital Recommendation
When a user enters a new emergency case, the following function execution sequence is executed:

1. **`EmergencyEntry.jsx` (UI Trigger)**:
   - The user selects an emergency type (e.g. `CARDIAC`), selects an intersection Node ID (e.g. Node `1`), toggles ICU requirements (`needsIcu = true`), and enters a patient name.
   - On submit, `handleSubmit()` fires.
   - It invokes the global `runRecommendation(request)` action exported from `AppContext.jsx`.

2. **`AppContext.jsx` (Global State Manager)**:
   - Sets the state `setEmergencyRequest(request)`.
   - Creates a new instance of `RecommendationService` and calls `service.recommend(request)`.

3. **`RecommendationService.js` (Prioritization & Routing Dispatcher)**:
   - `recommend(request)` evaluates all candidate hospitals in the database.
   - Filters candidate hospitals that can accept the emergency type by querying their `specializations` array.
   - For each matching candidate hospital, it executes Dijkstra's Single-Source Shortest Path (SSSP) algorithm:
     ```javascript
     const dijkstra = new DijkstraEngine(this.graph);
     const result = dijkstra.run(request.sourceNodeId, hospital.nodeId, true);
     ```
   - Compares calculations (driving cost distance in km, active traffic multipliers, available bed capacity).
   - Identifies the **Primary Recommended Hospital** (minimum cost path with bed capacity) and an optional **Backup Recommended Hospital** (next best).
   - Returns the recommendation result structure containing paths, costs, and hospital records.

4. **`AppContext.jsx` (State Save & Audit Logging)**:
   - Captures recommendation results via `setEmergencyResult(result)`.
   - Executes an audit log transaction insert into the history list:
     ```javascript
     addToHistory({
       patientName: request.patientName,
       emergencyType: request.emergencyType,
       sourceNodeId: request.sourceNodeId,
       primaryHospital: result.primary.hospital.name,
       routeCost: result.primary.cost,
       path: result.primary.path,
       allocatedAt: new Date().toISOString()
     });
     ```

5. **`Results.jsx` (UI Display)**:
   - Listens to `emergencyResult` updates.
   - Renders a comparison breakdown displaying SSSP path legs, optimal routing time, recommended ICU statuses, and alternative paths.

---

#### Flow 2: Live Driving Directions & Mapbox Routing Animation
Once a route is successfully calculated, the user views the path on the interactive map:

1. **`MapView.jsx` (Map Initialization)**:
   - Initializes `mapboxgl.Map` with premium streets day styling (`mapbox://styles/mapbox/streets-v12`) centered near the JSSATE College coordinates.
   - Renders custom HTML circular badges for each intersection node displaying the Node ID (`1`, `2`, ..., `13`) with scale-up CSS transitions and defined width/height.
   - Prevents GPU compositor translation bugs using hardware-accelerated wrapper layering.
   - Overrides Mapbox popup default backgrounds to adapt dynamically to light/dark themes (`.mapboxgl-popup-content { background: var(--bg-card) }`).

2. **`MapView.jsx` (GeoJSON Directions Fetching)**:
   - If an active emergency result is found, it extracts the node path (e.g. `[1, 9, 5]`).
   - Converts the array of nodes into a GPS longitude/latitude path coordinates sequence.
   - Issues an asynchronous `fetch` request to the Mapbox Directions API:
     ```
     https://api.mapbox.com/directions/v5/mapbox/driving/{lng1},{lat1};{lng2},{lat2};...;{lngN},{latN}?geometries=geojson&access_token={MAPBOX_TOKEN}
     ```
   - On success:
     - Extracts the road-matched GeoJSON driving line geometry.
     - Adds a Mapbox line layer (`highlight-route`) to overlay the precise street path.
   - On failure (Fallback):
     - Connects nodes using hardcoded segment coordinate arrays from `ROUTE_COORDS` in `cityData.js`.

3. **`MapView.jsx` (Ambulance Driving Animation)**:
   - Clicking **Run Animation** calls `runAnimation()`.
   - Uses **Turf.js** helper libraries to compute path geometry properties:
     - `turf.length(route)` calculates overall driving distance in kilometers.
   - Employs an extra smooth rendering loop via `requestAnimationFrame(animate)`.
   - For each frame, it computes `turf.along(route, currentProgressDistance)` to fetch the exact sub-coordinate.
   - Sets the ambulance circular pin marker position `marker.setLngLat(...)` dynamically, creating a realistic, street-aligned driving simulation.

---

#### Flow 3: Step-by-Step Graph Algorithm Visualization
In the academic visualizer, the user runs pathfinders to inspect algorithm steps:

1. **`AlgorithmVisualizer.jsx` (Node Selection Highlight)**:
   - Source node and Target node dropdown selections dynamically update `sourceNode` and `targetNode` in the context state.
   - `getNodeClass(nodeId)` instantly intercepts these:
     ```javascript
     if (nodeId === sourceNode) return 'node-source'; // Red circle
     if (nodeId === targetNode) return 'node-target'; // Green circle
     ```
   - This changes node colors on the SVG canvas instantly, before the algorithm runs.

2. **`AlgorithmVisualizer.jsx` (Algorithm Dispatcher)**:
   - Clicking **Play** or **Step Forward** calls `handleRun()`.
   - Instantiates the corresponding search engine (`AStarEngine`, `DijkstraEngine`, `BFSEngine`, or `DFSEngine`).
   - Executes the engine's `.run(source, target)` method.
   - Returns a structured array of **step states**, representing snapshots of data structures at every cycle:
     - For Dijkstra: queue state (`pq`), visited sets, current checking node, relaxed edges, and intermediate distance maps.
     - For A*: `gScore` (actual cost distance), `hScore` (GPS heuristic value), and `fScore` ($f = g + h$) evaluations maps.

3. **`AlgorithmVisualizer.jsx` (Visualization Loop)**:
   - A `setInterval` timer increments `currentStepIndex` based on selected playback speeds.
   - The SVG canvas styles edges and nodes dynamically:
     - Nodes in active exploration are colored Cyan (`node-visiting`).
     - Nodes completed are colored Blue (`node-visited`).
     - Edges actively relaxing pulse with animated dashes (`edge-exploring`).
     - Optimal paths display with thick cyan highlights (`edge-path`).
     - Auxiliary tables display mathematical updates (A* evaluation arrays $f(n) = g(n) + h(n)$) cycle by cycle.

---

### 3. Database Schema Relation Mappings

Structured relational models are documented and mapped visually inside `ERDiagram.jsx`:

1. **Patients Table (`patients`)**:
   - `patient_id` (PK) acts as unique patient token.
2. **Emergency Cases Table (`emergency_cases`)**:
   - `case_id` (PK) maps each incoming distress case.
   - `patient_id` (FK) maps to `patients.patient_id` (1:N relationship).
   - `source_location_id` (FK) maps to `location_nodes.node_id` (1:N relationship).
3. **Hospitals Table (`hospitals`)**:
   - `hospital_id` (PK) maps each medical institution.
   - `location_node_id` (FK) maps to `location_nodes.node_id` (1:N relationship).
4. **Hospital Specializations Table (`hospital_specializations`)**:
   - `spec_id` (PK) records specialized departments.
   - `hospital_id` (FK) maps to `hospitals.hospital_id` (1:N relationship).
5. **Hospital Resources Table (`hospital_resources`)**:
   - `resource_id` (PK) maps equipment counts.
   - `hospital_id` (FK) maps to `hospitals.hospital_id` (1:1 relationship).
6. **Location Nodes Table (`location_nodes`)**:
   - `node_id` (PK) maps Bangalore physical intersections.
7. **Road Edges Table (`road_edges`)**:
   - `edge_id` (PK) maps bidirectional street segments.
   - `from_node_id` (FK) maps to `location_nodes.node_id` (1:N relationship).
8. **Allocations Table (`allocations`)**:
   - `allocation_id` (PK) records dispatch transaction history logs.
   - `case_id` (FK) maps to `emergency_cases.case_id` (1:N relationship).
   - `hospital_id` (FK) maps to `hospitals.hospital_id` (1:N relationship).

Every mathematical SSSP recommendation dispatch is fully traceable back to these database relations, ensuring full academic rigor and structural integrity.

---

### 4. Chronological Step-by-Step Function Call Trace Map

To ensure absolute end-to-end traceability of the code, this section maps every single functional call sequence chronologically from starting the application, taking an emergency input, finding the path, drawing the map route, syncing the visualizer page, and displaying schema logs:

#### Step 1: Initialization & Context Setup
1. **`main.jsx`** invokes `ReactDOM.createRoot().render()`.
2. Encapsulates `<App />` within the global `<AppProvider>` defined in `src/context/AppContext.jsx`.
3. **`AppProvider`** runs the following initializations:
   - Evaluates `LOCATIONS` and `EDGES` in `cityData.js`.
   - Instantiates a new `CityGraph` model: `const g = new CityGraph();`.
   - Loops over locations and edges, adding nodes via `g.addNode(id, data)` and adding bidirectional edges via `g.addEdge(from, to, weight, attributes)`.
   - Initializes reactive states: `hospitals` (with clinical capacities), `theme` (default 'dark' or loaded from `localStorage`), `emergencyRequest` (null), `emergencyResult` (null), `selectedAlgorithm` ('dijkstra'), `sourceNode` (1), `targetNode` (5), `trafficEnabled` (true).
   - Dynamically sets the HTML root attribute: `document.documentElement.setAttribute('data-theme', theme)`.

#### Step 2: Emergency Case Entry
1. User navigates to `/emergency` styled in **`EmergencyEntry.jsx`**.
2. Form captures reactive input fields in `formData` (Patient Name, Age, Contact, Source Node ID, Emergency Type, ICU status).
3. Clicking **Find Best Hospital & Route** triggers `onSubmit={handleSubmit}` in `EmergencyEntry.jsx`.
4. `handleSubmit` calls `runRecommendation(request)` exposed from context.
5. In **`AppContext.jsx`**, `runRecommendation` does:
   - Sets `setEmergencyRequest(request)`.
   - Instantiates `new RecommendationService(graph, hospitals)`.
   - Invokes `service.recommend(request)`.
6. In **`RecommendationService.js`**, `recommend()` executes the SSSP pipeline:
   - Identifies clinical criteria (e.g. if case is `CARDIAC` and `needsIcu = true`, evaluates which hospitals have `specializations.includes('CARDIAC')` and `icuBedsAvailable > 0`).
   - For each candidate hospital, instantiates `new DijkstraEngine(this.graph)`.
   - Calls `dijkstra.run(sourceNodeId, hospital.nodeId, useTraffic)`.
7. Inside **`DijkstraEngine.js`**:
   - `run()` instantiates `new MinPriorityQueue()`.
   - Initializes `distances` array with `Infinity` for all nodes except the source node (`0`).
   - Inserts source node into priority queue: `pq.insert(sourceNodeId, 0)`.
   - Enters SSSP relaxation loop:
     - Pulls min-distance node: `const u = pq.extractMin()`.
     - Iterates over adjacent edges from the adjacency list: `this.graph.getAdjacentEdges(u)`.
     - Computes candidate path weight: `const weight = this.graph.getEffectiveWeight(u, v, useTraffic)`.
     - Relaxes distances: if `distances[u] + weight < distances[v]`, updates `distances[v]`, sets `previous[v] = u`, and inserts/updates `pq.insert(v, new_dist)`.
   - Returns the absolute shortest path array (`[1, 5]`) and total cumulative driving distance in km.
8. **`RecommendationService.js`** compares path costs across all valid candidates, ranking them:
   - `primary`: Hospital matching specifications with minimum Dijkstra path cost.
   - `backup`: Next best hospital option matching specifications.
9. In **`AppContext.jsx`**, `runRecommendation` intercepts the SSSP results:
   - Updates global state: `setEmergencyResult(result)`.
   - Calls `addToHistory(entry)` to record a persistent transaction audit row in the `history` array.
10. `EmergencyEntry.jsx` navigates to `/results` via `navigate('/results')`.

#### Step 3: Results Display & Map View Rendering
1. **`Results.jsx`** receives active state `emergencyResult` and `emergencyRequest` from `useApp()`.
2. Computes the optimal driving time (e.g., `(distance / 45) * 60` minutes) and lists the leg-by-leg routing nodes.
3. User navigates to `/map` styled in **`MapView.jsx`**.
4. **`MapView.jsx`** executes the Mapbox container initialization:
   - Adds custom map styles to fix marker stacking: `import 'mapbox-gl/dist/mapbox-gl.css'`.
   - Creates a new `mapboxgl.Map` instance centered in Bangalore near JSSATE.
   - Loops over locations and draws pins. Custom HTML nodes show Node IDs directly on Mapbox pins: `el.className = 'location-marker'; el.innerHTML = loc.id;`.
   - Overrides Mapbox popup default backgrounds to adapt dynamically to light/dark themes (`.mapboxgl-popup-content { background: var(--bg-card) }`).
5. Mapbox GeoJSON Path Rendering:
   - If `emergencyResult` exists, extracts the optimal node path (e.g. `[1, 9, 5]`).
   - Converts the array of nodes into a GPS longitude/latitude path coordinates sequence.
   - Issues a fetch request to the Mapbox Directions API using coordinates: `https://api.mapbox.com/directions/v5/mapbox/driving/lng1,lat1;...`.
   - Adds source `highlight-route` layer to display a glowing cyan line (`#06b6d4`) matching real-world Bangalore street directions.
6. Animation Trigger:
   - User clicks **Run Animation** which executes `runAnimation()`.
   - Employs Turf.js library calculations: `turf.length(route)` and loops with `requestAnimationFrame(animate)`.
   - Slides the ambulance pin marker smoothly along precise driving coordinates via `marker.setLngLat(turf.along(route, progress).geometry.coordinates)`.

#### Step 4: Step-by-Step Academic Algorithm Visualizer
1. User navigates to `/visualizer` (`http://localhost:5173/visualizer`) styled in **`AlgorithmVisualizer.jsx`**.
2. A context synchronization `useEffect` immediately fires:
   - Detects active global emergency case.
   - Automatically synchronizes visualizer selects: `setSourceNode(emergencyRequest.sourceNodeId)` and `setTargetNode(emergencyResult.primary.hospital.nodeId)`.
3. SVG canvas renders adjacency topology:
   - Selected source is colored Red (`.node-source circle`).
   - Selected target hospital is colored Vibrant Amber (`.node-target circle`) to differentiate it from other green hospital nodes (`.node-hospital circle`).
4. Clicking **Play** triggers `togglePlay()` -> calls `handleRun()`.
5. `handleRun` instantiates the selected pathfinder engine (e.g. `new AStarEngine(graph)`).
6. Inside **`AStarEngine.js`**:
   - Enters search loop incorporating straight-line GPS heuristic values: `h(n) = distance(node, target_node)`.
   - Computes total cost at every node evaluation: `fScore[n] = gScore[n] + h(n)`.
   - Stores step-by-step snapshots of queue (`pq`), evaluated costs, relaxed edges, and visited states.
7. **`AlgorithmVisualizer.jsx`** receives `steps` list and plays them using a state timer (`setInterval`).
8. Steps increment the active index, dynamically updating SVG classes:
   - Nodes actively explored turn Cyan (`.node-visiting`).
   - Checked edges pulse with dashed lines (`.edge-exploring`).
   - Completed relaxation nodes turn Blue (`.node-visited`).
   - Data structure arrays and cost evaluation tables ($f = g + h$) dynamically re-render step-by-step in the sidebar panel.
