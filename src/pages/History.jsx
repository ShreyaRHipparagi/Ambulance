import React from 'react';
import { motion } from 'framer-motion';
import { History as HistoryIcon, MapPin, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

export default function HistoryPage() {
  const { history, locations, clearHistory } = useApp();

  const getLocationName = (id) => {
    const loc = locations.find(l => l.id === id);
    return loc ? loc.name : `Location ${id}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Emergency History</h1>
            <p className="page-subtitle">Past allocations and routing records — persisted across sessions</p>
          </div>
          {history.length > 0 && (
            <button
              onClick={() => { if (window.confirm('Clear all emergency history?')) clearHistory(); }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
            >
              <Trash2 size={13} /> Clear History
            </button>
          )}
        </div>
        <div className="subject-badges mt-sm">
          <span className="subject-badge dbms">BCS403 DBMS</span>
        </div>
      </div>

      <div className="glass-card-static" style={{ minHeight: '60vh' }}>
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-xl">
            <div className="stat-icon purple mb-md" style={{ width: 80, height: 80 }}>
              <HistoryIcon size={40} />
            </div>
            <h3 className="mb-sm">No emergency records yet</h3>
            <p className="text-muted text-sm max-w-md">
              Run your first emergency case from the dashboard or new emergency page to see routing history here.
            </p>
          </div>
        ) : (
          <div className="timeline mt-md">
            {history.map((record) => (
              <div key={record.id} className="timeline-item">
                <div className="flex justify-between items-center mb-md border-bottom pb-sm">
                  <div className="font-mono text-sm text-muted">
                    {new Date(record.timestamp).toLocaleString()}
                  </div>
                  <div className="subject-badge" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
                    Algorithm: {record.algorithm}
                  </div>
                </div>
                
                <div className="grid-2 gap-md">
                  <div>
                    <h4 className="text-md mb-sm">{record.patientName}</h4>
                    <div className="text-sm text-secondary mb-xs">
                      <strong>Type:</strong> <span className="text-accent-red">{record.emergencyType}</span>
                    </div>
                    <div className="text-sm text-secondary mb-xs">
                      <strong>Requirement:</strong> {record.needsIcu ? 'ICU Bed' : 'General Bed'}
                    </div>
                    <div className="text-sm text-secondary mt-md flex items-center gap-xs">
                      <MapPin size={14} className="text-accent-purple" /> 
                      From: {getLocationName(record.sourceNodeId)}
                    </div>
                  </div>
                  
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
                    <div className="text-sm mb-xs">
                      <span className="text-muted">Primary:</span> <strong className="text-accent-green">{record.primaryHospital}</strong>
                    </div>
                    <div className="text-sm mb-md">
                      <span className="text-muted">Backup:</span> <span className="text-accent-amber">{record.backupHospital}</span>
                    </div>
                    <div className="font-mono text-xs text-accent-cyan flex items-center gap-sm">
                      Distance: {record.routeCost.toFixed(2)} km
                    </div>
                    <div className="font-mono text-xs text-muted mt-xs flex items-center gap-xs">
                      Path: {record.path.join(' → ')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
