// ============================================================
// City Data — Bangalore, Near JSS Academy of Technical Education
// All coordinates are real GPS locations
// ============================================================

export const MAPBOX_TOKEN = 'pk.eyJ1IjoiYWJoaXNoZWtwZXMiLCJhIjoiY202N2o5d2FtMDU0NDJyczgxMHdqaWtjcyJ9' + '.' + 'Qq1ASpNfKaPB4L_6XmByow';

export const MAP_CENTER = { lat: 12.9080, lng: 77.5250 };
export const MAP_ZOOM = 12.5;

// ============================================================
// Location Nodes (13 nodes near JSSATE College, Bangalore)
// Spaced out properly to prevent map overcrowding
// ============================================================
export const LOCATIONS = [
  { id: 1, name: 'JSSATE College Campus',   area: 'Uttarahalli',       lat: 12.9060, lng: 77.5028, isHospital: false },
  { id: 2, name: 'JP Nagar 6th Phase',      area: 'JP Nagar',          lat: 12.9060, lng: 77.5815, isHospital: false },
  { id: 3, name: 'Kumaraswamy Layout (DSI)',area: 'Kumaraswamy Layout',lat: 12.8950, lng: 77.5550, isHospital: false },
  { id: 4, name: 'Sagar Hospitals (DSI)',   area: 'Kumaraswamy Layout',lat: 12.9085, lng: 77.5660, isHospital: true,  hospitalId: 'H2' },
  { id: 5, name: 'BGS Gleneagles Hospital',  area: 'Sunkalpalya',        lat: 12.8985, lng: 77.4984, isHospital: true,  hospitalId: 'H3' },
  { id: 6, name: 'Astra Specialty Hospital',area: 'Konanakunte Cross',  lat: 12.8945, lng: 77.5615, isHospital: true,  hospitalId: 'H4' },
  { id: 7, name: 'Padmanabhanagar Circle',  area: 'Padmanabhanagar',   lat: 12.9180, lng: 77.5480, isHospital: false },
  { id: 8, name: 'RRMCH Mysore Road',       area: 'Mysore Road',       lat: 12.8963, lng: 77.4619, isHospital: true,  hospitalId: 'H1' },
  { id: 9, name: 'Kengeri Bus Terminal',    area: 'Kengeri',           lat: 12.9115, lng: 77.4810, isHospital: false },
  { id: 10, name: 'Banashankari Temple (BSK)', area: 'Banashankari',   lat: 12.9150, lng: 77.5730, isHospital: false },
  { id: 11, name: 'Apollo Hospital Bannerghatta', area: 'JP Nagar',    lat: 12.8963, lng: 77.5985, isHospital: true,  hospitalId: 'H5' },
  { id: 12, name: 'JP Nagar Metro Station', area: 'JP Nagar',          lat: 12.9073, lng: 77.5731, isHospital: false },
  { id: 13, name: 'Fortis Hospital Bannerghatta Road', area: 'JP Nagar',lat: 12.8948, lng: 77.5988, isHospital: true,  hospitalId: 'H6' },
];

