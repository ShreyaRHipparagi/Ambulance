"use strict";
/**
 * Smart Ambulance Routing System
 * PDF Generator — Slide Explanations + End-to-End Architecture Flow
 */
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "Smart_Ambulance_Documentation.pdf");
const ARCH_IMG = "/Users/abhi/Desktop/insta/AMBULANCE/architecture_diagram.png";

// ── Color palette (matching PPT) ──────────────────────────
const C = {
  navy:   "#0B1D3A",
  mid:    "#112B52",
  teal:   "#00B4D8",
  teal2:  "#0077B6",
  amber:  "#F59E0B",
  green:  "#10B981",
  purple: "#8B5CF6",
  red:    "#EF4444",
  white:  "#FFFFFF",
  light:  "#E0F0FF",
  muted:  "#64748B",
  body:   "#1E293B",
  card:   "#F8FAFF",
  pink:   "#EC4899",
};

const doc = new PDFDocument({
  size: "A4",
  margins: { top: 0, bottom: 0, left: 0, right: 0 },
  info: {
    Title: "Smart Ambulance Routing — Slide Explanations & Architecture",
    Author: "Shreya R Hipparagi",
    Subject: "VTU 4th Semester CSE Project Documentation",
  },
});

doc.pipe(fs.createWriteStream(OUT));

const W = doc.page.width;   // 595.28
const H = doc.page.height;  // 841.89
const PAD = 42;
const CONTENT_W = W - PAD * 2;

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────
function hex(color) { return color; }

function fillRect(x, y, w, h, color) {
  doc.save().rect(x, y, w, h).fill(color).restore();
}

function pageHeader(bgColor, accentColor, title, subtitle, badgeText) {
  // Background strip
  fillRect(0, 0, W, 90, bgColor);
  // Left accent bar
  fillRect(0, 0, 8, 90, accentColor);
  // Title
  doc.font("Helvetica-Bold").fontSize(22).fillColor(C.white)
     .text(title, PAD, 18, { width: W - PAD * 2 - 60 });
  // Subtitle
  doc.font("Helvetica-Oblique").fontSize(11).fillColor(C.light)
     .text(subtitle, PAD, 52, { width: W - PAD * 2 - 60 });
  // Badge (top right)
  if (badgeText) {
    fillRect(W - 130, 18, 90, 28, accentColor);
    doc.font("Helvetica-Bold").fontSize(9).fillColor(C.white)
       .text(badgeText, W - 130, 26, { width: 90, align: "center" });
  }
}

function sectionLabel(label, color, y) {
  fillRect(PAD, y, 5, 20, color);
  doc.font("Helvetica-Bold").fontSize(12).fillColor(color)
     .text(label, PAD + 14, y + 3, { width: CONTENT_W });
  return y + 28;
}

function paragraph(text, y, options = {}) {
  const { color = C.body, size = 10.5, indent = 0 } = options;
  doc.font("Helvetica").fontSize(size).fillColor(color)
     .text(text, PAD + indent, y, { width: CONTENT_W - indent, lineGap: 3 });
  return doc.y + 8;
}

function bulletList(items, y, accentColor = C.teal, options = {}) {
  const { size = 10.5, indent = 0 } = options;
  items.forEach((item) => {
    // Bullet dot
    doc.save().circle(PAD + indent + 5, y + 5, 3.5).fill(accentColor).restore();
    doc.font("Helvetica").fontSize(size).fillColor(C.body)
       .text(item, PAD + indent + 16, y, { width: CONTENT_W - indent - 16, lineGap: 2 });
    y = doc.y + 5;
  });
  return y + 4;
}

function numberedList(items, y, accentColor = C.teal, options = {}) {
  const { size = 10, indent = 0 } = options;
  items.forEach(([num, bold, rest], i) => {
    // Circle number
    doc.save().circle(PAD + indent + 9, y + 7, 9).fill(accentColor).restore();
    doc.font("Helvetica-Bold").fontSize(8).fillColor(C.white)
       .text(String(num), PAD + indent + 5, y + 3, { width: 18, align: "center" });
    // Bold label
    const labelEnd = PAD + indent + 22;
    doc.font("Helvetica-Bold").fontSize(size).fillColor(C.body)
       .text(bold + " ", labelEnd, y, { continued: true, lineGap: 2 });
    doc.font("Helvetica").fillColor(C.muted).text(rest, { lineGap: 2 });
    y = doc.y + 6;
  });
  return y;
}

function codeBlock(code, y, options = {}) {
  const { color = C.teal, bgColor = "#0D1B2A", size = 8.5 } = options;
  const lines = code.trim().split("\n");
  const bh = lines.length * 14 + 16;
  fillRect(PAD, y, CONTENT_W, bh, bgColor);
  // Left bar
  fillRect(PAD, y, 3, bh, color);
  doc.font("Courier").fontSize(size).fillColor(color)
     .text(code.trim(), PAD + 10, y + 8, { width: CONTENT_W - 20, lineGap: 2 });
  return y + bh + 10;
}

function chip(text, x, y, w, color, textColor = C.white) {
  fillRect(x, y, w, 20, color);
  doc.font("Helvetica-Bold").fontSize(8).fillColor(textColor)
     .text(text, x, y + 5, { width: w, align: "center" });
}

function divider(y, color = C.teal) {
  doc.save().moveTo(PAD, y).lineTo(W - PAD, y)
     .strokeColor(color).lineWidth(0.5).stroke().restore();
  return y + 12;
}

function infoBox(title, body, y, accentColor = C.teal) {
  const lines = body.split("\n");
  const bh = lines.length * 15 + 30;
  // Card bg
  fillRect(PAD, y, CONTENT_W, bh, "#EFF6FF");
  fillRect(PAD, y, 4, bh, accentColor);
  doc.font("Helvetica-Bold").fontSize(10.5).fillColor(accentColor)
     .text(title, PAD + 14, y + 8, { width: CONTENT_W - 14 });
  doc.font("Helvetica").fontSize(10).fillColor(C.body)
     .text(body, PAD + 14, y + 24, { width: CONTENT_W - 20, lineGap: 3 });
  return y + bh + 10;
}

