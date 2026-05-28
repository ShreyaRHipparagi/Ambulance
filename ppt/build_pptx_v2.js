/**
 * ============================================================
 *  Smart Ambulance Routing — Full PPT Builder v2
 *  10 Slides Total (9 original + 1 new Architecture slide)
 * ============================================================
 *
 *  SLIDE MAP
 *  ---------
 *  1  Title Slide            — Project name, subject badges
 *  2  What This Project Does — Problem vs Solution
 *  3  BCS401 Algorithm Design — 4 concept cards (grid)
 *  4  BCS402 Advanced Java   — 4 horizontal rows
 *  5  BCS403 DBMS            — Left cards + right table list
 *  6  BCS405B Graph Theory   — 5 concept cards (2-row)
 *  7  Architecture           — ★ NEW: React app architecture diagram
 *  8  How 4 Subjects Connect — 4-column vertical flow
 *  9  3 Demo Cases           — Numbered scenario rows
 * 10  Viva Closing           — Quote box + 4 chips
 *
 *  COLOR TOKENS
 *  ------------
 *  DARK_BG   = #0B1D3A  deep navy (slide background)
 *  MID_BG    = #112B52  medium navy (card backgrounds)
 *  CARD_BG   = #FFFFFF  white card surface
 *  TEAL      = #00B4D8  main accent
 *  TEAL2     = #0077B6  deeper teal for headers
 *  WHITE     = #FFFFFF
 *  LIGHT_TXT = #E0F0FF  light text on dark backgrounds
 *  BODY_TXT  = #1E293B  dark text on white cards
 *  MUTED     = #64748B  caption / secondary text
 *
 *  SUBJECT ACCENT COLORS
 *  ---------------------
 *  BCS401  = #F59E0B  amber
 *  BCS402  = #10B981  emerald
 *  BCS403  = #8B5CF6  violet
 *  BCS405B = #00B4D8  teal
 * ============================================================
 */

const pptxgen = require("pptxgenjs");

// ─── THEME TOKENS ──────────────────────────────────────────
const DARK_BG   = "0B1D3A";
const MID_BG    = "112B52";
const CARD_BG   = "FFFFFF";
const TEAL      = "00B4D8";
const TEAL2     = "0077B6";
const WHITE     = "FFFFFF";
const LIGHT_TXT = "E0F0FF";
const BODY_TXT  = "1E293B";
const MUTED     = "64748B";

const SUBJ = {
  BCS401:  "F59E0B",
  BCS402:  "10B981",
  BCS403:  "8B5CF6",
  BCS405B: "00B4D8",
};

// Reusable shadow factory
const sh = () => ({ type:"outer", blur:8, offset:3, angle:135, color:"000000", opacity:0.12 });

// ─── HELPER: left-accent card ──────────────────────────────
// Draws a white card with a colored left border and adds title + body text.
function accentCard(s, { x, y, w, h, accentColor, title, body, titleSize=12.5, bodySize=10.5 }) {
  s.addShape("rect", { x, y, w, h, fill:{ color: CARD_BG }, shadow: sh() });
  s.addShape("rect", { x, y, w:0.07, h, fill:{ color: accentColor } });
  s.addText(title, {
    x: x+0.15, y: y+0.08, w: w-0.22, h: 0.3,
    fontSize: titleSize, bold: true, color: BODY_TXT, fontFace:"Calibri", margin:0
  });
  s.addText(body, {
    x: x+0.15, y: y+0.42, w: w-0.22, h: h-0.55,
    fontSize: bodySize, color: MUTED, fontFace:"Calibri", margin:0
  });
}

// ─── HELPER: filled header card (dark with coloured top) ───
function darkCard(s, { x, y, w, h, accentColor, title, points, pointSize=10 }) {
  s.addShape("rect", { x, y, w, h, fill:{ color: MID_BG }, shadow: sh() });
  s.addShape("rect", { x, y, w, h:0.38, fill:{ color: accentColor } });
  s.addText(title, {
    x: x+0.1, y: y+0.05, w: w-0.2, h: 0.3,
    fontSize: 12.5, bold:true, color: WHITE, fontFace:"Calibri", margin:0
  });
  points.forEach((pt, i) => {
    s.addShape("oval", { x: x+0.12, y: y+0.53+i*0.44, w:0.12, h:0.12, fill:{ color: accentColor } });
    s.addText(pt, {
      x: x+0.3, y: y+0.47+i*0.44, w: w-0.4, h: 0.37,
      fontSize: pointSize, color: LIGHT_TXT, fontFace:"Calibri", margin:0
    });
  });
}

// ─── HELPER: slide header band ─────────────────────────────
function slideHeader(s, { bgColor, title, subtitle, iconChar }) {
  s.addShape("rect", { x:0, y:0, w:10, h:1.15, fill:{ color: bgColor } });
  s.addShape("rect", { x:0, y:0, w:0.18, h:5.625, fill:{ color: TEAL } });
  s.addText(title, {
    x:0.35, y:0.06, w:8.8, h:0.55, fontSize:22, bold:true,
    color: WHITE, fontFace:"Calibri", margin:0
  });
  s.addText(subtitle, {
    x:0.35, y:0.64, w:8.8, h:0.38, fontSize:13, color: LIGHT_TXT,
    fontFace:"Calibri", italic:true, margin:0
  });
  if (iconChar) {
    s.addText(iconChar, {
      x:9.1, y:0.22, w:0.7, h:0.7, fontSize:28,
      align:"center", fontFace:"Segoe UI Emoji", margin:0
    });
  }
}