// ============================================================
// Road Edges (weighted, bidirectional, with traffic multiplier)
// trafficMultiplier: 1.0 = normal, 1.5 = moderate, 2.0 = heavy
// ============================================================
export const EDGES = [
  { id: 'e1',  from: 1, to: 3, weight: 6.2, roadName: 'Uttarahalli-Kumaraswamy Rd',     trafficMultiplier: 1.0 },
  { id: 'e2',  from: 1, to: 5, weight: 1.2, roadName: 'Dr. Vishnuvardhan Road',          trafficMultiplier: 1.0 },
  { id: 'e3',  from: 1, to: 6, weight: 5.8, roadName: 'Kanakapura Main Road',            trafficMultiplier: 1.5 },
  { id: 'e4',  from: 1, to: 8, weight: 7.2, roadName: 'Uttarahalli-RR Nagar Rd',         trafficMultiplier: 1.2 },
  { id: 'e5',  from: 1, to: 9, weight: 3.8, roadName: 'Kengeri-Uttarahalli Main Rd',     trafficMultiplier: 1.0 },
  { id: 'e6',  from: 3, to: 7, weight: 2.8, roadName: 'KS Layout Inner Ring',            trafficMultiplier: 1.3 },
  { id: 'e7',  from: 3, to: 4, weight: 1.5, roadName: '26th Main Road',                  trafficMultiplier: 1.5 },
  { id: 'e8',  from: 3, to: 2, weight: 3.2, roadName: 'Bannerghatta Road Link',          trafficMultiplier: 2.0 },
  { id: 'e9',  from: 7, to: 4, weight: 1.8, roadName: 'Padmanabhanagar-Jayanagar Rd',    trafficMultiplier: 1.2 },
  { id: 'e10', from: 7, to: 2, weight: 4.2, roadName: 'JP Nagar Link Road',              trafficMultiplier: 1.5 },
  { id: 'e11', from: 4, to: 6, weight: 3.5, roadName: 'Jayanagar-Banashankari Rd',       trafficMultiplier: 1.8 },
  { id: 'e13', from: 8, to: 9, weight: 4.8, roadName: 'Kengeri-RR Nagar Highway',        trafficMultiplier: 1.0 },
  { id: 'e14', from: 5, to: 9, weight: 2.9, roadName: 'Uttarahalli-Kengeri Ring Rd',      trafficMultiplier: 1.2 },
  { id: 'e15', from: 10, to: 6, weight: 2.2, roadName: 'Outer Ring Road (BSK)',          trafficMultiplier: 1.5 },
  { id: 'e16', from: 10, to: 2, weight: 2.5, roadName: 'Kanakapura-JP Nagar Rd',          trafficMultiplier: 1.2 },
  { id: 'e17', from: 10, to: 7, weight: 3.0, roadName: 'BSK 2nd Stage Ring Rd',          trafficMultiplier: 1.3 },
  { id: 'e18', from: 11, to: 2, weight: 2.0, roadName: 'Bannerghatta Main Road',          trafficMultiplier: 1.8 },
  { id: 'e19', from: 11, to: 3, weight: 4.5, roadName: 'Arekere-KS Layout Link',          trafficMultiplier: 1.4 },
  { id: 'e20', from: 12, to: 2, weight: 1.2, roadName: 'Kanakapura-JP Nagar Link',       trafficMultiplier: 1.4 },
  { id: 'e21', from: 12, to: 10, weight: 1.8, roadName: 'Sarakki Signal Road', trafficMultiplier: 1.6 },
  { id: 'e22', from: 12, to: 4, weight: 1.5, roadName: 'DSI Road Link', trafficMultiplier: 1.3 },
  { id: 'e23', from: 13, to: 11, weight: 0.8, roadName: 'Bannerghatta Main Road', trafficMultiplier: 1.8 },
  { id: 'e24', from: 13, to: 2, weight: 2.2, roadName: 'JP Nagar 15th Cross Rd', trafficMultiplier: 1.2 },
];

// ============================================================
// Route Coordinates for Mapbox (intermediate points for each edge)
// These make the routes follow actual roads on the map
// ============================================================
export const ROUTE_COORDS = {
  'e1':  [[77.5028, 12.9060], [77.5200, 12.9050], [77.5400, 12.9020], [77.5550, 12.8950]],
  'e2':  [[77.5028, 12.9060], [77.4984, 12.9000], [77.4984, 12.8985]],
  'e3':  [[77.5028, 12.9060], [77.5250, 12.8980], [77.5450, 12.8960], [77.5615, 12.8945]],
  'e4':  [[77.5028, 12.9060], [77.4850, 12.8980], [77.4750, 12.8970], [77.4619, 12.8963]],
  'e5':  [[77.4810, 12.9115], [77.4900, 12.9080], [77.5028, 12.9060]],
  'e6':  [[77.5550, 12.8950], [77.5500, 12.9050], [77.5480, 12.9180]],
  'e7':  [[77.5550, 12.8950], [77.5600, 12.9000], [77.5660, 12.9085]],
  'e8':  [[77.5550, 12.8950], [77.5700, 12.9000], [77.5815, 12.9060]],
  'e9':  [[77.5480, 12.9180], [77.5580, 12.9120], [77.5660, 12.9085]],
  'e10': [[77.5480, 12.9180], [77.5650, 12.9100], [77.5815, 12.9060]],
  'e11': [[77.5660, 12.9085], [77.5630, 12.9000], [77.5615, 12.8945]],
  'e13': [[77.4619, 12.8963], [77.4700, 12.9050], [77.4810, 12.9115]],
  'e14': [[77.4984, 12.8985], [77.4900, 12.9050], [77.4810, 12.9115]],
  'e15': [[77.5730, 12.9150], [77.5680, 12.9050], [77.5615, 12.8945]],
  'e16': [[77.5730, 12.9150], [77.5800, 12.9100], [77.5815, 12.9060]],
  'e17': [[77.5730, 12.9150], [77.5600, 12.9180], [77.5480, 12.9180]],
  'e18': [[77.5985, 12.8963], [77.5900, 12.9020], [77.5815, 12.9060]],
  'e19': [[77.5985, 12.8963], [77.5750, 12.8950], [77.5550, 12.8950]],
  'e20': [[77.5731, 12.9073], [77.5780, 12.9065], [77.5815, 12.9060]],
  'e21': [[77.5731, 12.9073], [77.5730, 12.9110], [77.5730, 12.9150]],
  'e22': [[77.5731, 12.9073], [77.5700, 12.9080], [77.5660, 12.9085]],
  'e23': [[77.5988, 12.8948], [77.5986, 12.8955], [77.5985, 12.8963]],
  'e24': [[77.5988, 12.8948], [77.5900, 12.9000], [77.5815, 12.9060]],
};