function twoCol(leftLabel, leftItems, rightLabel, rightItems, y,
                leftColor = C.teal, rightColor = C.green) {
  const colW = CONTENT_W / 2 - 8;
  const startY = y;

  // Left column
  fillRect(PAD, y, colW, 24, leftColor);
  doc.font("Helvetica-Bold").fontSize(10).fillColor(C.white)
     .text(leftLabel, PAD + 6, y + 7, { width: colW - 8 });
  let ly = y + 30;
  leftItems.forEach((item) => {
    doc.save().circle(PAD + 10, ly + 5, 3).fill(leftColor).restore();
    doc.font("Helvetica").fontSize(9.5).fillColor(C.body)
       .text(item, PAD + 20, ly, { width: colW - 22, lineGap: 2 });
    ly = doc.y + 4;
  });

  // Right column
  const rx = PAD + colW + 16;
  fillRect(rx, y, colW, 24, rightColor);
  doc.font("Helvetica-Bold").fontSize(10).fillColor(C.white)
     .text(rightLabel, rx + 6, y + 7, { width: colW - 8 });
  let ry = y + 30;
  rightItems.forEach((item) => {
    doc.save().circle(rx + 10, ry + 5, 3).fill(rightColor).restore();
    doc.font("Helvetica").fontSize(9.5).fillColor(C.body)
       .text(item, rx + 20, ry, { width: colW - 22, lineGap: 2 });
    ry = doc.y + 4;
  });

  return Math.max(ly, ry) + 10;
}

function addPage(bgColor = "#FFFFFF") {
  doc.addPage({ size: "A4", margins: { top: 0, bottom: 0, left: 0, right: 0 } });
  if (bgColor !== "#FFFFFF") fillRect(0, 0, W, H, bgColor);
  return 100; // Y start after header
}

function footer(slideNum, total, label) {
  const fy = H - 30;
  fillRect(0, fy, W, 30, C.navy);
  doc.font("Helvetica").fontSize(8).fillColor(C.teal)
     .text(`Smart Ambulance Routing & Hospital Allocation System  ·  VTU 4th Semester CSE`, PAD, fy + 10, { width: CONTENT_W / 2 });
  if (label) {
    doc.font("Helvetica-Bold").fontSize(8).fillColor(C.white)
       .text(label, W / 2, fy + 10, { width: CONTENT_W / 2, align: "right" });
  }
}

// ─────────────────────────────────────────────────────────
// COVER PAGE
// ─────────────────────────────────────────────────────────
fillRect(0, 0, W, H, C.navy);
// Top teal stripe
fillRect(0, 0, W, 8, C.teal);
// Bottom teal stripe
fillRect(0, H - 8, W, 8, C.teal);
// Left accent
fillRect(0, 0, 8, H, C.teal);

// Ambulance circle
doc.save().circle(W - 100, 140, 75).fill(C.mid).restore();
doc.save().circle(W - 100, 140, 75).strokeColor(C.teal).lineWidth(2).stroke().restore();
doc.font("Helvetica").fontSize(52).fillColor(C.white)
   .text("🚑", W - 140, 108, { width: 80, align: "center" });

// Title block
doc.font("Helvetica-Bold").fontSize(32).fillColor(C.white)
   .text("Smart Ambulance", PAD, 90, { width: 360 });
doc.font("Helvetica-Bold").fontSize(32).fillColor(C.teal)
   .text("Routing System", PAD, 130, { width: 360 });
doc.font("Helvetica-Bold").fontSize(16).fillColor(C.white)
   .text("& Hospital Allocation System", PAD, 175, { width: 360 });

// Divider
doc.save().moveTo(PAD, 210).lineTo(W - PAD, 210)
   .strokeColor(C.teal).lineWidth(1).stroke().restore();

// Subtitle
doc.font("Helvetica-Oblique").fontSize(12).fillColor(C.light)
   .text("Complete Slide-by-Slide Explanation + End-to-End Architecture Flow", PAD, 225, { width: CONTENT_W });

// Subject chips row
const badges = [
  ["BCS401  ADA",    C.amber,  PAD],
  ["BCS402  OOCJ",  "#374BD0", PAD + 130],
  ["BCS403  DBMS",  C.purple,  PAD + 260],
  ["BCS405B GT",    C.teal,    PAD + 390],
];
badges.forEach(([label, color, x]) => {
  if (x < W - PAD) { fillRect(x, 268, 110, 26, color); }
  doc.font("Helvetica-Bold").fontSize(9).fillColor(C.white)
     .text(label, x, 275, { width: 110, align: "center" });
});

// Table of contents
fillRect(PAD, 320, CONTENT_W, 380, C.mid);
fillRect(PAD, 320, CONTENT_W, 32, C.teal2);
doc.font("Helvetica-Bold").fontSize(13).fillColor(C.white)
   .text("Table of Contents", PAD + 12, 332, { width: CONTENT_W });

const toc = [
  ["01", "Cover & Introduction",           "Slide 1 Explanation"],
  ["02", "What This Project Does",          "Slide 2 Explanation"],
  ["03", "BCS401 — Algorithm Design",       "Slide 3 Explanation"],
  ["04", "BCS402 — Advanced Java",          "Slide 4 Explanation"],
  ["05", "BCS403 — DBMS",                   "Slide 5 Explanation"],
  ["06", "BCS405B — Graph Theory",          "Slide 6 Explanation"],
  ["07", "System Architecture",             "Slide 7 Explanation"],
  ["08", "How 4 Subjects Connect",          "Slide 8 Explanation"],
  ["09", "3 Demo Cases",                    "Slide 9 Explanation"],
  ["10", "Viva Closing",                    "Slide 10 Explanation"],
  ["11", "End-to-End Architecture Flow",    "Full Component Trace"],
  ["12", "Dijkstra SSSP Deep Dive",         "Algorithm Analysis"],
  ["13", "Data Persistence & DB Schema",    "localStorage + ER"],
];
toc.forEach(([num, title, sub], i) => {
  const ty = 364 + i * 25;
  doc.save().circle(PAD + 18, ty + 8, 10).fill(i < 10 ? C.teal : C.amber).restore();
  doc.font("Helvetica-Bold").fontSize(9).fillColor(C.white)
     .text(num, PAD + 13, ty + 4, { width: 20, align: "center" });
  doc.font("Helvetica-Bold").fontSize(10.5).fillColor(C.white)
     .text(title, PAD + 34, ty, { width: 280 });
  doc.font("Helvetica").fontSize(9).fillColor(C.light)
     .text(sub, PAD + 34, ty + 13, { width: 280 });
  doc.font("Helvetica").fontSize(9).fillColor(C.teal)
     .text(`Page ${i + 2}`, W - PAD - 40, ty + 4, { width: 40, align: "right" });
});

// Author
doc.font("Helvetica-Bold").fontSize(11).fillColor(C.white)
   .text("Shreya R Hipparagi  ·  VTU 4th Semester CSE  ·  2025–26", PAD, H - 60, { width: CONTENT_W, align: "center" });
doc.font("Helvetica").fontSize(10).fillColor(C.teal)
   .text("github.com/ShreyaRHipparagi/Ambulance", PAD, H - 42, { width: CONTENT_W, align: "center" });

