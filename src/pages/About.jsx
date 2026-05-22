import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, GraduationCap, Code2, Award } from 'lucide-react';
import { SUBJECTS } from '../data/cityData.js';

export default function About() {
  const academicTopics = [
    {
      subject: SUBJECTS.BCS401, // ADA
      desc: 'Analysis and Design of Algorithms governs SSSP engines, heuristic modeling, and asymptotic time complexity analyses.',
      concepts: [
        {
          name: 'Single-Source Shortest Paths (SSSP)',
          details: 'Implemented via Dijkstra\'s algorithm to find the absolute shortest driving path from any emergency location node to appropriate hospital vertices, dynamically adjusted for traffic density.',
          files: ['/src/engine/DijkstraEngine.js']
        },
        {
          name: 'Heuristic Search Optimization (A*)',
          details: 'A* Search extends Dijkstra by incorporating straight-line geographical GPS distance heuristics h(n) to target nodes, dramatically pruning the evaluation vertex space and minimizing exploration iterations.',
          files: ['/src/engine/AStarEngine.js']
        },
        {
          name: 'Asymptotic Analysis & Priority Queues',
          details: 'Min-Heap Priority Queue structure bounds SSSP complexity to O((V+E) log V). Heap sorting and binary tree parent indexing are computed in JavaScript to guarantee sub-millisecond response rates.',
          files: ['/src/engine/PriorityQueue.js']
        }
      ],
      theory: 'SSSP complexity is bounded by O((V + E) \\log V) using a binary heap, where V represents intersection vertices and E represents bidirectional road edges.'
    },
    {
      subject: SUBJECTS.BCS405B, // GT
      desc: 'Graph Theory & Applications models Bangalore spatial geographies as nodes and edges to compute network reachability.',
      concepts: [
        {
          name: 'Vertices & Weighted Bidirectional Edges',
          details: 'The spatial grid represents locations as coordinate vertices (GPS Lat/Lng pairs) and roads as weighted bidirectional edges. Road edge weights represent real-world driving distance in kilometers.',
          files: ['/src/data/cityData.js']
        },
        {
          name: 'Adjacency-List Representation',
          details: 'The network is instantiated via a custom topological CityGraph using highly efficient key-value adjacency lists (Map/Set maps) to store outgoing neighbors, speeds, and traffic multipliers.',
          files: ['/src/engine/CityGraph.js']
        },
        {
          name: 'Breadth-First and Depth-First Visuals',
          details: 'Topological connectivity, BFS search (shortest paths on unweighted graphs), and DFS backtracking are visualized step-by-step, validating vertex degrees and topological reachability.',
          files: ['/src/engine/BFSEngine.js', '/src/engine/DFSEngine.js']
        }
      ],
      theory: 'Graph connectivity represents topological completeness. G = (V, E) spatial model maps JSSATE Uttarahalli, Banashankari, Sagar Hospitals, RRMCH, and JP Nagar.'
    },
    {
      subject: SUBJECTS.BCS403, // DBMS
      desc: 'Database Management Systems models relational schemas, enforces foreign key integrity, and handles path logs audits.',
      concepts: [
        {
          name: 'Entity-Relationship Schemas',
          details: 'A relational model consisting of 8 tables (Patients, Emergencies, Allocations, Nodes, Edges, Specializations, Resources) designed to enforce data integrity constraints.',
          files: ['/src/pages/ERDiagram.jsx']
        },
        {
          name: 'Historical Allocation Audit Trails',
          details: 'Emergency path allocations, patient metrics, recommended hospitals, and calculated SSSP costs are recorded to simulate a persistent database log for forensic audit tracing.',
          files: ['/src/pages/History.jsx']
        },
        {
          name: 'SQL Relational Queries & Joins',
          details: 'Simulated SQL queries demonstrate relational algebraic joins (INNER JOIN, LEFT JOIN) combining specialized bed availability datasets with primary SSSP patient records.',
          files: ['/src/pages/ERDiagram.jsx']
        }
      ],
      theory: 'Foreign key constraints prevent orphaned allocation indices. ON emergency_cases.patient_id = patients.patient_id ensures relational structural completeness.'
    },
    {
      subject: SUBJECTS.BCS402, // OOCJ
      desc: 'Object Oriented Concepts with Java / JS OOP encapsulates domain logic, decoupling rendering from algorithm calculations.',
      concepts: [
        {
          name: 'Encapsulation & Domain Separation',
          details: 'Decoupled architectural components separate clean mathematical computation engines (A*, Dijkstra) from UI rendering modules (Vite, React, Mapbox components).',
          files: ['/src/context/AppContext.jsx']
        },
        {
          name: 'Class Modeling & Composition',
          details: 'Topological structures are built using strict OOP class instances (Graph, Edge, Node definitions) with private encapsulation and getter/setter method APIs.',
          files: ['/src/engine/CityGraph.js', '/src/engine/RecommendationService.js']
        },
        {
          name: 'State Encapsulation & Context Hooks',
          details: 'Global states, theme modes (Light/Dark transitions), and active emergency result structures are stored in AppProvider context hooks, providing singletons pattern access.',
          files: ['/src/context/AppContext.jsx']
        }
      ],
      theory: 'OOP encapsulation models single responsibility. CityGraph class acts as the single source of truth for topological mutations.'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="page-header">
        <h1 className="page-title">
          <GraduationCap size={36} className="text-accent-amber" />
          Academic Syllabus Map
        </h1>
        <p className="page-subtitle">Mapping VTU 4th Semester Computer Science Syllabus to Smart Ambulance Implementation</p>
      </div>

      {/* CORE MAPPING CAROUSEL / DETAIL CARD */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {academicTopics.map(topic => (
          <div key={topic.subject.code} className="glass-card" style={{ borderLeft: `5px solid ${topic.subject.color}` }}>
            <div className="flex justify-between items-center mb-md" style={{ flexWrap: 'wrap', gap: '12px' }}>
              <div className="flex items-center gap-sm">
                <span className={`subject-badge ${topic.subject.cssClass}`} style={{ fontSize: '0.9rem', padding: '4px 14px' }}>
                  {topic.subject.code} {topic.subject.short}
                </span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{topic.subject.name}</h2>
              </div>
              <div className="flex items-center gap-xs text-xs text-muted font-bold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <Award size={14} className="text-accent-amber" /> VTU Core Integration
              </div>
            </div>

            <p className="text-sm text-secondary mb-lg" style={{ lineHeight: '1.6' }}>
              {topic.desc}
            </p>

            <h4 className="mb-sm text-xs font-bold text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>Core Architectural Components</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }} className="mb-lg">
              {topic.concepts.map(concept => (
                <div key={concept.name} className="p-md rounded-xl" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', justifyContent: 'between' }}>
                  <div>
                    <h5 className="flex items-center gap-xs text-sm font-bold text-primary mb-xs">
                      <Code2 size={16} style={{ color: topic.subject.color }} />
                      {concept.name}
                    </h5>
                    <p className="text-xs text-secondary mb-md" style={{ lineHeight: '1.5' }}>
                      {concept.details}
                    </p>
                  </div>
                  <div className="mt-auto">
                    <span className="text-xs font-bold text-muted" style={{ display: 'block', marginBottom: '4px', fontSize: '9px', textTransform: 'uppercase' }}>Mapped Files:</span>
                    <div className="flex flex-col gap-xs">
                      {concept.files.map(f => (
                        <div key={f} className="font-mono text-xs p-xs rounded" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', color: topic.subject.color, fontSize: '10px' }}>
                          {f.substring(f.lastIndexOf('/') + 1)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-md rounded-xl" style={{ background: 'rgba(245, 158, 11, 0.04)', border: '1px dashed rgba(245, 158, 11, 0.3)', fontSize: '11.5px', display: 'flex', gap: '12px', alignItems: 'start' }}>
              <span style={{ fontSize: '20px' }}>📘</span>
              <div>
                <strong style={{ color: 'var(--accent-amber)', display: 'block', marginBottom: '3px' }}>Academic Theory Application:</strong>
                <span className="font-mono text-secondary" style={{ lineHeight: '1.4' }}>{topic.theory}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
