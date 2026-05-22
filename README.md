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

## 🔍 Code Traceability Guide
For a thorough end-to-end trace of system workflows (e.g. from Emergency Case creation to Dijkstra path resolution, SQL Database Log Audits, and Mapbox driving animation frames), please open and refer to:
👉 **[COMPREHENSIVE_DOCUMENTATION.md](file:///Users/abhi/Desktop/insta/AMBULANCE/COMPREHENSIVE_DOCUMENTATION.md)**