// ─────────────────────────────────────────────────────────
// SLIDE 1 — TITLE
// ─────────────────────────────────────────────────────────
addPage();
pageHeader(C.navy, C.teal, "Slide 1 — Title Slide", "Project introduction, purpose, and academic coverage", "SLIDE 1");
let y = 108;

y = sectionLabel("What This Slide Shows", C.teal, y);
y = paragraph(
  "The title slide introduces the project to the audience — examiner, faculty, or peers. It immediately communicates what the project does (smart ambulance routing), who built it (4th Semester CSE student), and why it is academically relevant (4 subjects demonstrated end-to-end).",
  y, { size: 11 }
);

y = divider(y + 4);
y = sectionLabel("Design Decisions", C.teal2, y);
y = bulletList([
  "Dark navy (#0B1D3A) background creates a professional, premium look — avoids the 'default PPT template' look.",
  "Teal left stripe (#00B4D8) is a visual anchor that repeats on every dark slide — creates visual continuity.",
  "The ambulance emoji inside a circle immediately communicates the project domain without needing text.",
  "Four coloured subject badges (amber, green, purple, teal) are positioned prominently so an examiner sees all 4 subjects at a glance.",
  "The tagline is italicized to distinguish it visually from the main title without being too prominent.",
], y, C.teal);

y = divider(y);
y = sectionLabel("What to Say in Viva (Slide 1)", C.amber, y);
y = infoBox("Opening Statement",
  '"This project is called Smart Ambulance Routing and Hospital Allocation System. It is a React-based web application that uses real Bangalore city map data — 13 GPS-verified locations and 23 road connections — to find the optimal hospital for an emergency patient. It simultaneously demonstrates all four of our 4th semester subjects: BCS401 Algorithm Design, BCS402 Advanced Java concepts, BCS403 DBMS, and BCS405B Graph Theory."',
  y, C.teal);

y = sectionLabel("Academic Subjects Covered (Slide 1)", C.purple, y);
y = bulletList([
  "BCS401 ADA — Motivates why an algorithm is needed (ambulance routing problem)",
  "BCS402 OOCJ — OOP structure of the React component architecture",
  "BCS403 DBMS — Database design problem (hospitals, patients, roads, allocations)",
  "BCS405B GT — City roads as a graph (nodes = intersections, edges = roads)",
], y, C.purple);
footer(1, 13, "Slide 1 of 10");

// ─────────────────────────────────────────────────────────
// SLIDE 2 — WHAT THIS PROJECT DOES
// ─────────────────────────────────────────────────────────
addPage();
pageHeader(C.teal2, C.teal, "Slide 2 — What This Project Does", "Problem statement vs solution — the core motivation", "SLIDE 2");
y = 108;

y = sectionLabel("The Problem (Left Card)", C.red, y);
y = bulletList([
  "In real emergencies, dispatchers call the nearest hospital — but 'nearest' is based on intuition, not data.",
  "The nearest hospital may not handle the emergency type (e.g., no cardiac unit).",
  "It may be full — zero ICU beds or no general beds available.",
  "It may not be the fastest route if there is traffic congestion on that road.",
  "Manual decision-making under pressure leads to preventable delays — the golden hour is lost.",
], y, C.red);

y = divider(y);
y = sectionLabel("Our Solution (Right Card — 4 Steps)", C.green, y);
y = numberedList([
  [1, "Match hospital:", "Check if the hospital handles the specific emergency type (CARDIAC, TRAUMA, NEURO, BURNS, MATERNITY, GENERAL)"],
  [2, "Check resources:", "Confirm ICU beds are available (if patient needs ICU) or general beds are available"],
  [3, "Find best route:", "Run Dijkstra's algorithm on the city graph — weighted by road distance and live traffic multiplier"],
  [4, "Recommend:", "Return the lowest-cost hospital as PRIMARY and second-lowest as BACKUP"],
], y, C.green);

y = divider(y);
y = sectionLabel("Why These 4 Steps Matter", C.teal, y);
y = twoCol(
  "Without This System", [
    "Nearest hospital chosen blindly",
    "No specialization check",
    "No bed availability check",
    "No traffic-aware routing",
    "No backup hospital suggested",
  ],
  "With This System", [
    "Best-qualified hospital selected",
    "Emergency type verified first",
    "Bed count checked in real-time",
    "Dijkstra + live traffic routing",
    "Primary + backup both provided",
  ],
  y, C.red, C.green
);

y = sectionLabel("What to Say in Viva (Slide 2)", C.amber, y);
y = infoBox("Key Point",
  '"Our system does not just find the closest hospital — it finds the BEST hospital. It filters by emergency specialization, then checks bed availability, and only then runs Dijkstra\'s shortest-path algorithm on the city road graph. This ensures the recommended hospital can actually treat the patient AND is reachable in the minimum time."',
  y, C.amber);
footer(2, 13, "Slide 2 of 10");

// ─────────────────────────────────────────────────────────
// SLIDE 3 — BCS401: ALGORITHM DESIGN
// ─────────────────────────────────────────────────────────
addPage();
pageHeader(C.navy, C.amber, "Slide 3 — BCS401: Algorithm Design & Analysis", "Concepts, justifications, and complexity used in this project", "BCS401");
y = 108;

y = sectionLabel("Card 1: Problem Definition & Requirements Analysis", C.amber, y);
y = bulletList([
  "Formally defined the problem: given a patient at location X with emergency type E, find hospital H* that minimises travel cost c(X, H*) subject to: H*.specializations contains E AND H*.bedsAvailable > 0.",
  "This is a constrained shortest-path problem on a weighted graph — it requires ADA-level thinking.",
  "Requirements Analysis: identified 3 constraints (type, beds, distance) and 2 outputs (primary + backup).",
], y, C.amber);

y = divider(y);
y = sectionLabel("Card 2: Brute-Force vs Smart Search", C.amber, y);
y = twoCol(
  "Brute-Force O(H × V²)", [
    "Check every possible hospital",
    "For each hospital: scan all paths",
    "No filtering — wastes computation",
    "Scales badly: 6 hospitals × 13 nodes",
  ],
  "Smart: Filter + Dijkstra O((V+E)logV)", [
    "Step 1: filter by specialization",
    "Step 2: filter by bed availability",
    "Step 3: Dijkstra only for candidates",
    "O(k(V+E)logV) where k ≤ 6 hospitals",
  ],
  y, C.red, C.green
);

