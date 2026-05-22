import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Building2, GitBranch, HeartPulse, AlertTriangle, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { locations, hospitals, edges, emergencyTypes, history } = useApp();

  return (
    <motion.div 
      className="dashboard-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Smart Ambulance Routing System Overview</p>
        <div className="subject-badges mt-sm">
          <span className="subject-badge ada">BCS401 ADA</span>
          <span className="subject-badge oocj">BCS402 OOCJ</span>
          <span className="subject-badge dbms">BCS403 DBMS</span>
          <span className="subject-badge gt">BCS405B GT</span>
        </div>
      </div>

      <motion.div className="stats-grid mb-lg" variants={itemVariants}>
        <div className="stat-card">
          <div className="stat-icon purple"><MapPin size={24} /></div>
          <div className="stat-info">
            <div className="stat-value">{locations.length}</div>
            <div className="stat-label">Total Locations</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Building2 size={24} /></div>
          <div className="stat-info">
            <div className="stat-value">{hospitals.length}</div>
            <div className="stat-label">Hospitals</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon cyan"><GitBranch size={24} /></div>
          <div className="stat-info">
            <div className="stat-value">{edges.length}</div>
            <div className="stat-label">Road Connections</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><HeartPulse size={24} /></div>
          <div className="stat-info">
            <div className="stat-value">{emergencyTypes.length}</div>
            <div className="stat-label">Emergency Types</div>
          </div>
        </div>
      </motion.div>

      <motion.div className="grid-3 mb-lg" variants={itemVariants}>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
          <div className="stat-icon red" style={{ width: 64, height: 64 }}><AlertTriangle size={32} /></div>
          <h3>New Emergency</h3>
          <p className="text-muted text-sm">Enter patient details to find the best routing path to a suitable hospital.</p>
          <button className="btn btn-primary w-full mt-auto" onClick={() => navigate('/emergency')}>
            Start <ArrowRight size={16} />
          </button>
        </div>
        
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
          <div className="stat-icon purple" style={{ width: 64, height: 64 }}><GitBranch size={32} /></div>
          <h3>Algorithm Visualizer</h3>
          <p className="text-muted text-sm">Step-by-step visualization of BFS, DFS, Dijkstra, and A* algorithms.</p>
          <button className="btn btn-secondary w-full mt-auto" onClick={() => navigate('/visualizer')}>
            Visualize <ArrowRight size={16} />
          </button>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
          <div className="stat-icon cyan" style={{ width: 64, height: 64 }}><MapPin size={32} /></div>
          <h3>Map View</h3>
          <p className="text-muted text-sm">Real interactive map with ambulance animation along the shortest path.</p>
          <button className="btn btn-cyan w-full mt-auto" onClick={() => navigate('/map')}>
            Open Map <ArrowRight size={16} />
          </button>
        </div>
      </motion.div>

      <motion.h3 className="mb-md" variants={itemVariants}>Hospital Status</motion.h3>
      <motion.div className="hospital-grid mb-lg" variants={itemVariants}>
        {hospitals.map(h => (
          <div key={h.id} className="hospital-card">
            <div className="hospital-name">{h.name}</div>
            <div className="specialization-badges mb-md">
              {h.specializations.map(s => <span key={s} className="spec-badge">{s}</span>)}
            </div>
            <div className="bed-bars">
              <div className="bed-bar">
                <div className="bed-bar-label">
                  <span>ICU Beds</span>
                  <span>{h.icuBedsAvailable} / {h.icuBedsTotal}</span>
                </div>
                <div className="bed-bar-track">
                  <div 
                    className={`bed-bar-fill ${h.icuBedsAvailable > h.icuBedsTotal / 2 ? 'green' : h.icuBedsAvailable > 0 ? 'amber' : 'red'}`} 
                    style={{ width: `${(h.icuBedsAvailable / h.icuBedsTotal) * 100}%` }}
                  />
                </div>
              </div>
              <div className="bed-bar">
                <div className="bed-bar-label">
                  <span>General Beds</span>
                  <span>{h.generalBedsAvailable} / {h.generalBedsTotal}</span>
                </div>
                <div className="bed-bar-track">
                  <div 
                    className={`bed-bar-fill ${h.generalBedsAvailable > h.generalBedsTotal / 2 ? 'green' : h.generalBedsAvailable > 0 ? 'amber' : 'red'}`} 
                    style={{ width: `${(h.generalBedsAvailable / h.generalBedsTotal) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      <motion.h3 className="mb-md" variants={itemVariants}>Recent History</motion.h3>
      <motion.div variants={itemVariants}>
        {history.length === 0 ? (
          <div className="glass-card-static text-center text-muted py-lg">
            No emergency records yet.
          </div>
        ) : (
          <div className="timeline">
            {history.slice(0, 3).map((item) => (
              <div key={item.id} className="timeline-item">
                <div className="text-xs text-muted mb-sm">{new Date(item.timestamp).toLocaleString()}</div>
                <div className="font-bold">{item.patientName} - {item.emergencyType} {item.needsIcu && '(ICU)'}</div>
                <div className="text-sm mt-sm">Routed to: <span className="text-accent-green">{item.primaryHospital}</span></div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

    </motion.div>
  );
}