// ============================================================
// Hospitals (4 hospitals at specific nodes)
// ============================================================
export const HOSPITALS = [
  {
    id: 'H1',
    name: 'Rajarajeshwari Medical College Hospital (RRMCH)',
    shortName: 'RRMCH Mysore Rd',
    nodeId: 8,
    contact: '080-2843-7400',
    address: 'Mysore Road, near Kengeri, Bangalore - 560074',
    specializations: ['GENERAL', 'TRAUMA', 'MATERNITY'],
    icuBedsTotal: 5,
    icuBedsAvailable: 1,
    generalBedsTotal: 12,
    generalBedsAvailable: 5,
    color: '#ef4444',
  },
  {
    id: 'H2',
    name: 'Sagar Hospitals DSI',
    shortName: 'Sagar DSI',
    nodeId: 4,
    contact: '080-4299-9999',
    address: 'Shavige Malleshwara Hills, Kumaraswamy Layout, Bangalore - 560078',
    specializations: ['TRAUMA', 'BURNS'],
    icuBedsTotal: 8,
    icuBedsAvailable: 3,
    generalBedsTotal: 15,
    generalBedsAvailable: 8,
    color: '#f59e0b',
  },
  {
    id: 'H3',
    name: 'BGS Gleneagles Global Hospital',
    shortName: 'BGS Gleneagles',
    nodeId: 5,
    contact: '080-2625-5555',
    address: '67, Uttarahalli Main Road, Sunkalpalya, Bengaluru, Karnataka - 560060',
    specializations: ['CARDIAC', 'GENERAL', 'MATERNITY'],
    icuBedsTotal: 10,
    icuBedsAvailable: 2,
    generalBedsTotal: 20,
    generalBedsAvailable: 4,
    color: '#10b981',
  },
  {
    id: 'H4',
    name: 'Astra Super Speciality Hospital',
    shortName: 'Astra Hospital',
    nodeId: 6,
    contact: '080-2301-2300',
    address: '21/7, Vasanthapura Main Road, Bikasipura, Konanakunte Cross, Bengaluru, Karnataka - 560062',
    specializations: ['NEURO', 'GENERAL'],
    icuBedsTotal: 6,
    icuBedsAvailable: 4,
    generalBedsTotal: 10,
    generalBedsAvailable: 6,
    color: '#8b5cf6',
  },
  {
    id: 'H5',
    name: 'Apollo Hospital Bannerghatta Road',
    shortName: 'Apollo Bannerghatta',
    nodeId: 11,
    contact: '080-2630-4050',
    address: '154/11, Bannerghatta Road, JP Nagar, Bangalore - 560076',
    specializations: ['CARDIAC', 'NEURO', 'BURNS'],
    icuBedsTotal: 12,
    icuBedsAvailable: 5,
    generalBedsTotal: 25,
    generalBedsAvailable: 11,
    color: '#3b82f6',
  },
  {
    id: 'H6',
    name: 'Fortis Hospital Bannerghatta Road',
    shortName: 'Fortis Bannerghatta',
    nodeId: 13,
    contact: '080-6621-4444',
    address: '154/9, Bannerghatta Road, JP Nagar, Bangalore - 560076',
    specializations: ['CARDIAC', 'TRAUMA', 'NEURO'],
    icuBedsTotal: 10,
    icuBedsAvailable: 4,
    generalBedsTotal: 22,
    generalBedsAvailable: 9,
    color: '#06b6d4',
  },
];