y = sectionLabel("Card 3: Why Dijkstra? (The Core Justification)", C.amber, y);
y = bulletList([
  "Road edges have DIFFERENT distances (weights) — 1.2 km vs 7.2 km. BFS treats all edges as equal — WRONG for roads.",
  "Dijkstra finds the globally optimal shortest path in a weighted graph with non-negative weights — proven correct.",
  "A* improves on Dijkstra using a GPS heuristic: h(n) = Haversine distance to target. It prunes irrelevant nodes.",
  "BFS/DFS are used for educational visualization only — not for the actual recommendation.",
], y, C.amber);

y = divider(y);
y = sectionLabel("Card 4: Time Complexity Comparison", C.amber, y);
y = codeBlock(
  `BFS / DFS     :  O(V + E)         V=13, E=23  →  O(36)   — unweighted traversal only
Dijkstra      :  O((V+E) log V)   V=13, E=23  →  O(36 × 3.7) ≈ O(133)
A* Search     :  O(E) best case   with GPS heuristic — prunes ~40% of nodes
Binary Heap   :  insert O(log N), extractMin O(log N)  — backing Dijkstra & A*`,
  y, { color: C.teal }
);

y = sectionLabel("What to Say in Viva (BCS401)", C.amber, y);
y = infoBox("Examiner Question: Why not BFS?",
  '"BFS finds the path with the fewest hops — not the shortest distance. In our city graph, a 2-hop path might be 12 km while a 3-hop path is only 3.5 km. BFS would pick the 2-hop path incorrectly. Dijkstra considers edge weights — real road distances — so it always finds the minimum-distance path. That is why we use Dijkstra."',
  y, C.amber);
footer(3, 13, "Slide 3 of 10");

// ─────────────────────────────────────────────────────────
// SLIDE 4 — BCS402: ADVANCED JAVA / OOCJ
// ─────────────────────────────────────────────────────────
addPage();
pageHeader(C.navy, C.green, "Slide 4 — BCS402: Advanced Java / OOP Concepts", "Object-oriented design patterns used in the React + JS project", "BCS402");
y = 108;

y = sectionLabel("Row 1: Object-Oriented Programming (OOP)", C.green, y);
y = bulletList([
  "CityGraph class — encapsulates the adjacency list, addNode(), addEdge(), getNeighbors(), getEffectiveWeight().",
  "DijkstraEngine class — single responsibility: takes a graph and runs SSSP. No UI concerns.",
  "RecommendationService class — orchestrates the pipeline (filter → Dijkstra per hospital → sort → return).",
  "PriorityQueue class — pure min-heap with insert(), extractMin(), peek(), toArray(). Zero dependencies.",
  "Each class follows Single Responsibility Principle — one class, one job.",
], y, C.green);

y = divider(y);
y = sectionLabel("Row 2: Collections Framework (JavaScript equivalents)", C.green, y);
y = bulletList([
  "HashMap → JavaScript Map — O(1) lookup for nodes, adjacency lists, distance tables.",
  "ArrayList → JavaScript Array — neighbor lists, step capture arrays, history records.",
  "PriorityQueue → Custom binary min-heap — insert O(log N), extractMin O(log N).",
  "Set → JavaScript Set — visited node tracking in Dijkstra (prevents revisiting).",
], y, C.green);

y = divider(y);
y = sectionLabel("Row 3: Swing UI → React Component Model", C.green, y);
y = bulletList([
  "React components ≡ Swing JPanel — each component has state, renders UI, handles events.",
  "useState() ≡ class fields — stores form data, algorithm steps, route data.",
  "useEffect() ≡ componentDidMount/Update — fires on mount (map init, data fetch) and on state change.",
  "AppContext ≡ Singleton service — global state accessible from any component without prop drilling.",
  "Framer Motion ≡ Java animation timers — smooth page transitions and card entrance animations.",
], y, C.green);

y = divider(y);
y = sectionLabel("Row 4: JDBC → localStorage (Data Persistence)", C.green, y);
y = bulletList([
  "JDBC connects Java app to MySQL — localStorage connects React app to browser storage.",
  "Both provide: write (INSERT/UPDATE), read (SELECT), delete (DELETE) operations.",
  "localStorage['emergency_history'] ≡ audit log table — persists across sessions.",
  "localStorage['hospital_beds'] ≡ resource table — bed counts survive page refresh.",
], y, C.green);

y = sectionLabel("What to Say in Viva (BCS402)", C.amber, y);
y = infoBox("Key Mapping",
  '"Although this project is in JavaScript and React rather than Java Swing, every OOP concept from BCS402 is demonstrated: CityGraph is an encapsulated class with private state and public methods — exactly like a Java class. The RecommendationService uses dependency injection — it receives the graph and hospitals as constructor arguments, making it testable and reusable."',
  y, C.green);
footer(4, 13, "Slide 4 of 10");

// ─────────────────────────────────────────────────────────
// SLIDE 5 — BCS403: DBMS
// ─────────────────────────────────────────────────────────
addPage();
pageHeader(C.navy, C.purple, "Slide 5 — BCS403: Database Management System", "Relational schema, ER diagram, 3NF normalization, and SQL queries", "BCS403");
y = 108;

y = sectionLabel("ER Diagram — 8 Entities, 3NF", C.purple, y);
y = bulletList([
  "patients (patient_id PK, name, age, blood_group, contact)",
  "location_nodes (node_id PK, name, area, lat, lng)",
  "road_edges (edge_id PK, from_node FK, to_node FK, weight_km, traffic_multiplier)",
  "hospitals (hospital_id PK, name, address, contact, node_id FK)",
  "hospital_specializations (spec_id PK, hospital_id FK, emergency_type)",
  "hospital_resources (resource_id PK, hospital_id FK, icu_total, icu_avail, gen_total, gen_avail)",
  "emergency_cases (case_id PK, patient_id FK, source_location FK, emergency_type, needs_icu, timestamp)",
  "allocations (allocation_id PK, case_id FK, hospital_id FK, backup_hosp FK, route_cost_km, path_nodes)",
], y, C.purple);

y = divider(y);
y = sectionLabel("3NF Normalization Proof", C.purple, y);
y = codeBlock(
  `1NF: All attributes atomic — no multi-valued fields (specializations split to own table ✓)
2NF: No partial dependencies — all non-key attributes depend on full primary key ✓
3NF: No transitive dependencies:
     patients: patient_id → name, age (no non-key → non-key dependency) ✓
     hospitals: hospital_id → name, address (not via node_id) ✓
     hospital_specializations: spec_id → {hospital_id, emergency_type} only ✓`,
  y, { color: C.purple }
);

