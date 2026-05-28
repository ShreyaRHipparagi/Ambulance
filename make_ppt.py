from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
import copy

# ─────────────────────────────────────────────
# Color palette
# ─────────────────────────────────────────────
BG_DARK      = RGBColor(0x0a, 0x0e, 0x1a)   # deep navy
BG_CARD      = RGBColor(0x10, 0x16, 0x28)   # card bg
ACCENT_CYAN  = RGBColor(0x06, 0xb6, 0xd4)   # cyan
ACCENT_GREEN = RGBColor(0x10, 0xb9, 0x81)   # emerald
ACCENT_PURPLE= RGBColor(0x81, 0x8c, 0xf8)   # indigo
ACCENT_RED   = RGBColor(0xef, 0x44, 0x44)   # red
ACCENT_AMBER = RGBColor(0xf5, 0x9e, 0x0b)   # amber
ACCENT_PINK  = RGBColor(0xec, 0x48, 0x99)   # pink
WHITE        = RGBColor(0xff, 0xff, 0xff)
LIGHT_GREY   = RGBColor(0x94, 0xa3, 0xb8)
DARK_TEXT    = RGBColor(0x1e, 0x29, 0x3b)

ARCH_IMG = "/Users/abhi/.gemini/antigravity/brain/af9e1fa3-3c6a-4f5f-92b4-a7eea0acba52/architecture_diagram_1779985246837.png"

prs = Presentation()
prs.slide_width  = Inches(13.33)
prs.slide_height = Inches(7.5)

BLANK = prs.slide_layouts[6]  # truly blank


# ─────────────────────────────────────────────
# helpers
# ─────────────────────────────────────────────
def bg(slide, color=BG_DARK):
    bg_shape = slide.shapes.add_shape(1, 0, 0, prs.slide_width, prs.slide_height)
    bg_shape.fill.solid(); bg_shape.fill.fore_color.rgb = color
    bg_shape.line.fill.background()
    bg_shape.zorder = 0


def txt(slide, text, l, t, w, h, size=18, bold=False, color=WHITE,
        align=PP_ALIGN.LEFT, italic=False, wrap=True):
    tb = slide.shapes.add_textbox(Inches(l), Inches(t), Inches(w), Inches(h))
    tf = tb.text_frame; tf.word_wrap = wrap
    p = tf.paragraphs[0]; p.alignment = align
    run = p.add_run(); run.text = text
    run.font.size = Pt(size); run.font.bold = bold
    run.font.color.rgb = color; run.font.italic = italic


def rect(slide, l, t, w, h, fill=BG_CARD, border=ACCENT_CYAN, border_w=Pt(1.5), radius=False):
    shape_type = 5 if radius else 1  # 5=rounded rectangle, 1=rectangle
    s = slide.shapes.add_shape(shape_type, Inches(l), Inches(t), Inches(w), Inches(h))
    s.fill.solid(); s.fill.fore_color.rgb = fill
    s.line.color.rgb = border; s.line.width = border_w
    return s


def badge(slide, text, l, t, color=ACCENT_CYAN, text_color=WHITE):
    r = rect(slide, l, t, 1.5, 0.28, fill=color, border=color)
    txt(slide, text, l+0.05, t+0.02, 1.4, 0.24, size=9, bold=True,
        color=text_color, align=PP_ALIGN.CENTER)


def img(slide, path, l, t, w, h):
    slide.shapes.add_picture(path, Inches(l), Inches(t), Inches(w), Inches(h))


def heading_bar(slide, text, sub=None):
    """Full-width top heading bar"""
    rect(slide, 0, 0, 13.33, 1.1, fill=RGBColor(0x06,0x10,0x22), border=ACCENT_CYAN, border_w=Pt(0))
    # left accent stripe
    s = slide.shapes.add_shape(1, 0, 0, Inches(0.08), Inches(1.1))
    s.fill.solid(); s.fill.fore_color.rgb = ACCENT_CYAN; s.line.fill.background()
    txt(slide, text, 0.25, 0.08, 12, 0.6, size=28, bold=True, color=WHITE)
    if sub:
        txt(slide, sub, 0.25, 0.65, 12, 0.4, size=13, color=LIGHT_GREY)


# ═══════════════════════════════════════════
# SLIDE 1 — Title Slide
# ═══════════════════════════════════════════
slide = prs.slides.add_slide(BLANK)
bg(slide)