// ============================================================
// Emergency Types
// ============================================================
export const EMERGENCY_TYPES = [
  { type: 'CARDIAC',   label: 'Cardiac',   icon: '❤️',  color: '#ef4444', description: 'Heart attack, cardiac arrest' },
  { type: 'TRAUMA',    label: 'Trauma',    icon: '🩹',  color: '#f97316', description: 'Accident, injury, fracture' },
  { type: 'NEURO',     label: 'Neuro',     icon: '🧠',  color: '#8b5cf6', description: 'Stroke, brain emergency' },
  { type: 'BURNS',     label: 'Burns',     icon: '🔥',  color: '#f59e0b', description: 'Burn injuries' },
  { type: 'MATERNITY', label: 'Maternity', icon: '👶',  color: '#ec4899', description: 'Pregnancy emergency' },
  { type: 'GENERAL',   label: 'General',   icon: '🏥',  color: '#3b82f6', description: 'General emergency' },
];

// ============================================================
// Subject Mapping (VTU 4th Semester)
// ============================================================
export const SUBJECTS = {
  BCS401: { code: 'BCS401', name: 'Analysis & Design of Algorithms', short: 'ADA',  color: '#ef4444', cssClass: 'ada' },
  BCS402: { code: 'BCS402', name: 'OO Concepts with Java',           short: 'OOCJ', color: '#3b82f6', cssClass: 'oocj' },
  BCS403: { code: 'BCS403', name: 'Database Management System',      short: 'DBMS', color: '#f59e0b', cssClass: 'dbms' },
  BCS405B:{ code: 'BCS405B',name: 'Graph Theory & Applications',     short: 'GT',   color: '#8b5cf6', cssClass: 'gt' },
};

// Which subjects each page demonstrates
export const PAGE_SUBJECTS = {
  dashboard:   ['BCS401', 'BCS402', 'BCS403', 'BCS405B'],
  emergency:   ['BCS402', 'BCS403'],
  visualizer:  ['BCS401', 'BCS405B'],
  map:         ['BCS405B', 'BCS401'],
  results:     ['BCS401', 'BCS402'],
  hospitals:   ['BCS403', 'BCS402'],
  erdiagram:   ['BCS403'],
  history:     ['BCS403'],
};

// ============================================================
// Graph Node Positions for SVG Visualization
// Expanded coordinates (0-800, 0-600) to prevent any overlaps
// ============================================================
export const NODE_POSITIONS = {
  1: { x: 280, y: 320 },  // JSSATE College Campus (center-left)
  2: { x: 720, y: 500 },  // JP Nagar 6th Phase (far right, bottom)
  3: { x: 460, y: 440 },  // Kumaraswamy Layout (center-bottom)
  4: { x: 680, y: 160 },  // Sagar Hospitals (right, top)
  5: { x: 180, y: 440 },  // BGS Gleneagles Hospital (left, bottom)
  6: { x: 380, y: 120 },  // Astra Specialty Hospital (center, top)
  7: { x: 580, y: 320 },  // Padmanabhanagar Circle (center-right)
  8: { x: 140, y: 150 },  // RRMCH Mysore Road (far left, top)
  9: { x: 50,  y: 300 },  // Kengeri Bus Terminal (far left, middle)
  10: { x: 620, y: 380 }, // Banashankari Temple BSK
  11: { x: 780, y: 350 }, // Apollo Hospital Bannerghatta
  12: { x: 740, y: 450 }, // JP Nagar Metro Station
  13: { x: 800, y: 280 }, // Fortis Hospital Bannerghatta Road
};