y = sectionLabel("Key SQL Queries Used", C.purple, y);
y = codeBlock(
  `-- Filter hospitals by emergency type
SELECT h.* FROM hospitals h
JOIN hospital_specializations hs ON h.hospital_id = hs.hospital_id
WHERE hs.emergency_type = 'CARDIAC';

-- Check bed availability
SELECT icu_beds_available, general_beds_available
FROM hospital_resources WHERE hospital_id = 'H3';

-- Record new allocation
INSERT INTO allocations (case_id, hospital_id, route_cost_km, path_nodes)
VALUES (42, 'H3', 3.48, '[9, 5]');`,
  y, { color: C.purple }
);

y = sectionLabel("What to Say in Viva (BCS403)", C.amber, y);
y = infoBox("localStorage as DBMS Demo",
  '"In our implementation, we use localStorage as the persistence layer — this is equivalent to a client-side database. The emergency_history key acts as our allocations table, hospital_beds acts as our hospital_resources table. The schema I designed is fully normalized to 3NF — I can explain any table\'s primary key, foreign keys, and why there are no partial or transitive dependencies."',
  y, C.purple);
footer(5, 13, "Slide 5 of 10");

// ─────────────────────────────────────────────────────────
// SLIDE 6 — BCS405B: GRAPH THEORY
// ─────────────────────────────────────────────────────────
addPage();
pageHeader(C.navy, C.teal, "Slide 6 — BCS405B: Graph Theory", "City as a weighted undirected graph — traversal and shortest path proofs", "BCS405B");
y = 108;

y = sectionLabel("Graph Definition — G = (V, E)", C.teal, y);
y = codeBlock(
  `V = { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13 }    |V| = 13
E = 23 undirected weighted edges (e1 through e24, no e12)
w(u,v) = road distance in km  ×  traffic_multiplier (1.0 – 2.0)

Properties:
  - Undirected: roads are two-way    → bidirectional in adjacency list
  - Weighted:   edge weights ≥ 0    → Dijkstra valid (no negative cycles)
  - Connected:  all 13 nodes reachable from any source
  - Simple:     no self-loops, no multi-edges between same pair`,
  y, { color: C.teal }
);

y = sectionLabel("Graph Representation — Adjacency List", C.teal, y);
y = codeBlock(
  `Node 1 (JSSATE) → [ (3, 6.2km, ×1.0), (5, 1.2km, ×1.0), (6, 5.8km, ×1.5), (8, 7.2km, ×1.2), (9, 3.8km, ×1.0) ]
Node 5 (BGS)    → [ (1, 1.2km, ×1.0), (9, 2.9km, ×1.2) ]
Node 9 (Kengeri)→ [ (1, 3.8km, ×1.0), (5, 2.9km, ×1.2), (8, 4.8km, ×1.0) ]
...
Space complexity: O(V + E) = O(13 + 46) = O(59) directed adjacency entries`,
  y, { color: C.teal }
);

y = sectionLabel("BFS — Breadth-First Search", C.teal, y);
y = bulletList([
  "Queue-based level-order traversal: explores all nodes at distance d before nodes at distance d+1.",
  "Used for: connectivity check (is hospital H reachable from node X?).",
  "Answer: YES/NO — does not give shortest weighted distance.",
  "Complexity: O(V + E) = O(36) for this graph.",
], y, C.teal);

y = sectionLabel("DFS — Depth-First Search", C.teal, y);
y = bulletList([
  "Stack-based (or recursive) deep exploration: follows one path to the end before backtracking.",
  "Used for: listing ALL reachable hospitals from a source — complete reachability analysis.",
  "Demonstrates backtracking, recursion, and graph connectivity concepts.",
  "Complexity: O(V + E) = O(36) for this graph.",
], y, C.teal);

y = sectionLabel("What to Say in Viva (BCS405B)", C.amber, y);
y = infoBox("Examiner Question: Why adjacency list and not adjacency matrix?",
  '"Our city graph has 13 nodes but only 23 edges — it is sparse. An adjacency matrix would need 13×13 = 169 cells, but only 46 (23×2) would be non-zero. An adjacency list uses exactly V + 2E = 59 entries — much more memory-efficient for sparse graphs. Also, Dijkstra\'s getNeighbors() operation is O(degree) with adjacency list vs O(V) with matrix."',
  y, C.teal);
footer(6, 13, "Slide 6 of 10");

// ─────────────────────────────────────────────────────────
// SLIDE 7 — SYSTEM ARCHITECTURE
// ─────────────────────────────────────────────────────────
addPage();
pageHeader(C.navy, C.teal, "Slide 7 — System Architecture", "Component layers, data flow, and the architecture diagram explained", "SLIDE 7");
y = 108;

// Embed architecture image
if (fs.existsSync(ARCH_IMG)) {
  doc.image(ARCH_IMG, PAD, y, { width: CONTENT_W, height: 200 });
  y += 210;
}

y = sectionLabel("4-Layer Architecture", C.teal, y);
y = numberedList([
  [1, "UI Layer (React JSX pages):", "Dashboard, EmergencyEntry, Results, MapView, AlgorithmVisualizer, Hospitals, History, ERDiagram, About — each is a self-contained React component"],
  [2, "Context / State Layer:", "AppContext.jsx — single source of truth. Holds hospitals, history, emergencyResult, theme. Persists beds and history to localStorage."],
  [3, "Engine Layer:", "CityGraph (adjacency list), PriorityQueue (binary min-heap), DijkstraEngine, AStarEngine, BFSEngine, DFSEngine, RecommendationService"],
  [4, "Data Layer:", "cityData.js — static database of 13 nodes, 23 edges, 6 hospitals, ROUTE_COORDS, NODE_POSITIONS. Read-only; never mutated at runtime."],
], y, C.teal);

y = sectionLabel("External Integration: Mapbox API", C.amber, y);
y = bulletList([
  "MapView.jsx calls the Mapbox Directions API with profile: driving-traffic (not static 'driving').",
  "Returns: GeoJSON route geometry + per-segment congestion annotation ['low','moderate','heavy','severe'].",
  "Each road segment is colored independently: green=low, amber=moderate, red=heavy, dark red=severe.",
  "Ambulance animation uses Turf.js: along(route, distance) gives point at each animation frame.",
  "Bearing offset: setRotation(bearing − 90) because 🚑 emoji faces east by default (90°), Mapbox 0° = north.",
], y, C.amber);
footer(7, 13, "Slide 7 of 10");

// ─────────────────────────────────────────────────────────
// SLIDE 8 — HOW 4 SUBJECTS CONNECT
// ─────────────────────────────────────────────────────────
addPage();
pageHeader(C.navy, C.teal, "Slide 8 — How All 4 Subjects Work Together", "The interdependency chain that makes the system work", "SLIDE 8");
y = 108;