# Ambulance emoji top center
txt(slide, "🚑", 5.5, 0.4, 2.0, 1.2, size=60, align=PP_ALIGN.CENTER)

# Title
txt(slide, "Smart Ambulance Routing", 1, 1.45, 11.33, 0.9,
    size=42, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
txt(slide, "& Hospital Allocation System", 1, 2.2, 11.33, 0.8,
    size=34, bold=True, color=ACCENT_CYAN, align=PP_ALIGN.CENTER)

# Divider line
s = slide.shapes.add_shape(1, Inches(2.5), Inches(3.1), Inches(8.33), Inches(0.04))
s.fill.solid(); s.fill.fore_color.rgb = ACCENT_CYAN; s.line.fill.background()

# Subtitle
txt(slide, "Real-time emergency response powered by Dijkstra, A*, BFS/DFS & Mapbox live traffic",
    1.5, 3.2, 10.33, 0.5, size=15, color=LIGHT_GREY, align=PP_ALIGN.CENTER)

# Academic badges row
badge_data = [
    ("BCS401  ADA",   3.5,  4.1, ACCENT_RED),
    ("BCS402  OOCJ",  5.2,  4.1, RGBColor(0x37,0x4b,0xd0)),
    ("BCS403  DBMS",  6.9,  4.1, ACCENT_AMBER),
    ("BCS405B GT",    8.6,  4.1, RGBColor(0x6d,0x28,0xd9)),
]
for label, lx, ty, col in badge_data:
    badge(slide, label, lx, ty, color=col)

# Bottom metadata
txt(slide, "Shreya R Hipparagi  |  VTU 4th Semester CSE  |  2025–26",
    1, 5.0, 11.33, 0.4, size=13, color=LIGHT_GREY, align=PP_ALIGN.CENTER)
txt(slide, "South Bangalore Region  ·  JSSATE Uttarahalli Campus Area",
    1, 5.4, 11.33, 0.35, size=12, color=RGBColor(0x47,0x5d,0x78), align=PP_ALIGN.CENTER)


# ═══════════════════════════════════════════
# SLIDE 2 — Problem Statement
# ═══════════════════════════════════════════
slide = prs.slides.add_slide(BLANK)
bg(slide)
heading_bar(slide, "Problem Statement", "Why do ambulances take the wrong route?")

problems = [
    ("⏱️", "Golden Hour Crisis",
     "Ambulances lose precious minutes on wrong routes. Every 10 seconds matters in cardiac & trauma emergencies."),
    ("🏥", "No Hospital Awareness",
     "Ambulances rush to the nearest hospital — but it may have zero ICU beds or no cardiac specialist."),
    ("🚦", "Traffic Blindness",
     "Static routing ignores live congestion. Shortest distance ≠ fastest path during peak hours."),
    ("🗺️", "Manual Decision Making",
     "Dispatchers rely on memory and radio calls. No algorithmic optimization for multi-hospital scenarios."),
]

for i, (icon, title, desc) in enumerate(problems):
    col = i % 2
    row = i // 2
    lx = 0.4 + col * 6.5
    ty = 1.4 + row * 2.6
    r = rect(slide, lx, ty, 6.2, 2.3, fill=RGBColor(0x0d,0x15,0x2a), border=ACCENT_RED, border_w=Pt(1.2))
    txt(slide, icon, lx+0.15, ty+0.1, 0.7, 0.6, size=28)
    txt(slide, title, lx+0.8, ty+0.12, 5.2, 0.45, size=16, bold=True, color=ACCENT_RED)
    txt(slide, desc,  lx+0.15, ty+0.65, 5.9, 1.5, size=12, color=LIGHT_GREY)


# ═══════════════════════════════════════════
# SLIDE 3 — System Architecture (full image)
# ═══════════════════════════════════════════
slide = prs.slides.add_slide(BLANK)
bg(slide)
heading_bar(slide, "System Architecture", "End-to-end component interaction & data flow")

img(slide, ARCH_IMG, 0.4, 1.2, 8.0, 6.1)

# Right legend panel
rect(slide, 8.6, 1.2, 4.5, 6.1, fill=RGBColor(0x0d,0x15,0x2a), border=ACCENT_PURPLE, border_w=Pt(1))
txt(slide, "Component Legend", 8.75, 1.3, 4.2, 0.4, size=13, bold=True, color=ACCENT_PURPLE)

legend_items = [
    (ACCENT_PURPLE, "UI Pages (React JSX)"),
    (ACCENT_GREEN,  "AppContext — Global State"),
    (ACCENT_CYAN,   "Algorithm Engines"),
    (ACCENT_PINK,   "CityGraph (Data)"),
    (ACCENT_AMBER,  "External: Mapbox API"),
    (ACCENT_GREEN,  "localStorage Persistence"),
]
for i, (col, label) in enumerate(legend_items):
    ty = 1.85 + i * 0.65
    s = slide.shapes.add_shape(1, Inches(8.8), Inches(ty+0.08), Inches(0.22), Inches(0.22))
    s.fill.solid(); s.fill.fore_color.rgb = col; s.line.fill.background()
    txt(slide, label, 9.12, ty, 3.8, 0.38, size=11, color=LIGHT_GREY)

txt(slide, "Data Flow", 8.75, 5.9, 4.2, 0.35, size=12, bold=True, color=ACCENT_CYAN)
txt(slide,
    "User Input → AppContext → RecommendationService "
    "→ Dijkstra SSSP → Ranked Results → MapView "
    "→ Mapbox Traffic API → Animation",
    8.75, 6.25, 4.2, 0.95, size=10, color=LIGHT_GREY)


# ═══════════════════════════════════════════
# SLIDE 4 — Algorithm Engines (BCS401 / ADA)
# ═══════════════════════════════════════════
slide = prs.slides.add_slide(BLANK)
bg(slide)
heading_bar(slide, "Algorithm Engines", "BCS401 ADA  ·  BCS405B Graph Theory")

algos = [
    ("Dijkstra SSSP", "O((V+E) log V)",
     ["Binary Min-Heap Priority Queue",
      "Relaxes edges: dist[v] = min(dist[v], dist[u]+w)",
      "Handles traffic multipliers: w_eff = w × traffic",
      "Captures every step for visualizer",
      "Used in RecommendationService per hospital"],
     ACCENT_CYAN),
    ("A* Search", "O((V+E) log V)*",
     ["Haversine GPS heuristic: h(n) = great-circle dist",
      "f(n) = g(n) + h(n)  →  priority in queue",
      "Admissible: never overestimates → optimal",
      "Converges faster than Dijkstra on geospatial graphs",
      "Same step trace format as Dijkstra"],
     ACCENT_GREEN),
    ("BFS", "O(V+E)",
     ["Queue-based level-order traversal",
      "Shortest path by hop count (not weighted)",
      "Illustrates frontier expansion visually",
      "Educational: shows graph connectivity",
      "Complete: always finds a path if one exists"],
     ACCENT_AMBER),
    ("DFS", "O(V+E)",
     ["Stack-based deep exploration with backtracking",
      "May not find optimal path in weighted graph",
      "Shows recursion / call-stack behavior",
      "Educational: illustrates graph reachability",
      "Demonstrates backtracking algorithm design"],
     ACCENT_PURPLE),
]

for i, (name, complexity, points, color) in enumerate(algos):
    col = i % 2; row = i // 2
    lx = 0.3 + col * 6.5; ty = 1.35 + row * 2.85
    r = rect(slide, lx, ty, 6.2, 2.65, fill=RGBColor(0x0d,0x15,0x2a), border=color, border_w=Pt(1.5))
    txt(slide, name, lx+0.15, ty+0.1, 4.5, 0.45, size=17, bold=True, color=color)
    txt(slide, complexity, lx+4.5, ty+0.12, 1.55, 0.4, size=11, bold=True,
        color=color, align=PP_ALIGN.RIGHT)
    for j, pt in enumerate(points):
        txt(slide, f"• {pt}", lx+0.2, ty+0.6+j*0.38, 5.8, 0.36, size=11, color=LIGHT_GREY)


# ═══════════════════════════════════════════
# SLIDE 5 — Data Graph: 13 Nodes, 6 Hospitals
# ═══════════════════════════════════════════
slide = prs.slides.add_slide(BLANK)
bg(slide)
heading_bar(slide, "City Graph — Real Bangalore Network", "BCS405B Graph Theory  ·  13 nodes, 23 edges, 6 hospitals")

# Stats row
stats = [
    ("13", "Graph Nodes", ACCENT_CYAN),
    ("23", "Road Edges", ACCENT_PURPLE),
    ("6", "Hospitals", ACCENT_GREEN),
    ("6", "Emergency Types", ACCENT_RED),
]
for i, (val, lbl, col) in enumerate(stats):
    lx = 0.4 + i * 3.22
    r = rect(slide, lx, 1.25, 3.0, 0.95, fill=RGBColor(0x0d,0x15,0x2a), border=col, border_w=Pt(1.2))
    txt(slide, val, lx, 1.3, 3.0, 0.55, size=30, bold=True, color=col, align=PP_ALIGN.CENTER)
    txt(slide, lbl, lx, 1.85, 3.0, 0.3, size=11, color=LIGHT_GREY, align=PP_ALIGN.CENTER)

# Hospital table
headers = ["#", "Hospital", "Node", "Specializations", "ICU Beds"]
col_w =   [0.35, 4.3, 0.55, 3.9, 1.1]
col_x = [0.3]
for w in col_w[:-1]: col_x.append(col_x[-1]+w)

ty = 2.4
r = rect(slide, 0.3, ty, 12.7, 0.38, fill=ACCENT_CYAN, border=ACCENT_CYAN)
for j, (h, cx, cw) in enumerate(zip(headers, col_x, col_w)):
    txt(slide, h, cx+0.05, ty+0.04, cw, 0.3, size=11, bold=True, color=DARK_TEXT)

hospitals = [
    ("H1","RRMCH Mysore Road",           "8","GENERAL, TRAUMA, MATERNITY","1 / 5"),
    ("H2","Sagar Hospitals DSI",          "4","TRAUMA, BURNS",             "3 / 8"),
    ("H3","BGS Gleneagles Global",        "5","CARDIAC, GENERAL, MATERNITY","2 / 10"),
    ("H4","Astra Super Speciality",       "6","NEURO, GENERAL",            "4 / 6"),
    ("H5","Apollo Hospital Bannerghatta","11","CARDIAC, NEURO, BURNS",     "5 / 12"),
    ("H6","Fortis Hospital Bannerghatta","13","CARDIAC, TRAUMA, NEURO",    "4 / 10"),
]
for i, row_data in enumerate(hospitals):
    ty2 = ty + 0.38 + i*0.48
    fill = RGBColor(0x0d,0x15,0x2a) if i%2==0 else RGBColor(0x10,0x1c,0x34)
    r = rect(slide, 0.3, ty2, 12.7, 0.46, fill=fill, border=RGBColor(0x1e,0x29,0x4a), border_w=Pt(0.5))
    for j, (cell, cx, cw) in enumerate(zip(row_data, col_x, col_w)):
        color = ACCENT_GREEN if j==0 else (ACCENT_CYAN if j==2 else (ACCENT_AMBER if j==4 else WHITE))
        txt(slide, cell, cx+0.05, ty2+0.07, cw, 0.32, size=11, color=color, bold=(j==0))

# Bottom note
txt(slide, "★  All node coordinates GPS-verified for Bangalore  ·  Edges are bidirectional with traffic multipliers (1.0 – 2.0)",
    0.3, 7.0, 12.7, 0.35, size=10, color=RGBColor(0x47,0x5d,0x78), align=PP_ALIGN.CENTER)


# ═══════════════════════════════════════════
# SLIDE 6 — Database Schema (BCS403 DBMS)
# ═══════════════════════════════════════════
slide = prs.slides.add_slide(BLANK)
bg(slide)
heading_bar(slide, "Database Schema (DBMS)", "BCS403  ·  8 relational tables  ·  3NF normalized  ·  localStorage persistence")

tables = [
    ("patients",              ["patient_id PK","name","age","blood_group","contact"],             ACCENT_CYAN),
    ("location_nodes",        ["node_id PK","name","area","lat","lng"],                           ACCENT_GREEN),
    ("road_edges",            ["edge_id PK","from_node FK","to_node FK","weight_km","traffic_mult"],ACCENT_AMBER),
    ("hospitals",             ["hospital_id PK","name","address","contact","node_id FK"],          ACCENT_RED),
    ("hospital_specializations",["spec_id PK","hospital_id FK","emergency_type"],                 ACCENT_PINK),
    ("hospital_resources",    ["resource_id PK","hospital_id FK","icu_total","icu_avail","gen_total","gen_avail"],ACCENT_PURPLE),
    ("emergency_cases",       ["case_id PK","patient_id FK","source_node FK","emergency_type","needs_icu","timestamp"],ACCENT_CYAN),
    ("allocations",           ["allocation_id PK","case_id FK","hospital_id FK","route_cost_km","path_nodes","algorithm"],ACCENT_GREEN),
]

positions = [
    (0.25, 1.25), (4.55, 1.25), (8.85, 1.25),
    (0.25, 3.5),  (4.55, 3.5),  (8.85, 3.5),
    (0.25, 5.5),  (6.0,  5.5),
]
widths = [4.1, 4.1, 4.1, 4.1, 4.1, 4.1, 5.5, 7.0]

for (lx, ty), (name, fields, color), w in zip(positions, tables, widths):
    h = 0.38 + len(fields)*0.3
    r = rect(slide, lx, ty, w, h, fill=RGBColor(0x0d,0x15,0x2a), border=color, border_w=Pt(1.5))
    txt(slide, name, lx+0.1, ty+0.05, w-0.2, 0.33, size=12, bold=True, color=color)
    for j, field in enumerate(fields):
        fc = ACCENT_AMBER if "PK" in field else (ACCENT_PINK if "FK" in field else LIGHT_GREY)
        txt(slide, f"  {field}", lx+0.1, ty+0.38+j*0.3, w-0.2, 0.28, size=10, color=fc)

# localStorage box
rect(slide, 0.25, 6.9, 12.8, 0.45, fill=RGBColor(0x05,0x19,0x12), border=ACCENT_GREEN, border_w=Pt(1.5))
txt(slide, "💾  localStorage persistence:  emergency_history  |  hospital_beds  |  theme  (no backend — pure browser storage)",
    0.4, 6.95, 12.4, 0.35, size=11, bold=True, color=ACCENT_GREEN)


# ═══════════════════════════════════════════
# SLIDE 7 — MapView & Live Traffic
# ═══════════════════════════════════════════
slide = prs.slides.add_slide(BLANK)
bg(slide)
heading_bar(slide, "Live Map & Traffic Integration", "BCS405B Graph Theory  ·  Mapbox GL JS  ·  driving-traffic API")

features = [
    ("🗺️", "Mapbox Streets Map",        "streets-v12 style — real OSM base map centered on JSSATE Bangalore region",      ACCENT_CYAN),
    ("🚦", "Live Traffic Routing",       "driving-traffic API profile — real-time congestion-aware route (not just static roads)", ACCENT_RED),
    ("🎨", "Congestion Color Coding",    "Per-segment colors: 🟢 Low  🟡 Moderate  🔴 Heavy  ●  Severe — from Mapbox annotations", ACCENT_GREEN),
    ("🚑", "Ambulance Animation",        "Turf.js along-path interpolation at 60fps. Bearing offset -90° so emoji faces direction of travel", ACCENT_AMBER),
    ("📏", "Distance Badges",            "km labels float at midpoint of each of 23 edges on the map canvas",                ACCENT_PURPLE),
    ("📊", "Live Stats Bar",             "Real-time: Mapbox distance, ETA, dominant congestion level, last-updated timestamp", ACCENT_CYAN),
    ("🔄", "Refresh Route",             "Re-fetches route from Mapbox at any time to get updated traffic conditions",         ACCENT_GREEN),
    ("📍", "13 Real GPS Nodes",         "Verified coordinates: JSSATE, BGS, RRMCH, Apollo, Fortis, Sagar, Kengeri, BSK...", ACCENT_PINK),
]

for i, (icon, title, desc, color) in enumerate(features):
    col = i % 2; row = i // 2
    lx = 0.3 + col * 6.5; ty = 1.3 + row * 1.45
    r = rect(slide, lx, ty, 6.2, 1.3, fill=RGBColor(0x0d,0x15,0x2a), border=color, border_w=Pt(1.0))
    txt(slide, icon,  lx+0.12, ty+0.08, 0.55, 0.55, size=22)
    txt(slide, title, lx+0.7,  ty+0.08, 5.35, 0.4,  size=14, bold=True, color=color)
    txt(slide, desc,  lx+0.7,  ty+0.5,  5.35, 0.72, size=11, color=LIGHT_GREY)


# ═══════════════════════════════════════════
# SLIDE 8 — Bug Fixes & Data Persistence
# ═══════════════════════════════════════════
slide = prs.slides.add_slide(BLANK)
bg(slide)
heading_bar(slide, "Bug Fixes & Quality Improvements", "13 bugs identified and resolved during review")

bugs = [
    ("🔴", "History wiped on page refresh",         "AppContext.jsx",       "Persisted to localStorage['emergency_history'] via useEffect"),
    ("🔴", "Hospital bed edits lost on refresh",    "AppContext.jsx",       "Merged saved beds from localStorage on init; persist on every updateBeds()"),
    ("🔴", "MATERNITY → No Hospital Found (always)","cityData.js",          "Added MATERNITY to RRMCH (H1) and BGS Gleneagles (H3) specializations"),
    ("🟡", "Edge e14 waypoint missed Node 9",       "cityData.js",          "Fixed last coord to [77.4810, 12.9115] — exact Node 9 GPS"),
    ("🟡", "needsIcu missing from history records", "AppContext.jsx",       "Added needsIcu: request.needsIcu to addToHistory() call"),
    ("🟡", "ETA speed 40 km/h (too slow)",          "Results.jsx",          "Changed to 50 km/h — realistic for Bangalore emergency vehicles"),
    ("🟡", "sourceLocationId string vs number",     "EmergencyEntry.jsx",   "Added parseInt() on select onChange; consistent number type"),
    ("🟢", "JSS campus loop in ambulance route",    "cityData.js",          "Moved Node 1 to main road junction (12.9060, 77.5028)"),
    ("🟢", "Static driving profile (no traffic)",   "MapView.jsx",          "Switched to driving-traffic Mapbox profile with congestion annotations"),
    ("🟢", "Ambulance emoji wrong direction",        "MapView.jsx",          "setRotation(bearing − 90) compensates for 🚑 facing east by default"),
    ("🟢", "All roads painted green (traffic tiles)","MapView.jsx",          "Removed mapbox-traffic-v1 tile layer; kept route-level segment colors"),
    ("🟢", "No way to clear history",              "History.jsx",          "Added Clear History button + clearHistory() action in AppContext"),
    ("🟢", "Comment said 9 nodes (actually 13)",   "cityData.js",          "Updated comment to '13 nodes'"),
]

headers = ["Sev", "Bug Description", "File", "Fix Applied"]
col_w2  = [0.5, 3.3, 2.3, 6.5]
col_x2  = [0.25]
for w in col_w2[:-1]: col_x2.append(col_x2[-1]+w)

ty = 1.2
r = rect(slide, 0.25, ty, 13.0, 0.35, fill=ACCENT_CYAN, border=ACCENT_CYAN)
for h, cx, cw in zip(headers, col_x2, col_w2):
    txt(slide, h, cx+0.05, ty+0.04, cw, 0.27, size=11, bold=True, color=DARK_TEXT)

for i, (sev, bug, fil, fix) in enumerate(bugs):
    ty2 = ty + 0.35 + i * 0.43
    fill_c = RGBColor(0x0d,0x15,0x2a) if i%2==0 else RGBColor(0x10,0x1c,0x34)
    rect(slide, 0.25, ty2, 13.0, 0.42, fill=fill_c, border=RGBColor(0x1e,0x29,0x4a), border_w=Pt(0.4))
    row_data = [sev, bug, fil, fix]
    for j, (cell, cx, cw) in enumerate(zip(row_data, col_x2, col_w2)):
        color = ACCENT_RED if sev=="🔴" and j==0 else (ACCENT_AMBER if sev=="🟡" and j==0 else (ACCENT_GREEN if j==0 else (ACCENT_CYAN if j==2 else LIGHT_GREY)))
        txt(slide, cell, cx+0.05, ty2+0.07, cw, 0.3, size=10, color=color)


# ═══════════════════════════════════════════
# SLIDE 9 — End-to-End Data Flow Trace
# ═══════════════════════════════════════════
slide = prs.slides.add_slide(BLANK)
bg(slide)
heading_bar(slide, "End-to-End Data Flow", "From patient form submit to ambulance animation on map")

steps = [
    ("1", "EmergencyEntry.jsx",    "handleSubmit()",
     "Patient fills form → needsIcu, emergencyType, sourceLocationId (parseInt), patientName"),
    ("2", "AppContext.jsx",        "runRecommendation(request)",
     "Sets emergencyRequest state, creates RecommendationService, calls service.recommend()"),
    ("3", "RecommendationService","recommend(request)",
     "Stage 1: filter by specializations. Stage 2: filter by bed availability. Stage 3: Dijkstra per hospital"),
    ("4", "DijkstraEngine.js",     "run(source, target, useTraffic)",
     "Binary min-heap SSSP: relax edges with w × trafficMultiplier, reconstruct path via previous[]"),
    ("5", "CityGraph.js",          "getNeighbors() + getEffectiveWeight()",
     "Adjacency list lookup → returns neighbors; effective weight = edge.weight × (traffic ? multiplier : 1)"),
    ("6", "AppContext.jsx",        "setEmergencyResult() + addToHistory()",
     "Stores ranked hospital results, persists case record to localStorage['emergency_history']"),
    ("7", "Results.jsx",           "render()",
     "Displays primary/backup hospitals, ETA (cost/50×60 min), path nodes, filter steps, call button"),
    ("8", "MapView.jsx",           "fetchAndDrawRoute()",
     "Fetches Mapbox driving-traffic route with congestion annotations, draws per-segment colored line"),
    ("9", "Turf.js + rAF",         "runAnimation()",
     "along(route, progress×distance) → setLngLat + setRotation(bearing − 90) every frame"),
]

for i, (num, comp, fn, desc) in enumerate(steps):
    col = i % 3; row = i // 3
    lx = 0.25 + col * 4.37; ty = 1.28 + row * 2.02
    color = [ACCENT_CYAN, ACCENT_GREEN, ACCENT_AMBER, ACCENT_PURPLE, ACCENT_PINK][i % 5]
    r = rect(slide, lx, ty, 4.15, 1.9, fill=RGBColor(0x0d,0x15,0x2a), border=color, border_w=Pt(1.2))
    # number circle
    c = slide.shapes.add_shape(9, Inches(lx+0.1), Inches(ty+0.08), Inches(0.4), Inches(0.4))
    c.fill.solid(); c.fill.fore_color.rgb = color; c.line.fill.background()
    txt(slide, num, lx+0.1, ty+0.09, 0.4, 0.3, size=14, bold=True, color=DARK_TEXT, align=PP_ALIGN.CENTER)
    txt(slide, comp, lx+0.6, ty+0.1, 3.4, 0.35, size=12, bold=True, color=color)
    txt(slide, fn,   lx+0.6, ty+0.45, 3.4, 0.3,  size=10, color=ACCENT_AMBER, italic=True)
    txt(slide, desc, lx+0.12, ty+0.82, 3.85, 1.0, size=10, color=LIGHT_GREY)


# ═══════════════════════════════════════════
# SLIDE 10 — Academic Syllabus Map
# ═══════════════════════════════════════════
slide = prs.slides.add_slide(BLANK)
bg(slide)
heading_bar(slide, "Academic Syllabus Coverage", "VTU 4th Semester CSE — all 4 subjects demonstrated end-to-end")

subjects = [
    ("BCS401", "Analysis & Design of Algorithms", ACCENT_RED,
     ["Dijkstra SSSP — O((V+E) log V)",
      "A* Search with GPS heuristic f(n)=g(n)+h(n)",
      "Binary Min-Heap Priority Queue from scratch",
      "BFS & DFS traversal step-by-step visualization",
      "Algorithm comparison across all 4 methods",
      "Traffic-weighted edge relaxation"]),
    ("BCS402", "Object Oriented Concepts with Java", RGBColor(0x37,0x4b,0xd0),
     ["CityGraph class — encapsulation + adjacency list",
      "DijkstraEngine, AStarEngine — single responsibility",
      "RecommendationService — dependency injection",
      "AppContext — singleton state pattern",
      "PriorityQueue — clean class interface",
      "React components — modular OO design"]),
    ("BCS403", "Database Management Systems", ACCENT_AMBER,
     ["8-table relational schema in 3NF",
      "ER Diagram — PK/FK, 1:N and 1:1 relationships",
      "CRUD on hospital resources (Hospitals page)",
      "Persistent audit log (localStorage → History page)",
      "Query simulation: filter by specialization + beds",
      "Transaction logging: addToHistory() on each case"]),
    ("BCS405B", "Graph Theory & Applications", RGBColor(0x6d,0x28,0xd9),
     ["Graph G = (V=13, E=23) weighted undirected",
      "Adjacency list representation",
      "Reachability & degree analysis",
      "BFS/DFS traversal proofs",
      "Dijkstra & A* SSSP on spatial graph",
      "Real GPS coordinate mapping"]),
]

for i, (code, name, color, pts) in enumerate(subjects):
    col = i % 2; row = i // 2
    lx = 0.3 + col * 6.5; ty = 1.25 + row * 2.95
    r = rect(slide, lx, ty, 6.2, 2.8, fill=RGBColor(0x0d,0x15,0x2a), border=color, border_w=Pt(2))
    badge(slide, code, lx+0.12, ty+0.1, color=color, text_color=DARK_TEXT)
    txt(slide, name, lx+1.75, ty+0.1, 4.3, 0.35, size=14, bold=True, color=color)
    for j, pt in enumerate(pts):
        txt(slide, f"✓  {pt}", lx+0.2, ty+0.58+j*0.36, 5.8, 0.33, size=11.5, color=LIGHT_GREY)


# ═══════════════════════════════════════════
# SLIDE 11 — Thank You / Conclusion
# ═══════════════════════════════════════════
slide = prs.slides.add_slide(BLANK)
bg(slide)

# Gradient-like bars
for i in range(15):
    s = slide.shapes.add_shape(1, Inches(0), Inches(i*0.5), prs.slide_width, Inches(0.5))
    alpha = int(255 * (1 - i/15) * 0.04)
    s.fill.solid(); s.fill.fore_color.rgb = ACCENT_CYAN
    s.line.fill.background()

txt(slide, "🚑", 5.4, 0.55, 2.5, 1.1, size=60, align=PP_ALIGN.CENTER)
txt(slide, "Thank You", 1, 1.55, 11.33, 0.85, size=48, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
txt(slide, "Smart Ambulance Routing & Hospital Allocation System", 1, 2.42, 11.33, 0.55,
    size=18, color=ACCENT_CYAN, align=PP_ALIGN.CENTER)

# Summary stats row
stats2 = [
    ("13", "Graph Nodes"),
    ("23", "Road Edges"),
    ("6",  "Hospitals"),
    ("4",  "Algorithms"),
    ("13", "Bugs Fixed"),
    ("3",  "localStorage Keys"),
]
for i, (val, lbl) in enumerate(stats2):
    lx = 0.55 + i * 2.05
    r = rect(slide, lx, 3.2, 1.85, 1.0, fill=RGBColor(0x0d,0x15,0x2a), border=ACCENT_CYAN, border_w=Pt(1))
    txt(slide, val, lx, 3.28, 1.85, 0.5, size=26, bold=True, color=ACCENT_CYAN, align=PP_ALIGN.CENTER)
    txt(slide, lbl, lx, 3.78, 1.85, 0.35, size=10, color=LIGHT_GREY, align=PP_ALIGN.CENTER)

# Divider
s = slide.shapes.add_shape(1, Inches(2.5), Inches(4.4), Inches(8.33), Inches(0.04))
s.fill.solid(); s.fill.fore_color.rgb = ACCENT_CYAN; s.line.fill.background()

txt(slide, "Shreya R Hipparagi  ·  VTU 4th Semester CSE  ·  2025–26",
    1, 4.52, 11.33, 0.42, size=15, color=WHITE, align=PP_ALIGN.CENTER)
txt(slide, "github.com/ShreyaRHipparagi/Ambulance",
    1, 4.95, 11.33, 0.38, size=13, color=ACCENT_CYAN, align=PP_ALIGN.CENTER)

badge_data2 = [
    ("BCS401  ADA",   3.5,  5.5, ACCENT_RED),
    ("BCS402  OOCJ",  5.2,  5.5, RGBColor(0x37,0x4b,0xd0)),
    ("BCS403  DBMS",  6.9,  5.5, ACCENT_AMBER),
    ("BCS405B GT",    8.6,  5.5, RGBColor(0x6d,0x28,0xd9)),
]
for label, lx, ty, col in badge_data2:
    badge(slide, label, lx, ty, color=col)

txt(slide, "Built with  React · Vite · Mapbox GL JS · Turf.js · Framer Motion · Vanilla CSS",
    1, 6.15, 11.33, 0.35, size=11, color=RGBColor(0x47,0x5d,0x78), align=PP_ALIGN.CENTER)


# ─────────────────────────────────────────────
# Save
# ─────────────────────────────────────────────
out = "/Users/abhi/Desktop/insta/AMBULANCE/SmartAmbulanceRouting_Presentation.pptx"
prs.save(out)
print(f"✅ Saved: {out}")
print(f"   Slides: {len(prs.slides)}")