// ──────────────────────────────────────────────────────────────
async function build() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.title  = "Smart Ambulance Routing & Hospital Allocation System";

  // ===========================================================
  // SLIDE 1 — TITLE
  // ===========================================================
  // Layout: dark navy background with a teal left stripe.
  // Top-right: ambulance icon inside a large circle.
  // Centre: large project name + teal subtitle.
  // Below: italic tagline describing the 4-subject combo.
  // Bottom row: 4 coloured badge pills, one per subject.
  // Footer: "4th Semester Project · Viva-Ready Explanation"
  // ===========================================================
  {
    const s = pres.addSlide();
    s.background = { color: DARK_BG };

    // Left teal stripe — visual anchor that repeats on every dark slide
    s.addShape("rect", { x:0, y:0, w:0.18, h:5.625, fill:{ color: TEAL } });

    // Decorative circle top-right with ambulance emoji
    s.addShape("oval",  { x:7.5, y:-0.5, w:3.5, h:3.5,
      fill:{ color: MID_BG }, line:{ color: TEAL, width:2 }
    });
    s.addText("🚑", { x:8.35, y:0.3, w:1.6, h:1.6, fontSize:52,
      align:"center", fontFace:"Segoe UI Emoji", margin:0
    });

    // Main title — two lines for visual hierarchy
    s.addText("Smart Ambulance Routing", {
      x:0.5, y:1.2, w:8.5, h:0.9,
      fontSize:36, bold:true, color:WHITE, fontFace:"Calibri", align:"left", margin:0
    });
    s.addText("& Hospital Allocation System", {
      x:0.5, y:2.05, w:8.5, h:0.7,
      fontSize:28, color:TEAL, fontFace:"Calibri", align:"left", margin:0
    });

    // Tagline
    s.addText("A React + Java-inspired project combining Graph Theory · DBMS · Advanced Java · Algorithm Design", {
      x:0.5, y:2.9, w:8.8, h:0.4,
      fontSize:13, color:LIGHT_TXT, fontFace:"Calibri", align:"left", italic:true, margin:0
    });

    // Subject badge pills
    [
      {label:"BCS401  Algorithm Design", c: SUBJ.BCS401},
      {label:"BCS402  Advanced Java",    c: SUBJ.BCS402},
      {label:"BCS403  DBMS",             c: SUBJ.BCS403},
      {label:"BCS405B  Graph Theory",    c: SUBJ.BCS405B},
    ].forEach((b, i) => {
      s.addShape("roundRect", { x:0.5+i*2.3, y:3.7, w:2.12, h:0.42,
        fill:{ color:b.c }, rectRadius:0.05
      });
      s.addText(b.label, {
        x:0.5+i*2.3, y:3.7, w:2.12, h:0.42,
        fontSize:9.5, bold:true, color:WHITE, fontFace:"Calibri",
        align:"center", valign:"middle", margin:0
      });
    });

    // Footer
    s.addText("4th Semester Project  ·  Viva-Ready Explanation  ·  South Bangalore City Map", {
      x:0.5, y:5.05, w:9, h:0.35,
      fontSize:11, color:MUTED, fontFace:"Calibri", align:"left", italic:true, margin:0
    });
  }

  // ===========================================================
  // SLIDE 2 — WHAT THIS PROJECT DOES
  // ===========================================================
  // Layout: light background with dark header band.
  // Split into two tall cards side by side:
  //   LEFT (dark navy)  — "The Problem" with 3 bullet points
  //   RIGHT (white)     — "Our Solution" with 4 check-mark rows
  // Each solution row has a bold label + a one-line description.
  // ===========================================================
  {
    const s = pres.addSlide();
    s.background = { color:"F8FAFF" };

    // Header band
    s.addShape("rect", { x:0, y:0, w:10, h:1.1, fill:{ color: DARK_BG } });
    s.addText("What This Project Does", {
      x:0.4, y:0.1, w:9, h:0.9, fontSize:26, bold:true,
      color:WHITE, fontFace:"Calibri", valign:"middle", margin:0
    });

    // LEFT card — The Problem
    s.addShape("rect", { x:0.35, y:1.3, w:4.5, h:3.7, fill:{ color:MID_BG }, shadow:sh() });
    s.addText("The Problem", {
      x:0.35, y:1.3, w:4.5, h:0.55,
      fontSize:15, bold:true, color:TEAL, fontFace:"Calibri",
      align:"center", valign:"middle", margin:0
    });
    [
      "In real emergencies, the nearest hospital is chosen — but it may not have ICU, beds, or the right specialization.",
      "This leads to delays, wrong allocation, and wasted time.",
      "The system should find the BEST hospital — not just the closest one."
    ].forEach((p, i) => {
      s.addShape("oval",  { x:0.55, y:2.08+i*0.92, w:0.2, h:0.2, fill:{ color:TEAL } });
      s.addText(p, {
        x:0.84, y:2.02+i*0.92, w:3.82, h:0.5,
        fontSize:12, color:LIGHT_TXT, fontFace:"Calibri", margin:0
      });
    });

    // RIGHT card — Our Solution
    s.addShape("rect", { x:5.2, y:1.3, w:4.45, h:3.7, fill:{ color:CARD_BG }, shadow:sh() });
    s.addShape("rect", { x:5.2, y:1.3, w:4.45, h:0.55, fill:{ color:TEAL2 } });
    s.addText("Our Solution", {
      x:5.2, y:1.3, w:4.45, h:0.55,
      fontSize:15, bold:true, color:WHITE, fontFace:"Calibri",
      align:"center", valign:"middle", margin:0
    });
    [
      ["Match hospital",  "Check if it handles the emergency type (cardiac, trauma...)"],
      ["Check resources", "Confirm ICU or general beds are available"],
      ["Find best route", "Graph algorithms compute the shortest road path"],
      ["Recommend",       "Pick the best hospital + a backup option for safety"],
    ].forEach(([title, desc], i) => {
      s.addText("✔", { x:5.38, y:2.04+i*0.78, w:0.3, h:0.3,
        fontSize:14, color:TEAL2, fontFace:"Calibri", margin:0
      });
      s.addText(title, {
        x:5.75, y:2.0+i*0.78, w:3.7, h:0.28,
        fontSize:12, bold:true, color:TEAL2, fontFace:"Calibri", margin:0
      });
      s.addText(desc, {
        x:5.75, y:2.26+i*0.78, w:3.7, h:0.3,
        fontSize:10.5, color:MUTED, fontFace:"Calibri", margin:0
      });
    });
  }

  // ===========================================================
  // SLIDE 3 — BCS401: ALGORITHM DESIGN & ANALYSIS
  // ===========================================================
  // Layout: full dark navy background, amber left stripe + header.
  // 2 × 2 grid of dark cards, each covering one BCS401 concept:
  //   Card 1 (TL): Problem Definition & Requirements Analysis
  //   Card 2 (TR): Brute-Force vs Smart Search comparison
  //   Card 3 (BL): Why Dijkstra? (justification)
  //   Card 4 (BR): Time Complexity (BFS/DFS vs Dijkstra)
  // Each card has an amber top bar, title, and 3 bullet dots.
  // ===========================================================
  {
    const s = pres.addSlide();
    s.background = { color: DARK_BG };
    const C = SUBJ.BCS401;
    s.addShape("rect", { x:0, y:0, w:0.18, h:5.625, fill:{ color:C } });
    s.addShape("rect", { x:0.18, y:0, w:9.82, h:1.15, fill:{ color:MID_BG } });
    s.addText("BCS401  ·  Algorithm Design & Analysis", {
      x:0.35, y:0.06, w:8.8, h:0.55,
      fontSize:22, bold:true, color:C, fontFace:"Calibri", margin:0
    });
    s.addText("Concepts used in this project — explained for viva", {
      x:0.35, y:0.63, w:8.8, h:0.38,
      fontSize:13, color:LIGHT_TXT, fontFace:"Calibri", italic:true, margin:0
    });
    s.addText("📈", { x:9.1, y:0.22, w:0.7, h:0.7, fontSize:28, align:"center",
      fontFace:"Segoe UI Emoji", margin:0
    });

    const cards = [
      { title:"Problem Definition",
        points:["Nearest hospital is NOT always best — formally defined the problem",
                "Analysed factors: emergency type, ICU, beds, road distance",
                "This is called Requirements Analysis in algorithm design"] },
      { title:"Brute-Force vs Smart Search",
        points:["Brute-force: check every hospital one by one — works, but slow",
                "Smart: filter hospitals first, then find best route — more efficient",
                "Comparison shows you understand algorithm trade-offs"] },
      { title:"Why Dijkstra? (Justification)",
        points:["Roads have different distances (weights) — need a weighted-path algorithm",
                "Dijkstra always finds the shortest path in any weighted graph",
                "BFS = unweighted only; Dijkstra = weighted (like real roads)"] },
      { title:"Time Complexity",
        points:["BFS / DFS: O(V + E) — visits every node and edge exactly once",
                "Dijkstra: O((V + E) log V) — uses a priority queue for greedy picks",
                "A* Search: O(E) best case with a perfect heuristic function"] },
    ];
    [[0.35,1.3],[5.15,1.3],[0.35,3.3],[5.15,3.3]].forEach(([x,y], i) => {
      darkCard(s, { x, y, w:4.55, h:1.88, accentColor:C,
        title: cards[i].title, points: cards[i].points
      });
    });
  }

  // ===========================================================
  // SLIDE 4 — BCS402: ADVANCED JAVA
  // ===========================================================
  // Layout: light background, dark forest-green header band.
  // Four full-width horizontal rows — one concept per row.
  // Each row = white card with emerald left border.
  //   Left  section: bold title + descriptive body text
  //   Right section: emerald pill badge showing key Java terms
  // Rows: OOP · Java Collections · Swing UI · JDBC
  // ===========================================================
  {
    const s = pres.addSlide();
    s.background = { color:"F8FAFF" };
    const C = SUBJ.BCS402;
    s.addShape("rect", { x:0, y:0, w:10, h:1.15, fill:{ color:"0F2D1E" } });
    s.addShape("rect", { x:0, y:0, w:0.18, h:5.625, fill:{ color:C } });
    s.addText("BCS402  ·  Advanced Java", {
      x:0.35, y:0.06, w:8.8, h:0.55,
      fontSize:22, bold:true, color:C, fontFace:"Calibri", margin:0
    });
    s.addText("Concepts used in this project — explained for viva", {
      x:0.35, y:0.63, w:8.8, h:0.38,
      fontSize:13, color:LIGHT_TXT, fontFace:"Calibri", italic:true, margin:0
    });
    s.addText("💻", { x:9.1, y:0.22, w:0.7, h:0.7, fontSize:28, align:"center",
      fontFace:"Segoe UI Emoji", margin:0
    });

    const rows = [
      { title:"Object-Oriented Programming (OOP)",
        desc:"Built with classes and packages — Patient, Hospital, CityGraph, each with one clear job. This is encapsulation and separation of concerns.",
        tag:"Classes · Packages · Encapsulation" },
      { title:"Java Collections Framework",
        desc:"Adjacency list uses HashMap + ArrayList. Dijkstra uses PriorityQueue. These are real Java Collections solving a real algorithmic problem.",
        tag:"HashMap · ArrayList · PriorityQueue" },
      { title:"Swing UI (Graphical User Interface)",
        desc:"MainFrame is the Swing window. Input fields, dropdowns for emergency type and location, results panel. This is event-driven GUI programming.",
        tag:"JFrame · JPanel · ActionListener · Events" },
      { title:"JDBC — Database Connector",
        desc:"JDBC connector class lets the app talk to MySQL. SampleDataFactory provides test data now. JDBC replaces it in production.",
        tag:"JDBC · PreparedStatement · ResultSet" },
    ];

    rows.forEach((row, i) => {
      const y = 1.3 + i*1.02;
      s.addShape("rect", { x:0.35, y, w:9.3, h:0.9, fill:{ color:CARD_BG }, shadow:sh() });
      s.addShape("rect", { x:0.35, y, w:0.07, h:0.9, fill:{ color:C } });
      s.addText(row.title, {
        x:0.52, y:y+0.08, w:6.0, h:0.3,
        fontSize:13, bold:true, color:"0F2D1E", fontFace:"Calibri", margin:0
      });
      s.addText(row.desc, {
        x:0.52, y:y+0.41, w:5.95, h:0.42,
        fontSize:10.5, color:BODY_TXT, fontFace:"Calibri", margin:0
      });
      // Right pill badge
      s.addShape("roundRect", { x:6.7, y:y+0.18, w:2.8, h:0.5, fill:{ color:C }, rectRadius:0.06 });
      s.addText(row.tag, {
        x:6.7, y:y+0.18, w:2.8, h:0.5,
        fontSize:9, bold:true, color:WHITE, fontFace:"Calibri",
        align:"center", valign:"middle", margin:0
      });
    });
  }

  // ===========================================================
  // SLIDE 5 — BCS403: DATABASE MANAGEMENT SYSTEM
  // ===========================================================
  // Layout: dark navy background, violet left stripe + header.
  // Split into two columns:
  //   LEFT (3 stacked dark cards): ER Diagram, Normalization, SQL Queries
  //   RIGHT (1 tall dark card):    All 8 database tables as pill + description rows
  // ===========================================================
  {
    const s = pres.addSlide();
    s.background = { color: DARK_BG };
    const C = SUBJ.BCS403;
    s.addShape("rect", { x:0, y:0, w:0.18, h:5.625, fill:{ color:C } });
    s.addShape("rect", { x:0.18, y:0, w:9.82, h:1.15, fill:{ color:"1A0A35" } });
    s.addText("BCS403  ·  Database Management System (DBMS)", {
      x:0.35, y:0.06, w:8.8, h:0.55,
      fontSize:22, bold:true, color:C, fontFace:"Calibri", margin:0
    });
    s.addText("Concepts used in this project — explained for viva", {
      x:0.35, y:0.63, w:8.8, h:0.38,
      fontSize:13, color:LIGHT_TXT, fontFace:"Calibri", italic:true, margin:0
    });
    s.addText("🗄", { x:9.1, y:0.22, w:0.7, h:0.7, fontSize:28, align:"center",
      fontFace:"Segoe UI Emoji", margin:0
    });

    // LEFT — 3 stacked concept cards
    [
      { title:"ER Diagram",
        desc:"Drew an Entity-Relationship diagram: Patient, Hospital, EmergencyCase connected with PK/FK lines. This is the foundation of any database design." },
      { title:"Relational Schema & Normalization",
        desc:"Converted ER to tables. Normalized to 3NF — removed duplicate data, ensured each table has exactly one responsibility." },
      { title:"SQL Queries",
        desc:"SELECT hospitals by specialization, UPDATE bed count after allocation, INSERT a new emergency case. Shows real DB usage during demo." },
    ].forEach((item, i) => {
      const y = 1.35 + i*1.38;
      s.addShape("rect", { x:0.35, y, w:4.5, h:1.22, fill:{ color:"1A0A35" }, shadow:sh() });
      s.addShape("rect", { x:0.35, y, w:4.5, h:0.4, fill:{ color:C } });
      s.addText(item.title, {
        x:0.45, y:y+0.06, w:4.3, h:0.3,
        fontSize:13, bold:true, color:WHITE, fontFace:"Calibri", margin:0
      });
      s.addText(item.desc, {
        x:0.45, y:y+0.46, w:4.3, h:0.68,
        fontSize:10.5, color:LIGHT_TXT, fontFace:"Calibri", margin:0
      });
    });

    // RIGHT — all 8 tables
    s.addShape("rect", { x:5.2, y:1.35, w:4.45, h:3.93, fill:{ color:"1A0A35" }, shadow:sh() });
    s.addShape("rect", { x:5.2, y:1.35, w:4.45, h:0.4, fill:{ color:C } });
    s.addText("Database Tables Designed", {
      x:5.3, y:1.38, w:4.2, h:0.35,
      fontSize:13, bold:true, color:WHITE, fontFace:"Calibri", margin:0
    });
    [
      ["patients",                  "Patient name and emergency details"],
      ["emergency_cases",           "Records each ambulance call"],
      ["hospitals",                 "Hospital info and location node"],
      ["hospital_specializations",  "What each hospital can treat"],
      ["hospital_resources",        "Bed and ICU availability counts"],
      ["location_nodes",            "Intersections on the city map"],
      ["road_edges",                "Roads with distance & traffic data"],
      ["allocations",               "Which hospital was assigned, and route cost"],
    ].forEach(([tbl, desc], i) => {
      const ty = 1.88 + i*0.41;
      s.addShape("roundRect", { x:5.35, y:ty, w:1.5, h:0.28, fill:{ color:C }, rectRadius:0.04 });
      s.addText(tbl, {
        x:5.35, y:ty, w:1.5, h:0.28,
        fontSize:9.5, bold:true, color:WHITE, fontFace:"Calibri",
        align:"center", valign:"middle", margin:0
      });
      s.addText(desc, {
        x:6.95, y:ty, w:2.55, h:0.28,
        fontSize:9.5, color:LIGHT_TXT, fontFace:"Calibri", valign:"middle", margin:0
      });
    });
  }

  // ===========================================================
  // SLIDE 6 — BCS405B: GRAPH THEORY
  // ===========================================================
  // Layout: light background, teal header band.
  // Two rows of cards:
  //   TOP ROW  (3 equal cards): Weighted Graph · Adjacency List · BFS
  //   BOTTOM ROW (2 wider cards): DFS · Dijkstra's Algorithm
  // Dijkstra card is wider to hold more detail (it's the core algorithm).
  // ===========================================================
  {
    const s = pres.addSlide();
    s.background = { color:"F0FBFF" };
    const C = SUBJ.BCS405B;
    s.addShape("rect", { x:0, y:0, w:10, h:1.15, fill:{ color:"062A3A" } });
    s.addShape("rect", { x:0, y:0, w:0.18, h:5.625, fill:{ color:C } });
    s.addText("BCS405B  ·  Graph Theory", {
      x:0.35, y:0.06, w:8.8, h:0.55,
      fontSize:22, bold:true, color:C, fontFace:"Calibri", margin:0
    });
    s.addText("Concepts used in this project — explained for viva", {
      x:0.35, y:0.63, w:8.8, h:0.38,
      fontSize:13, color:LIGHT_TXT, fontFace:"Calibri", italic:true, margin:0
    });
    s.addText("🕸", { x:9.1, y:0.22, w:0.7, h:0.7, fontSize:28, align:"center",
      fontFace:"Segoe UI Emoji", margin:0
    });

    // Top row — 3 equal cards
    [
      { title:"Weighted Graph (City Model)",
        body:"City roads are a graph. Each intersection = Node. Each road = Edge. Weight = distance in km. Exactly how GPS map apps work internally." },
      { title:"Adjacency List",
        body:"Graph stored as HashMap<NodeId, List<RoadEdge>> in Java. Each node maps to its connected roads. Memory-efficient and fast for sparse networks." },
      { title:"BFS — Breadth First Search",
        body:"Explores layer by layer (all 1-hop nodes, then 2-hop…). Used to check: 'Is this hospital reachable from the patient location?' YES/NO answer only." },
    ].forEach((card, i) => {
      const x = 0.35 + i*3.2;
      accentCard(s, { x, y:1.3, w:2.95, h:1.88, accentColor:C,
        title:card.title, body:card.body
      });
    });

    // Bottom row — 2 wider cards
    [
      { w:4.55, title:"DFS — Depth First Search",
        body:"Follows one path as deep as possible before backtracking. Used to list ALL hospitals reachable from a starting location. Good for connectivity analysis and understanding the full network." },
      { w:4.75, title:"Dijkstra's Algorithm — Shortest Path (Core Algorithm)",
        body:"The heart of this project. Starts at patient location, expands using a Priority Queue (always picks the lowest-cost next road), and finds the shortest route to every valid hospital. The one with the lowest total cost wins." },
    ].forEach((card, i) => {
      const x = 0.35 + i*4.85;
      accentCard(s, { x, y:3.35, w:card.w, h:1.88, accentColor:TEAL2,
        title:card.title, body:card.body
      });
    });
  }

  // ===========================================================
  // SLIDE 7 ★ — SYSTEM ARCHITECTURE  (IMAGE + LAYER DIAGRAM)
  // ===========================================================
  // Layout: dark navy background, teal left stripe + header.
  //
  // LEFT HALF  — Architecture diagram image (generated PNG)
  // RIGHT HALF — 4 horizontal tier boxes (UI → Context → Engine → Data)
  //              + Request Lifecycle numbered steps
  //              + Tech stack bar at bottom
  // ===========================================================
  {
    const s = pres.addSlide();
    s.background = { color: DARK_BG };

    // Header band
    s.addShape("rect", { x:0, y:0, w:10, h:1.05, fill:{ color:MID_BG } });
    s.addShape("rect", { x:0, y:0, w:0.18, h:5.625, fill:{ color:TEAL } });
    s.addText("System Architecture", {
      x:0.35, y:0.07, w:7.5, h:0.5,
      fontSize:22, bold:true, color:WHITE, fontFace:"Calibri", margin:0
    });
    s.addText("Component interaction & data flow — from patient form to ambulance animation", {
      x:0.35, y:0.59, w:8.5, h:0.34,
      fontSize:11.5, color:LIGHT_TXT, fontFace:"Calibri", italic:true, margin:0
    });
    s.addText("🏗", { x:9.1, y:0.15, w:0.7, h:0.7, fontSize:26,
      align:"center", fontFace:"Segoe UI Emoji", margin:0
    });

    // ── LEFT: Architecture diagram image ─────────────────
    s.addImage({
      path: "/Users/abhi/Desktop/insta/AMBULANCE/architecture_diagram.png",
      x: 0.25, y: 1.12, w: 4.85, h: 4.32,
    });

    // ── RIGHT: 4-tier layer diagram ───────────────────────
    const RX = 5.35;
    const RW = 4.4;

    const tiers = [
      {
        label: "UI LAYER",
        color: "1C3A5E",
        borderColor: TEAL,
        y: 1.12,
        h: 0.7,
        items: ["Dashboard", "EmergencyEntry", "MapView", "Visualizer"],
      },
      {
        label: "CONTEXT",
        color: "0D3320",
        borderColor: SUBJ.BCS402,
        y: 1.98,
        h: 0.7,
        items: ["AppContext.jsx", "runRecommendation()", "localStorage"],
      },
      {
        label: "ENGINES",
        color: "062A3A",
        borderColor: SUBJ.BCS405B,
        y: 2.84,
        h: 0.7,
        items: ["CityGraph", "Dijkstra", "A*", "BFS/DFS"],
      },
      {
        label: "DATA",
        color: "1A0A35",
        borderColor: SUBJ.BCS403,
        y: 3.7,
        h: 0.6,
        items: ["cityData.js  (13 nodes · 23 edges · 6 hospitals)"],
      },
    ];

    tiers.forEach((tier) => {
      s.addShape("rect", {
        x: RX, y: tier.y, w: RW, h: tier.h,
        fill:{ color: tier.color },
        line:{ color: tier.borderColor, width: 1.5 },
      });
      // Colored label tab on left
      s.addShape("rect", { x: RX, y: tier.y, w: 0.88, h: tier.h, fill:{ color: tier.borderColor } });
      s.addText(tier.label, {
        x: RX+0.02, y: tier.y, w: 0.84, h: tier.h,
        fontSize: 7.5, bold:true, color:WHITE, fontFace:"Calibri",
        align:"center", valign:"middle", margin:0,
      });
      // Item chips
      const avail = RW - 1.0;
      const chipW = avail / tier.items.length - 0.08;
      tier.items.forEach((item, idx) => {
        const ix = RX + 0.96 + idx * (chipW + 0.08);
        s.addShape("roundRect", {
          x: ix, y: tier.y + 0.12, w: chipW, h: tier.h - 0.24,
          fill:{ color: DARK_BG }, rectRadius: 0.04,
        });
        s.addText(item, {
          x: ix+0.03, y: tier.y+0.12, w: chipW-0.06, h: tier.h-0.24,
          fontSize: 7.5, color: LIGHT_TXT, fontFace:"Calibri",
          align:"center", valign:"middle", margin:0,
        });
      });
      // Down arrow connector (except after last tier)
      if (tier.y < 3.5) {
        const ay = tier.y + tier.h;
        s.addText("▼", {
          x: RX + RW/2 - 0.15, y: ay, w: 0.3, h: 0.14,
          fontSize: 8, color: TEAL, fontFace:"Calibri", align:"center", margin:0
        });
      }
    });

    // ── Lifecycle steps panel ─────────────────────────────
    s.addShape("rect", { x: RX, y: 4.42, w: RW, h: 0.88, fill:{ color: MID_BG }, shadow:sh() });
    s.addShape("rect", { x: RX, y: 4.42, w: RW, h: 0.3, fill:{ color: TEAL2 } });
    s.addText("Request Lifecycle", {
      x: RX+0.1, y: 4.43, w: RW-0.2, h: 0.28,
      fontSize:10.5, bold:true, color:WHITE, fontFace:"Calibri", margin:0
    });
    const lifecycleSteps = [
      "Form Submit → AppContext.runRecommendation()",
      "RecommendationService: filter type → beds → Dijkstra per hospital",
      "Sorted results → MapView fetches Mapbox driving-traffic route → Animation",
    ];
    lifecycleSteps.forEach((step, i) => {
      s.addShape("oval", { x: RX+0.1, y: 4.78+i*0.17, w:0.15, h:0.15, fill:{ color:TEAL } });
      s.addText(step, {
        x: RX+0.32, y: 4.76+i*0.17, w: RW-0.4, h: 0.18,
        fontSize: 8, color: LIGHT_TXT, fontFace:"Calibri", margin:0
      });
    });

    // Tech stack footnote
    s.addShape("rect", { x: RX, y: 5.34, w: RW, h: 0.24, fill:{ color:"062A3A" } });
    s.addText("React 18  ·  Mapbox GL JS  ·  Turf.js  ·  Framer Motion  ·  Vite 5", {
      x: RX+0.08, y: 5.34, w: RW-0.15, h: 0.24,
      fontSize: 7.5, color: TEAL, fontFace:"Calibri",
      align:"center", valign:"middle", margin:0, bold:true
    });
  }

  // ===========================================================
  // SLIDE 8 — HOW ALL 4 SUBJECTS CONNECT
  // ===========================================================
  // Layout: dark navy background.
  // Four equal-width tall columns, one per subject.
  // Each column has a coloured header, an emoji icon, and a
  // plain-English description of its role.
  // Bottom bar: one-line summary connecting all four.
  // ===========================================================
  {
    const s = pres.addSlide();
    s.background = { color: DARK_BG };

    s.addShape("rect", { x:0, y:0, w:10, h:1.1, fill:{ color:MID_BG } });
    s.addText("How All 4 Subjects Work Together", {
      x:0.4, y:0.1, w:9.2, h:0.9,
      fontSize:24, bold:true, color:WHITE, fontFace:"Calibri", valign:"middle", margin:0
    });

    [
      { code:"BCS401", name:"Algorithm Design", color:SUBJ.BCS401,
        icon:"📊", role:"Defines the PROBLEM and justifies WHY Dijkstra is used over brute-force search" },
      { code:"BCS403", name:"DBMS",             color:SUBJ.BCS403,
        icon:"🗄",  role:"Stores hospital data, roads, patients, and allocation history in a normalized schema" },
      { code:"BCS405B", name:"Graph Theory",    color:SUBJ.BCS405B,
        icon:"🕸",  role:"Models roads as a weighted graph. Runs BFS/DFS/Dijkstra to find the best route" },
      { code:"BCS402", name:"Advanced Java",    color:SUBJ.BCS402,
        icon:"💻",  role:"Builds the full application — OOP classes, Swing UI, Collections, JDBC connector" },
    ].forEach((subj, i) => {
      const x = 0.3 + i * 2.42;
      s.addShape("rect", { x, y:1.25, w:2.2, h:3.9, fill:{ color:MID_BG }, shadow:sh() });
      s.addShape("rect", { x, y:1.25, w:2.2, h:0.6, fill:{ color:subj.color } });
      s.addText(subj.code, {
        x, y:1.27, w:2.2, h:0.3,
        fontSize:13, bold:true, color:WHITE, fontFace:"Calibri", align:"center", margin:0
      });
      s.addText(subj.name, {
        x, y:1.55, w:2.2, h:0.28,
        fontSize:10, color:WHITE, fontFace:"Calibri", align:"center", margin:0
      });
      s.addText(subj.icon, {
        x: x+0.75, y:2.05, w:0.65, h:0.65,
        fontSize:28, fontFace:"Segoe UI Emoji", align:"center", margin:0
      });
      s.addText(subj.role, {
        x: x+0.12, y:2.85, w:1.96, h:2.2,
        fontSize:10.5, color:LIGHT_TXT, fontFace:"Calibri", align:"center", margin:0
      });
    });

    // Bottom summary bar
    s.addShape("rect", { x:0.3, y:5.15, w:9.4, h:0.3, fill:{ color:"193050" } });
    s.addText(
      "Algorithm Design defines the WHY  ·  Graph Theory does the routing  ·  DBMS stores everything  ·  Advanced Java builds it all",
      { x:0.3, y:5.15, w:9.4, h:0.3, fontSize:10, color:TEAL,
        fontFace:"Calibri", align:"center", valign:"middle", margin:0, bold:true }
    );
  }

  // ===========================================================
  // SLIDE 8 — HOW ALL 4 SUBJECTS CONNECT  [CLASS PROJECT STYLE]
  // ===========================================================
  // Exact match to class project PPT slide 7 layout:
  //   bg=#0B1D3A, header rect #112B52 full-width h=1.1
  //   4 columns x=0.3/2.72/5.14/7.56  w=2.2  y=1.25  h=3.9
  //   each: MID_BG card, colored top h=0.6, code bold 13pt,
  //   name 10pt, icon at x+0.75 y=2.0, role text at x+0.12 y=2.8
  //   vertical connector lines between cols (line shape)
  //   bottom bar #193050 y=5.15 h=0.3 with teal centered text
  // ===========================================================
  {
    const s = pres.addSlide();
    s.background = { color: DARK_BG };

    // Header band — exact match class project slide 7
    s.addShape("rect", { x:0, y:0, w:10, h:1.1, fill:{ color:MID_BG } });
    s.addText("How All 4 Subjects Work Together", {
      x:0.4, y:0.1, w:9.2, h:0.9,
      fontSize:24, bold:true, color:WHITE,
      fontFace:"Calibri", valign:"middle", margin:0
    });

    // 4 subject columns — exact positions from class project PPT
    const cols = [
      { x:0.30, code:"BCS401", name:"Algorithm Design", color:SUBJ.BCS401,
        icon:"📊",
        role:"Defines the PROBLEM and justifies WHY Dijkstra is used over brute-force" },
      { x:2.72, code:"BCS403", name:"DBMS",             color:SUBJ.BCS403,
        icon:"🗄",
        role:"Stores hospital data, roads, patients, and allocation history in a normalized schema" },
      { x:5.14, code:"BCS405B", name:"Graph Theory",    color:SUBJ.BCS405B,
        icon:"🕸",
        role:"Models roads as a weighted graph. Runs BFS/DFS/Dijkstra to find the best route" },
      { x:7.56, code:"BCS402", name:"Advanced Java",    color:SUBJ.BCS402,
        icon:"💻",
        role:"Builds the full application — OOP classes, Swing UI, Collections, JDBC connector" },
    ];

    cols.forEach((col, i) => {
      // Card body — #112B52, w=2.2, h=3.9, y=1.25
      s.addShape("rect", { x:col.x, y:1.25, w:2.2, h:3.9, fill:{ color:MID_BG } });
      // Colored top bar — h=0.6
      s.addShape("rect", { x:col.x, y:1.25, w:2.2, h:0.6, fill:{ color:col.color } });
      // Subject code — 13pt bold white centered
      s.addText(col.code, {
        x:col.x, y:1.27, w:2.2, h:0.3,
        fontSize:13, bold:true, color:WHITE,
        fontFace:"Calibri", align:"center", margin:0
      });
      // Subject name — 10pt white centered
      s.addText(col.name, {
        x:col.x, y:1.55, w:2.2, h:0.28,
        fontSize:10, color:WHITE,
        fontFace:"Calibri", align:"center", margin:0
      });
      // Icon — centered in card, y=2.05 (matches class project image position)
      s.addText(col.icon, {
        x:col.x+0.75, y:2.05, w:0.65, h:0.65,
        fontSize:28, fontFace:"Segoe UI Emoji", align:"center", margin:0
      });
      // Role description text — 10.5pt #E0F0FF centered, y=2.8
      s.addText(col.role, {
        x:col.x+0.12, y:2.85, w:1.96, h:2.2,
        fontSize:10.5, color:LIGHT_TXT,
        fontFace:"Calibri", align:"center", margin:0
      });

      // Vertical connector line between columns (class project uses line shapes)
      // The class project has lines at x=2.5/4.92/7.34 y=3.2 w=0.22 h=0 (horizontal dividers)
      if (i < 3) {
        const lx = col.x + 2.2;
        s.addShape("line", {
          x: lx, y:3.2, w:0.22, h:0,
          line:{ color:TEAL, width:2 }
        });
      }
    });

    // Bottom summary bar — exact match: #193050 y=5.15 h=0.3 w=9.4 x=0.3
    s.addShape("rect", { x:0.3, y:5.15, w:9.4, h:0.3, fill:{ color:"193050" } });
    s.addText(
      "Algorithm Design defines the WHY  ·  Graph Theory does the routing  ·  DBMS stores everything  ·  Advanced Java builds it all",
      { x:0.3, y:5.15, w:9.4, h:0.3, fontSize:10, color:TEAL,
        fontFace:"Calibri", align:"center", valign:"middle", margin:0, bold:true }
    );
  }

  // ===========================================================
  // SLIDE 9 — 3 DEMO CASES  [CLASS PROJECT STYLE]
  // ===========================================================
  // Matches class project light-bg slides (F8FAFF) with dark header.
  // Three full-width case rows — white cards with colored left bar,
  // same card format as slides 2/4 of class project.
  // Each row: colored left stripe 0.72" wide, title 13.5pt bold,
  // italic scenario 9.5pt, result 10pt, right lesson pill.
  // ===========================================================
  {
    const s = pres.addSlide();
    // Light bg — matches class project slide 2/4 style
    s.background = { color:"F8FAFF" };

    // Header band — dark navy, same as class project
    s.addShape("rect", { x:0, y:0, w:10, h:1.1, fill:{ color:DARK_BG } });
    // Left teal stripe — present in every class project slide
    s.addShape("rect", { x:0, y:0, w:0.18, h:5.625, fill:{ color:TEAL } });
    s.addText("3 Demo Cases to Explain During Presentation", {
      x:0.4, y:0.1, w:9.2, h:0.9,
      fontSize:24, bold:true, color:WHITE,
      fontFace:"Calibri", valign:"middle", margin:0
    });

    [
      { num:"01", color:SUBJ.BCS402,
        title:"Nearest Hospital is Best — Simple Case",
        scenario:"Patient at Node 1 (JSSATE)  |  Emergency: GENERAL  |  No ICU needed",
        result:"BGS Gleneagles (Node 5, 1.2 km) handles GENERAL, has beds, and is the shortest Dijkstra path. System correctly recommends it as PRIMARY.",
        lesson:"System works in the simple case — nearest IS best here." },
      { num:"02", color:SUBJ.BCS401,
        title:"Nearest Hospital Lacks Specialization — Filtered Out",
        scenario:"Patient at Node 1 (JSSATE)  |  Emergency: TRAUMA  |  Needs ICU",
        result:"BGS (1.2 km) handles CARDIAC not TRAUMA — filtered at Stage 1. RRMCH (Node 8, 7.2 km) handles TRAUMA with ICU available — selected as PRIMARY.",
        lesson:"Nearest ≠ Best. Type + ICU filter is the key differentiator." },
      { num:"03", color:SUBJ.BCS405B,
        title:"Multiple Valid Hospitals — Dijkstra Decides the Winner",
        scenario:"Patient at Node 10 (BSK Temple)  |  Emergency: CARDIAC  |  Needs ICU",
        result:"BGS, Apollo & Fortis all handle CARDIAC with ICU. Dijkstra computes road distances — Apollo (Node 11) wins at ~5.5 km vs BGS at 9+ km.",
        lesson:"Best viva case — Dijkstra's role is crystal clear here." },
    ].forEach((demo, i) => {
      const y = 1.25 + i * 1.38;
      // White card — matches class project row cards
      s.addShape("rect", { x:0.35, y, w:9.3, h:1.22, fill:{ color:CARD_BG }, shadow:sh() });
      // Colored left stripe — same pattern as class project left borders
      s.addShape("rect", { x:0.35, y, w:0.72, h:1.22, fill:{ color:demo.color } });
      // Number — 28pt bold white centered
      s.addText(demo.num, { x:0.35, y, w:0.72, h:1.22,
        fontSize:28, bold:true, color:WHITE, fontFace:"Calibri",
        align:"center", valign:"middle", margin:0
      });
      // Title — 13.5pt bold body text
      s.addText(demo.title, {
        x:1.18, y:y+0.07, w:7.88, h:0.3,
        fontSize:13, bold:true, color:BODY_TXT, fontFace:"Calibri", margin:0
      });
      // Scenario — 9.5pt italic muted (class project uses italic for secondary info)
      s.addText("Scenario: " + demo.scenario, {
        x:1.18, y:y+0.37, w:7.88, h:0.22,
        fontSize:9.5, color:MUTED, fontFace:"Calibri", italic:true, margin:0
      });
      // Result text
      s.addText("Result: " + demo.result, {
        x:1.18, y:y+0.59, w:5.85, h:0.55,
        fontSize:10, color:BODY_TXT, fontFace:"Calibri", margin:0
      });
      // Lesson pill — roundRect same as class project badge pills
      s.addShape("roundRect", {
        x:7.18, y:y+0.55, w:2.32, h:0.52,
        fill:{ color:demo.color }, rectRadius:0.05
      });
      s.addText(demo.lesson, {
        x:7.18, y:y+0.55, w:2.32, h:0.52,
        fontSize:8.5, color:WHITE, fontFace:"Calibri",
        align:"center", valign:"middle", margin:3
      });
    });
  }

  // ===========================================================
  // SLIDE 10 — VIVA CLOSING  [CLASS PROJECT STYLE]
  // ===========================================================
  // Exact match to class project PPT slide 8 (What did we learn?):
  //   bg=#0B1D3A
  //   Decorative circle top-right: x=6.5 y=-1 w=5 h=5 #112B52 + teal border
  //   Title: teal #00B4D8 x=0.5 y=0.5
  //   Quote card: #112B52 x=0.5 y=1.2 w=8.2 h=1.5
  //   Left border: #00B4D8 x=0.5 y=1.2 w=0.1 h=1.5
  //   Quote text: 14pt italic #E0F0FF x=0.7 y=1.3
  //   4 chips: x=0.5/2.8/5.1/7.4 y=3.1 w=2.1 h=0.7
  //     code bold 12pt x y=3.12 h=0.3, sub 10pt y=3.42 h=0.28
  //   Footer: 11pt italic #64748B x=0.5 y=4.9
  // ===========================================================
  {
    const s = pres.addSlide();
    s.background = { color: DARK_BG };

    // Decorative circle top-right — exact class project position
    s.addShape("oval", {
      x:6.5, y:-1, w:5, h:5,
      fill:{ color:MID_BG }, line:{ color:TEAL, width:1.5 }
    });

    // Title — class project uses teal, no background, x=0.5 y=0.5
    s.addText("One Line to Remember for Viva", {
      x:0.5, y:0.5, w:8, h:0.6,
      fontSize:18, color:TEAL, fontFace:"Calibri", bold:true, margin:0
    });

    // Quote card — exact class project shape: #112B52, x=0.5 y=1.2 w=8.2 h=1.5
    s.addShape("rect", { x:0.5, y:1.2, w:8.2, h:1.5, fill:{ color:MID_BG } });
    // Left teal accent border — exactly w=0.1 (class project uses 0.1" left bar)
    s.addShape("rect", { x:0.5, y:1.2, w:0.1, h:1.5, fill:{ color:TEAL } });
    // Quote text — 14pt italic #E0F0FF (class project uses 14pt for quote)
    s.addText(
      '"This project uses DBMS to store hospitals and roads, ' +
      'Advanced Java to build the application, Graph Theory to model ' +
      'and solve routing, and Algorithm Design to compare and justify ' +
      'the recommendation strategy."',
      { x:0.7, y:1.3, w:7.9, h:1.35,
        fontSize:14, color:LIGHT_TXT, fontFace:"Calibri", italic:true, margin:0 }
    );

    // 4 subject chips — exact class project positions
    // x = 0.5, 2.8, 5.1, 7.4   y=3.1  w=2.1  h=0.7
    [
      { label:"BCS401",  sub:"Defined the Problem", c:SUBJ.BCS401, x:0.5 },
      { label:"BCS402",  sub:"Built the App",       c:SUBJ.BCS402, x:2.8 },
      { label:"BCS403",  sub:"Designed the DB",     c:SUBJ.BCS403, x:5.1 },
      { label:"BCS405B", sub:"Solved the Routing",  c:SUBJ.BCS405B, x:7.4 },
    ].forEach((chip) => {
      // Chip background — exact w=2.1 h=0.7 (class project)
      s.addShape("rect", { x:chip.x, y:3.1, w:2.1, h:0.7, fill:{ color:chip.c } });
      // Subject code — 12pt bold (class project)
      s.addText(chip.label, {
        x:chip.x, y:3.12, w:2.1, h:0.3,
        fontSize:12, bold:true, color:WHITE,
        fontFace:"Calibri", align:"center", margin:0
      });
      // Subject sub-label — 10pt (class project)
      s.addText(chip.sub, {
        x:chip.x, y:3.42, w:2.1, h:0.28,
        fontSize:10, color:WHITE,
        fontFace:"Calibri", align:"center", margin:0
      });
    });

    // Footer — exact class project: 11pt italic #64748B x=0.5 y=4.9 left-aligned
    s.addText("Smart Ambulance Routing & Hospital Allocation System  ·  South Bangalore City Map  ·  13 Nodes  ·  6 Hospitals", {
      x:0.5, y:4.9, w:9, h:0.4,
      fontSize:11, color:MUTED, fontFace:"Calibri", align:"left", italic:true, margin:0
    });
  }




  // ── Save ─────────────────────────────────────────────────
  const outPath = "/Users/abhi/Desktop/insta/AMBULANCE/ppt/Smart_Ambulance_v2.pptx";
  await pres.writeFile({ fileName: outPath });
  console.log(`✅ Done — 10 slides written → ${outPath}`);
}

build().catch(console.error);