y = sectionLabel("The Dependency Chain", C.teal, y);
y = paragraph(
  "Each subject is not standalone — they form a chain where the output of one subject feeds the next. This is the key insight that makes this project exam-ready:",
  y, { size: 11 }
);

y = numberedList([
  [1, "BCS403 DBMS defines the data structures:", "The ER diagram tells us WHAT to store — patients, hospitals, roads, specializations, resources. Without DB schema design, we don't know what fields to query."],
  [2, "BCS405B Graph Theory models the data:", "The hospital table gives us nodes; the road_edges table gives us edges and weights. Graph Theory takes the DBMS schema and turns it into G=(V,E)."],
  [3, "BCS401 ADA runs on the graph:", "Dijkstra's SSSP runs on G=(V,E) from DBMS+GraphTheory. The algorithm uses edge weights from road_edges and the filter conditions from hospital_specializations."],
  [4, "BCS402 OOCJ/Java builds the whole system:", "The application code (CityGraph, DijkstraEngine, RecommendationService, AppContext, React pages) ties everything together. OOP structure makes each piece reusable and testable."],
], y, C.teal);

y = divider(y);
y = sectionLabel("Subject Roles in the Recommendation Pipeline", C.teal, y);
y = twoCol(
  "Subject → Role", [
    "BCS403: defined hospital_specializations table",
    "BCS403: hospital_resources has bed counts",
    "BCS405B: graph G = road_edges as adjacency list",
    "BCS401: Dijkstra SSSP finds min-cost path",
    "BCS402: RecommendationService orchestrates all",
  ],
  "Code Location", [
    "cityData.js HOSPITALS[].specializations[]",
    "AppContext.jsx hospitals[].icuBedsAvailable",
    "CityGraph.js addEdge() + getNeighbors()",
    "DijkstraEngine.js run(source, target)",
    "RecommendationService.js recommend(request)",
  ],
  y, C.purple, C.green
);

y = sectionLabel("What to Say in Viva (Slide 8)", C.amber, y);
y = infoBox("Connecting All 4 Subjects",
  '"The beauty of this project is that all 4 subjects are genuinely interdependent — not just independently demonstrated. DBMS gives us the schema. Graph Theory converts the schema into a graph. Algorithm Design finds the optimal path on that graph. And Advanced Java / OOP builds the application that ties it all together. Each subject is incomplete without the others."',
  y, C.amber);
footer(8, 13, "Slide 8 of 10");

// ─────────────────────────────────────────────────────────
// SLIDE 9 — 3 DEMO CASES
// ─────────────────────────────────────────────────────────
addPage();
pageHeader("#F8FAFF", C.teal2, "Slide 9 — 3 Demo Cases", "Walkthrough of three test scenarios to explain during viva", "SLIDE 9");
y = 108;

const cases = [
  {
    num: "01", color: C.green,
    title: "Nearest Hospital IS Best (Simple Case)",
    scenario: "Patient at Node 1 (JSSATE)  |  Emergency: GENERAL  |  No ICU",
    algorithm: [
      "Specialization filter: All 6 hospitals pass (all have GENERAL)",
      "Bed filter: All 6 pass (generalBedsAvailable > 0)",
      "Dijkstra from Node 1: BGS (Node 5) = 1.2km, Sagar (Node 4) = 7.7km, RRMCH (Node 8) = 7.2km...",
      "BGS wins — minimum cost path [1 → 5] at 1.2 km",
    ],
    result: "BGS Gleneagles Hospital selected — 1.2 km, ETA ~1.4 minutes.",
    lesson: "Demonstrates system works correctly in the simple case. Dijkstra confirms the nearby obvious choice.",
  },
  {
    num: "02", color: C.amber,
    title: "Nearest Hospital Lacks Specialization",
    scenario: "Patient at Node 1 (JSSATE)  |  Emergency: TRAUMA  |  Needs ICU",
    algorithm: [
      "Specialization filter: TRAUMA hospitals = RRMCH (H1), Sagar (H2), Fortis (H6) — BGS is filtered OUT",
      "Bed filter: All 3 pass (icuBedsAvailable > 0)",
      "Dijkstra: RRMCH (Node 8) = 7.2 km via [1→8], Sagar (Node 4) = 7.7 km via [1→3→4], Fortis = 17+ km",
      "RRMCH wins — minimum cost path [1 → 8] at 7.2 km",
    ],
    result: "RRMCH Mysore Road selected (7.2 km) even though BGS is only 1.2 km — because BGS doesn't handle TRAUMA.",
    lesson: "KEY VIVA POINT: Shows why 'nearest' ≠ 'best'. The specialization constraint is the critical differentiator.",
  },
  {
    num: "03", color: C.purple,
    title: "Multiple Valid Hospitals — Dijkstra Decides",
    scenario: "Patient at Node 10 (BSK Temple)  |  Emergency: CARDIAC  |  Needs ICU",
    algorithm: [
      "Specialization filter: CARDIAC = BGS (H3), Apollo (H5), Fortis (H6) — 3 candidates",
      "Bed filter: All 3 have ICU beds (2, 5, 4 respectively) — all pass",
      "Dijkstra from Node 10: BGS via [10→17→7→...→5] ≈ 9+ km, Apollo via [10→16→2→11] ≈ 5.5 km, Fortis via [10→16→2→13] ≈ 5.8 km",
      "Apollo wins — minimum cost path at ~5.5 km",
    ],
    result: "Apollo Hospital Bannerghatta Road selected — demonstrating Dijkstra choosing the globally optimal hospital.",
    lesson: "BEST CASE FOR VIVA: Three hospitals all qualify. Dijkstra is the ONLY way to decide which is truly nearest via roads (not straight line).",
  },
];

cases.forEach((c) => {
  fillRect(PAD, y, CONTENT_W, 22, c.color);
  doc.font("Helvetica-Bold").fontSize(12).fillColor(C.white)
     .text(`CASE ${c.num} — ${c.title}`, PAD + 10, y + 5, { width: CONTENT_W - 60 });
  chip(`CASE ${c.num}`, W - PAD - 70, y, 70, C.navy, C.white);
  y += 26;

  doc.font("Helvetica-Oblique").fontSize(9.5).fillColor(C.muted)
     .text("Scenario: " + c.scenario, PAD + 8, y, { width: CONTENT_W - 8 });
  y = doc.y + 6;

  y = bulletList(c.algorithm, y, c.color, { size: 10 });

  fillRect(PAD, y, CONTENT_W, 20, "#EFF6FF");
  doc.font("Helvetica-Bold").fontSize(10).fillColor(C.teal2)
     .text("Result: " + c.result, PAD + 8, y + 4, { width: CONTENT_W - 16 });
  y = doc.y + 5;

  fillRect(PAD, y, CONTENT_W, 20, C.navy);
  doc.font("Helvetica-Bold").fontSize(9.5).fillColor(c.color)
     .text("★  " + c.lesson, PAD + 8, y + 4, { width: CONTENT_W - 16 });
  y += 28;
});
footer(9, 13, "Slide 9 of 10");

