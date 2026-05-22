import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DB_SCHEMA } from '../data/cityData.js';

export default function ERDiagram() {
  const [hoveredRelation, setHoveredRelation] = useState(null);
  const [hoveredTable, setHoveredTable] = useState(null);

  // Defined positions for the tables in a 1150x600 space
  const TABLE_POSITIONS = {
    'patients':                 { x: 30,  y: 40,   color: '#3b82f6' },
    'emergency_cases':          { x: 310, y: 40,   color: '#ef4444' },
    'allocations':              { x: 590, y: 40,   color: '#14b8a6' },
    'road_edges':               { x: 870, y: 40,   color: '#ec4899' },
    'location_nodes':           { x: 30,  y: 360,  color: '#06b6d4' },
    'hospitals':                { x: 310, y: 360,  color: '#10b981' },
    'hospital_resources':       { x: 590, y: 360,  color: '#f59e0b' },
    'hospital_specializations': { x: 870, y: 360,  color: '#8b5cf6' },
  };

  // Maps connections with custom curved Bezier paths and labels
  const CONNECTIONS = [
    {
      id: 'rel-1',
      from: 'patients',
      to: 'emergency_cases',
      fromCol: 'patient_id',
      toCol: 'patient_id',
      path: 'M 230 92 C 270 92, 270 116, 310 116',
      label: '1:N',
      desc: 'One patient can have multiple emergency calls'
    },
    {
      id: 'rel-2',
      from: 'location_nodes',
      to: 'emergency_cases',
      fromCol: 'node_id',
      toCol: 'source_location_id',
      path: 'M 230 412 C 280 412, 260 188, 310 188',
      label: '1:N',
      desc: 'One junction can be the source of multiple emergencies'
    },
    {
      id: 'rel-3',
      from: 'location_nodes',
      to: 'hospitals',
      fromCol: 'node_id',
      toCol: 'location_node_id',
      path: 'M 230 412 C 270 412, 270 460, 310 460',
      label: '1:N',
      desc: 'One geographical node hosts multiple medical centers'
    },
    {
      id: 'rel-4',
      from: 'hospitals',
      to: 'hospital_specializations',
      fromCol: 'hospital_id',
      toCol: 'hospital_id',
      path: 'M 510 412 C 580 490, 800 490, 870 436',
      label: '1:N',
      desc: 'One hospital provides multiple emergency services'
    },
    {
      id: 'rel-5',
      from: 'hospitals',
      to: 'hospital_resources',
      fromCol: 'hospital_id',
      toCol: 'hospital_id',
      path: 'M 510 412 C 550 412, 550 436, 590 436',
      label: '1:1',
      desc: 'One hospital is mapped to one resource bed count inventory'
    },
    {
      id: 'rel-6',
      from: 'location_nodes',
      to: 'road_edges',
      fromCol: 'node_id',
      toCol: 'from_node_id',
      path: 'M 130 360 C 130 260, 800 200, 870 116',
      label: '1:N',
      desc: 'One intersection vertices originates multiple road segments'
    },
    {
      id: 'rel-7',
      from: 'emergency_cases',
      to: 'allocations',
      fromCol: 'case_id',
      toCol: 'case_id',
      path: 'M 510 92 C 550 92, 550 116, 590 116',
      label: '1:N',
      desc: 'One emergency maps to one primary and optional backup allocations'
    },
    {
      id: 'rel-8',
      from: 'hospitals',
      to: 'allocations',
      fromCol: 'hospital_id',
      toCol: 'hospital_id',
      path: 'M 410 360 C 410 240, 600 240, 680 140',
      label: '1:N',
      desc: 'One hospital handles multiple emergency allocations over time'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="page-header">
        <h1 className="page-title">Entity-Relationship Diagram</h1>
        <p className="page-subtitle">Interactive Database Schema & Cardinality Connectors</p>
        <div className="subject-badges mt-sm">
          <span className="subject-badge dbms">BCS403 DBMS</span>
        </div>
      </div>

      {/* SVG CANVAS CONTAINER */}
      <div className="er-diagram-container glass-card mb-lg" style={{ overflow: 'visible', position: 'relative' }}>
        <svg 
          viewBox="0 0 1120 580" 
          width="100%" 
          height="100%" 
          style={{ overflow: 'visible', display: 'block' }}
        >
          {/* Arrowhead Markers definitions */}
          <defs>
            <marker 
              id="arrow" 
              viewBox="0 0 10 10" 
              refX="6" 
              refY="5" 
              markerWidth="6" 
              markerHeight="6" 
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--text-muted)" />
            </marker>
            <marker 
              id="arrow-active" 
              viewBox="0 0 10 10" 
              refX="6" 
              refY="5" 
              markerWidth="7" 
              markerHeight="7" 
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--accent-amber)" />
            </marker>
          </defs>

          {/* Draw Relationship Lines */}
          {CONNECTIONS.map(conn => {
            const isHovered = hoveredRelation === conn.id || 
                              hoveredTable === conn.from || 
                              hoveredTable === conn.to;
            return (
              <g 
                key={conn.id} 
                onMouseEnter={() => setHoveredRelation(conn.id)}
                onMouseLeave={() => setHoveredRelation(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Wider invisible backing path for easy hovering */}
                <path 
                  d={conn.path} 
                  fill="none" 
                  stroke="transparent" 
                  strokeWidth="15" 
                />
                {/* Glow layer when active */}
                {isHovered && (
                  <path 
                    d={conn.path} 
                    fill="none" 
                    stroke="var(--accent-amber)" 
                    strokeWidth="5" 
                    strokeOpacity="0.4"
                    style={{ filter: 'blur(2px)' }}
                  />
                )}
                {/* Core connection path line */}
                <path 
                  d={conn.path} 
                  fill="none" 
                  stroke={isHovered ? 'var(--accent-amber)' : 'var(--text-dim)'} 
                  strokeWidth={isHovered ? '2.5' : '1.5'} 
                  strokeDasharray={isHovered ? 'none' : '4 3'}
                  markerEnd={isHovered ? 'url(#arrow-active)' : 'url(#arrow)'}
                  style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
                />
              </g>
            );
          })}

          {/* Draw Table Cards */}
          {DB_SCHEMA.tables.map(table => {
            const pos = TABLE_POSITIONS[table.name];
            const isTableHovered = hoveredTable === table.name || 
                                   (hoveredRelation && 
                                    CONNECTIONS.find(c => c.id === hoveredRelation && 
                                                          (c.from === table.name || c.to === table.name)));
            
            return (
              <g 
                key={table.name} 
                transform={`translate(${pos.x}, ${pos.y})`}
                onMouseEnter={() => setHoveredTable(table.name)}
                onMouseLeave={() => setHoveredTable(null)}
                style={{ transition: 'filter 0.3s' }}
              >
                {/* Card Glow and Shadow Boundary */}
                <rect 
                  width="200" 
                  height={35 + table.columns.length * 24 + 10} 
                  rx="10" 
                  fill="var(--bg-card)" 
                  stroke={isTableHovered ? 'var(--accent-amber)' : pos.color} 
                  strokeWidth={isTableHovered ? '2.5' : '1.5'} 
                  style={{ 
                    filter: isTableHovered ? 'drop-shadow(0 4px 12px rgba(245,158,11,0.25))' : 'drop-shadow(var(--shadow-md))',
                    transition: 'stroke 0.2s, stroke-width 0.2s' 
                  }}
                />

                {/* Header Container */}
                <path 
                  d="M 1 10 Q 1 1 10 1 L 190 1 Q 199 1 199 10 L 199 35 L 1 35 Z" 
                  fill={isTableHovered ? 'var(--accent-amber-glow)' : `${pos.color}18`} 
                />
                
                {/* Header Text */}
                <text 
                  x="100" 
                  y="22" 
                  textAnchor="middle" 
                  style={{ 
                    fontSize: '12px', 
                    fontWeight: 'bold', 
                    fill: isTableHovered ? 'var(--accent-amber)' : pos.color,
                    letterSpacing: '0.04em'
                  }}
                >
                  {table.name.toUpperCase()}
                </text>

                {/* Header Bottom Seam Line */}
                <line 
                  x1="1" 
                  y1="35" 
                  x2="199" 
                  y2="35" 
                  stroke={isTableHovered ? 'var(--accent-amber)' : pos.color} 
                  strokeWidth="1.5" 
                />

                {/* Columns Drawing loop */}
                {table.columns.map((col, idx) => {
                  const ry = 35 + idx * 24 + 16; // baseline coordinate offset
                  return (
                    <g key={col.name}>
                      {/* Alternating row subtle highlighting */}
                      {idx % 2 === 1 && (
                        <rect 
                          x="2" 
                          y={35 + idx * 24 + 2} 
                          width="196" 
                          height="20" 
                          fill="rgba(255, 255, 255, 0.02)" 
                          rx="3" 
                        />
                      )}

                      {/* Primary / Foreign Key Pills */}
                      {col.key === 'PK' && (
                        <rect x="8" y={35 + idx * 24 + 4} width="22" height="15" rx="3" fill="rgba(245, 158, 11, 0.15)" stroke="rgba(245, 158, 11, 0.3)" />
                      )}
                      {col.key === 'PK' && (
                        <text x="19" y={35 + idx * 24 + 15} textAnchor="middle" style={{ fontSize: '8px', fontWeight: 'bold', fill: 'var(--accent-amber)' }}>PK</text>
                      )}

                      {col.key === 'FK' && (
                        <rect x="8" y={35 + idx * 24 + 4} width="22" height="15" rx="3" fill="rgba(59, 130, 246, 0.15)" stroke="rgba(59, 130, 246, 0.3)" />
                      )}
                      {col.key === 'FK' && (
                        <text x="19" y={35 + idx * 24 + 15} textAnchor="middle" style={{ fontSize: '8px', fontWeight: 'bold', fill: 'var(--accent-blue)' }}>FK</text>
                      )}

                      {/* Column Name */}
                      <text 
                        x="38" 
                        y={ry} 
                        style={{ 
                          fontSize: '10.5px', 
                          fontWeight: col.key === 'PK' ? 'bold' : 'normal', 
                          fill: 'var(--text-primary)',
                          fontFamily: 'JetBrains Mono, monospace'
                        }}
                      >
                        {col.name}
                      </text>

                      {/* Column Data Type */}
                      <text 
                        x="192" 
                        y={ry} 
                        textAnchor="end" 
                        style={{ 
                          fontSize: '8.5px', 
                          fill: 'var(--text-muted)',
                          fontFamily: 'JetBrains Mono, monospace'
                        }}
                      >
                        {col.type}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>

        {/* Dynamic Relation Info Panel */}
        {hoveredRelation && (
          <div 
            style={{ 
              position: 'absolute', 
              bottom: 12, 
              right: 12, 
              background: 'var(--bg-glass)', 
              backdropFilter: 'blur(8px)',
              padding: '10px 14px', 
              borderRadius: '8px', 
              border: '1.5px solid var(--accent-amber)', 
              fontSize: '11px',
              maxWidth: '350px',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            <strong style={{ color: 'var(--accent-amber)', display: 'block', marginBottom: '2px' }}>
              🔗 Relationship: {CONNECTIONS.find(c => c.id === hoveredRelation).label}
            </strong>
            <span style={{ color: 'var(--text-secondary)' }}>
              {CONNECTIONS.find(c => c.id === hoveredRelation).desc}
            </span>
          </div>
        )}
      </div>

      <div className="grid-2">
        <div className="glass-card">
          <h3 className="mb-md text-gradient">Schema Relationships Definition</h3>
          <div className="flex flex-col gap-sm" style={{ maxHeight: '250px', overflowY: 'auto' }}>
            {CONNECTIONS.map(conn => {
              const isHovered = hoveredRelation === conn.id;
              return (
                <div 
                  key={conn.id} 
                  onMouseEnter={() => setHoveredRelation(conn.id)}
                  onMouseLeave={() => setHoveredRelation(null)}
                  className="p-sm rounded-lg"
                  style={{ 
                    background: isHovered ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-primary)', 
                    border: isHovered ? '1px solid var(--accent-amber)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  <div className="flex justify-between font-bold text-xs mb-xs">
                    <span style={{ color: isHovered ? 'var(--accent-amber)' : 'var(--text-primary)' }}>
                      {conn.from} ➔ {conn.to}
                    </span>
                    <span className="subject-badge dbms" style={{ padding: '1px 6px' }}>{conn.label}</span>
                  </div>
                  <div className="text-xs text-muted font-mono" style={{ fontSize: '10px' }}>
                    ON {conn.from}.{conn.fromCol} = {conn.to}.{conn.toCol}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="glass-card flex flex-col justify-between">
          <div>
            <h3 className="mb-md text-gradient">Subject Audit & Schema Logs</h3>
            <p className="text-xs text-secondary mb-md" style={{ lineHeight: '1.5' }}>
              The relational tables represent structured vertices and edges designed to enforce database integrity constraints.
              Every SSSP allocation execution performs structured audits in the <code>allocations</code> table, saving coordinates trails and routing metrics for complete forensic trace reviews.
            </p>
          </div>
          
          <div>
            <span className="text-xs font-bold text-muted">Join audit log example query:</span>
            <pre className="font-mono text-xs p-sm rounded bg-black text-accent-green mt-xs" style={{ background: 'rgba(0,0,0,0.4)', padding: '10px', borderRadius: '6px' }}>
{`SELECT a.allocated_at, p.name, h.name, a.route_cost
FROM allocations a
JOIN emergency_cases c ON a.case_id = c.case_id
JOIN patients p ON c.patient_id = p.patient_id
JOIN hospitals h ON a.hospital_id = h.hospital_id
ORDER BY a.allocated_at DESC LIMIT 3;`}
            </pre>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