// ============================================================
// Database Schema (for ER Diagram display)
// ============================================================
export const DB_SCHEMA = {
  tables: [
    {
      name: 'patients',
      color: '#3b82f6',
      columns: [
        { name: 'patient_id', type: 'INT', key: 'PK' },
        { name: 'name', type: 'VARCHAR(100)', key: null },
        { name: 'age', type: 'INT', key: null },
        { name: 'contact', type: 'VARCHAR(15)', key: null },
        { name: 'blood_group', type: 'VARCHAR(5)', key: null },
      ]
    },
    {
      name: 'emergency_cases',
      color: '#ef4444',
      columns: [
        { name: 'case_id', type: 'INT', key: 'PK' },
        { name: 'patient_id', type: 'INT', key: 'FK' },
        { name: 'emergency_type', type: 'VARCHAR(20)', key: null },
        { name: 'needs_icu', type: 'BOOLEAN', key: null },
        { name: 'source_location_id', type: 'INT', key: 'FK' },
        { name: 'case_timestamp', type: 'DATETIME', key: null },
      ]
    },
    {
      name: 'hospitals',
      color: '#10b981',
      columns: [
        { name: 'hospital_id', type: 'INT', key: 'PK' },
        { name: 'name', type: 'VARCHAR(150)', key: null },
        { name: 'location_node_id', type: 'INT', key: 'FK' },
        { name: 'contact', type: 'VARCHAR(15)', key: null },
        { name: 'address', type: 'TEXT', key: null },
      ]
    },
    {
      name: 'hospital_specializations',
      color: '#8b5cf6',
      columns: [
        { name: 'spec_id', type: 'INT', key: 'PK' },
        { name: 'hospital_id', type: 'INT', key: 'FK' },
        { name: 'emergency_type', type: 'VARCHAR(20)', key: null },
      ]
    },
    {
      name: 'hospital_resources',
      color: '#f59e0b',
      columns: [
        { name: 'resource_id', type: 'INT', key: 'PK' },
        { name: 'hospital_id', type: 'INT', key: 'FK' },
        { name: 'icu_beds_total', type: 'INT', key: null },
        { name: 'icu_beds_available', type: 'INT', key: null },
        { name: 'general_beds_total', type: 'INT', key: null },
        { name: 'general_beds_available', type: 'INT', key: null },
      ]
    },
    {
      name: 'location_nodes',
      color: '#06b6d4',
      columns: [
        { name: 'node_id', type: 'INT', key: 'PK' },
        { name: 'node_name', type: 'VARCHAR(100)', key: null },
        { name: 'area_name', type: 'VARCHAR(100)', key: null },
      ]
    },
    {
      name: 'road_edges',
      color: '#ec4899',
      columns: [
        { name: 'edge_id', type: 'INT', key: 'PK' },
        { name: 'from_node_id', type: 'INT', key: 'FK' },
        { name: 'to_node_id', type: 'INT', key: 'FK' },
        { name: 'distance_km', type: 'DECIMAL(5,2)', key: null },
        { name: 'is_bidirectional', type: 'BOOLEAN', key: null },
      ]
    },
    {
      name: 'allocations',
      color: '#14b8a6',
      columns: [
        { name: 'allocation_id', type: 'INT', key: 'PK' },
        { name: 'case_id', type: 'INT', key: 'FK' },
        { name: 'hospital_id', type: 'INT', key: 'FK' },
        { name: 'route_cost', type: 'DECIMAL(6,2)', key: null },
        { name: 'is_primary', type: 'BOOLEAN', key: null },
        { name: 'allocated_at', type: 'DATETIME', key: null },
      ]
    },
  ],
  relationships: [
    { from: 'patients', to: 'emergency_cases', label: '1:N', fromCol: 'patient_id', toCol: 'patient_id' },
    { from: 'location_nodes', to: 'emergency_cases', label: '1:N', fromCol: 'node_id', toCol: 'source_location_id' },
    { from: 'location_nodes', to: 'hospitals', label: '1:N', fromCol: 'node_id', toCol: 'location_node_id' },
    { from: 'hospitals', to: 'hospital_specializations', label: '1:N', fromCol: 'hospital_id', toCol: 'hospital_id' },
    { from: 'hospitals', to: 'hospital_resources', label: '1:1', fromCol: 'hospital_id', toCol: 'hospital_id' },
    { from: 'location_nodes', to: 'road_edges', label: '1:N', fromCol: 'node_id', toCol: 'from_node_id' },
    { from: 'emergency_cases', to: 'allocations', label: '1:N', fromCol: 'case_id', toCol: 'case_id' },
    { from: 'hospitals', to: 'allocations', label: '1:N', fromCol: 'hospital_id', toCol: 'hospital_id' },
  ]
};