// ─────────────────────────────────────────────────────────
// SLIDE 10 — VIVA CLOSING
// ─────────────────────────────────────────────────────────
addPage();
pageHeader(C.navy, C.teal, "Slide 10 — Viva Closing", "The one-liner to remember and subject role summary", "SLIDE 10");
y = 108;

y = sectionLabel("The One Line to Remember", C.teal, y);
y = infoBox("Master Quote for Viva",
  '"This project uses DBMS to store hospitals and roads, Advanced Java to build the application, Graph Theory to model and solve routing, and Algorithm Design to compare and justify the recommendation strategy."',
  y, C.teal);

y = divider(y);
y = sectionLabel("Each Subject's Role (4 Chips)", C.teal, y);
y = numberedList([
  [1, "BCS401 — Defined the Problem:", "Justified why Dijkstra over brute-force. Compared BFS/DFS/Dijkstra/A* complexities. Proved optimality."],
  [2, "BCS402 — Built the App:", "All OOP classes (CityGraph, DijkstraEngine, RecommendationService, PriorityQueue). React component architecture. localStorage as JDBC."],
  [3, "BCS403 — Designed the DB:", "8-table ER diagram in 3NF. hospital_specializations, hospital_resources, emergency_cases, allocations tables."],
  [4, "BCS405B — Solved the Routing:", "Weighted undirected graph G=(V=13, E=23). Adjacency list. BFS/DFS traversal. Dijkstra + A* shortest path."],
], y, C.teal);

y = divider(y);
y = sectionLabel("Likely Viva Questions & Short Answers", C.amber, y);
const qa = [
  ["Q: What is the time complexity of Dijkstra?", "A: O((V+E) log V) using a binary min-heap priority queue. For our graph: O((13+23) × log 13) ≈ O(133)."],
  ["Q: Why not use A* always?",                    "A: A* needs a consistent heuristic. Our Haversine heuristic is admissible, so A* is correct. But for 13 nodes the speed gain is minimal — Dijkstra is simpler."],
  ["Q: Where is data stored?",                     "A: In localStorage on the browser — no backend server. emergency_history and hospital_beds keys persist across sessions."],
  ["Q: What is 3NF?",                              "A: No partial or transitive dependencies. Every non-key attribute depends directly on the primary key — proven for all 8 tables."],
  ["Q: How does live traffic work?",               "A: Mapbox driving-traffic API returns route geometry + congestion annotations per segment. We color each segment green/amber/red accordingly."],
];
qa.forEach(([q, a]) => {
  doc.font("Helvetica-Bold").fontSize(10).fillColor(C.teal2).text(q, PAD, y, { width: CONTENT_W });
  y = doc.y + 2;
  doc.font("Helvetica").fontSize(10).fillColor(C.body).text(a, PAD + 12, y, { width: CONTENT_W - 12, lineGap: 2 });
  y = doc.y + 8;
});
footer(10, 13, "Slide 10 of 10");

// ─────────────────────────────────────────────────────────
// PAGE 11 — END-TO-END ARCHITECTURE FLOW (Part 1)
// ─────────────────────────────────────────────────────────
addPage();
pageHeader(C.navy, C.amber, "End-to-End Architecture Flow — Part 1", "From app startup to emergency result: complete function call trace", "ARCH");
y = 108;

y = sectionLabel("Phase 1: Application Bootstrap", C.teal, y);
y = codeBlock(
  `Browser loads index.html → <script type="module" src="src/main.jsx">

main.jsx:
  ReactDOM.createRoot(root).render(
    <AppProvider>        ← wraps EVERYTHING in global context
      <App />            ← Router + Navbar + all page Routes
    </AppProvider>
  )

AppProvider mounts (AppContext.jsx):
  graph = useMemo(() => {
    g = new CityGraph()
    LOCATIONS.forEach(loc => g.addNode(loc.id, loc))  // 13 nodes added
    EDGES.forEach(e => g.addEdge(e.from, e.to, e.weight, {
      roadName, trafficMultiplier, id                   // 23 bidirectional edges
    }))
    return g  // adjacency Map: 13 keys, each with neighbor array
  }, [])

  hospitals = useState(() => {                          // init from localStorage
    saved = localStorage.getItem('hospital_beds')
    if (saved): merge saved bed counts into HOSPITALS base data
    else: HOSPITALS.map(h => ({...h}))                  // 6 hospitals
  })

  history = useState(() => {                            // init audit log
    saved = localStorage.getItem('emergency_history')
    return saved ? JSON.parse(saved) : []
  })

  theme = useState(() => localStorage.getItem('theme') || 'dark')
  useEffect([theme] → document.documentElement.setAttribute('data-theme', theme))`,
  y, { color: C.teal, size: 8 }
);

y = sectionLabel("Phase 2: Emergency Form Submission", C.green, y);
y = codeBlock(
  `User navigates to /emergency → EmergencyEntry.jsx mounts
User selects: sourceLocationId (parseInt on change → always number type)
              emergencyType = 'CARDIAC'
              needsIcu = true
              patientName = "Shreya"

handleSubmit(event):
  event.preventDefault()
  if (!patientName): alert(); return
  runRecommendation({
    sourceNodeId: parseInt(9),    ← always number, not string
    emergencyType: 'CARDIAC',
    needsIcu: true,
    patientName: 'Shreya',
    useTraffic: true
  })
  navigate('/results')`,
  y, { color: C.green, size: 8.5 }
);
footer(11, 13, "Architecture Flow — Page 1");

// ─────────────────────────────────────────────────────────
// PAGE 12 — END-TO-END ARCHITECTURE FLOW (Part 2)
// ─────────────────────────────────────────────────────────
addPage();
pageHeader(C.navy, C.amber, "End-to-End Architecture Flow — Part 2", "Dijkstra execution, result storage, and map rendering", "ARCH");
y = 108;

y = sectionLabel("Phase 3: Recommendation Engine (AppContext → RecommendationService → Dijkstra)", C.purple, y);
y = codeBlock(
  `AppContext.runRecommendation(request):
  setEmergencyRequest(request)
  service = new RecommendationService(graph, hospitals)
  result = service.recommend(request)

RecommendationService.recommend({ sourceNodeId:9, emergencyType:'CARDIAC', needsIcu:true }):

  STAGE 1 — Specialization Filter:
    candidates = hospitals.filter(h => h.specializations.includes('CARDIAC'))
    → [BGS(H3), Apollo(H5), Fortis(H6)]  — 3 pass, 3 filtered out

  STAGE 2 — Bed Availability Filter:
    candidates = candidates.filter(h => h.icuBedsAvailable > 0)
    → [BGS(icuAvail=2), Apollo(icuAvail=5), Fortis(icuAvail=4)]  — all 3 pass

  STAGE 3 — Dijkstra per candidate (sourceNode = 9):

    For BGS (nodeId=5):
      pq = PriorityQueue()
      pq.insert(9, 0)                         dist = {9:0, all others:∞}
      iter1: u=9 (dist=0), not visited
        neighbor 8: w=4.8×1.0=4.8   → dist[8]=4.8, prev[8]=9
        neighbor 1: w=3.8×1.0=3.8   → dist[1]=3.8, prev[1]=9
        neighbor 5: w=2.9×1.2=3.48  → dist[5]=3.48, prev[5]=9  ← traffic!
      iter2: extractMin → u=5 (dist=3.48)  ← TARGET FOUND
      path = [9, 5],  cost = 3.48 km

    For Apollo (nodeId=11):   Dijkstra finds path 9→1→3→...→11 ≈ longer
    For Fortis  (nodeId=13):  Dijkstra finds path ≈ longer still

  Sort by cost → [BGS(3.48km), Apollo, Fortis]

  return { primary: BGS, backup: Apollo, filterSteps, explanation }

setEmergencyResult(result)
addToHistory({ ...entry, needsIcu: request.needsIcu })
  → setHistory(prev => [newEntry, ...prev])
  → useEffect([history]) → localStorage.setItem('emergency_history', JSON.stringify(history))`,
  y, { color: C.purple, size: 7.8 }
);
footer(12, 13, "Architecture Flow — Page 2");

// ─────────────────────────────────────────────────────────
// PAGE 13 — END-TO-END ARCHITECTURE FLOW (Part 3)
// ─────────────────────────────────────────────────────────
addPage();
pageHeader(C.navy, C.amber, "End-to-End Architecture Flow — Part 3", "Results display, live traffic map fetch, and ambulance animation", "ARCH");
y = 108;

y = sectionLabel("Phase 4: Results Display (Results.jsx)", C.teal, y);
y = codeBlock(
  `Results.jsx reads: { primary, backup, filterSteps, explanation } = emergencyResult

Renders:
  Patient bar: "Shreya (CARDIAC • ICU) — From Kengeri Bus Terminal"
  Primary card:
    BGS Gleneagles Global Hospital
    ETA = Math.round((3.48 / 50) * 60) = 4 min   ← 50 km/h emergency speed
    Distance: 3.48 km
    Path: Node 9 → Node 5
    Explanation: "Selected BGS because..."
  Backup card: Apollo Hospital (longer path)
  Filter steps timeline: Specialization(3) → Beds(3) → Shortest Path(BGS wins)
  Buttons: "View on Map" → /map    "Visualize Algorithm" → /visualizer`,
  y, { color: C.teal, size: 8.5 }
);

y = sectionLabel("Phase 5: Live Traffic Map Route (MapView.jsx)", C.amber, y);
y = codeBlock(
  `MapView.jsx mounts → useEffect fires:
  map = new mapboxgl.Map({
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [77.5250, 12.9080],  zoom: 12.5
  })

  map.on('load'):
    Draw 23 graph edges as dark-grey GeoJSON LineStrings
    Add distance badge markers at midpoint of each edge

    if emergencyResult.primary: fetchAndDrawRoute(map, [9, 5])

fetchAndDrawRoute(map, path=[9,5]):
  pathCoordsString = "77.4810,12.9115;77.4984,12.8985"

  fetch('https://api.mapbox.com/directions/v5/mapbox/driving-traffic/
         77.4810,12.9115;77.4984,12.8985
         ?geometries=geojson&overview=full&annotations=congestion,duration
         &access_token=pk.eyJ1...')

  Response: {
    routes: [{
      distance: 3250 meters,
      duration: 420 seconds,
      geometry: { type:'LineString', coordinates: [[77.481,12.911], ...] },
      legs: [{ annotation: { congestion: ['low','low','moderate',...] } }]
    }]
  }

  setLiveRouteData({ distance:'3.25km', duration:7min, dominantCongestion:'low' })

  // Per-segment colored route:
  CONGESTION_CONFIG:
    low      → #10b981 (green)
    moderate → #f59e0b (amber)
    heavy    → #ef4444 (red)
    severe   → #dc2626 (dark red)

  addLayer('highlight-route-bg',         glow cyan bg,  opacity 0.18, blur 8)
  addLayer('highlight-route-congestion', per-segment colors via 'line-color': ['get','color'])`,
  y, { color: C.amber, size: 8 }
);

y = sectionLabel("Phase 6: Ambulance Animation (Turf.js + requestAnimationFrame)", C.green, y);
y = codeBlock(
  `runAnimation():
  pathCoords = mapRouteGeometryRef.current.coordinates   // from Mapbox API
  route = turf.feature(LineString(pathCoords))
  lineDistance = turf.length(route, { units: 'kilometers' })  // 3.25 km

  🚑 marker = new mapboxgl.Marker({ element: div('🚑'), rotationAlignment:'map' })
  marker.setLngLat(pathCoords[0]).addTo(map)
  map.fitBounds(allCoords, { padding:80, duration:1000 })

  startTime = null
  requestAnimationFrame(animate)

  animate(timestamp):
    startTime = startTime || timestamp
    progress = min((timestamp - startTime) / 8000, 1)   // 8 second animation
    distance = progress × lineDistance

    point = turf.along(route, distance, { units:'km' })
    marker.setLngLat(point.geometry.coordinates)

    // ★ BEARING FIX: 🚑 emoji faces EAST (90°) by default
    //   Mapbox setRotation(0) = NORTH
    //   So subtract 90° to align emoji front with travel direction
    prevPoint = turf.along(route, max(0, distance - 0.025))
    bearing = turf.bearing(prevPoint, point)
    marker.setRotation(bearing - 90)

    if progress < 1: requestAnimationFrame(animate)
    else: setIsAnimating(false)`,
  y, { color: C.green, size: 8 }
);
footer(13, 13, "Architecture Flow — Page 3");

// ─────────────────────────────────────────────────────────
// CLOSE
// ─────────────────────────────────────────────────────────
doc.end();
console.log(`✅ PDF saved → ${OUT}`);
