import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

export default function Results() {
  const navigate = useNavigate();
  const { emergencyResult, emergencyRequest, locations } = useApp();

  if (!emergencyResult) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-2xl">
        <AlertTriangle size={64} className="text-accent-amber mb-lg opacity-50" />
        <h2 className="mb-md">No Results Available</h2>
        <p className="text-muted mb-lg max-w-md">Submit a new emergency case to see the hospital recommendation and routing results here.</p>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/emergency')}>
          New Emergency Case
        </button>
      </div>
    );
  }

  const { primary, backup, filterSteps, explanation } = emergencyResult;
  const sourceName = locations.find(l => l.id === emergencyRequest.sourceNodeId)?.name || 'Source';

  const renderPath = (path) => (
    <div className="route-path">
      {path.map((nodeId, idx) => {
        const isSource = idx === 0;
        const isTarget = idx === path.length - 1;
        const className = `route-node ${isSource ? 'source' : ''} ${isTarget ? 'target' : ''}`;
        return (
          <React.Fragment key={idx}>
            <span className={className}>Node {nodeId}</span>
            {idx < path.length - 1 && <span className="route-arrow">→</span>}
          </React.Fragment>
        );
      })}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="page-header">
        <h1 className="page-title">Recommendation Results</h1>
        <p className="page-subtitle">Optimal hospital allocation based on your criteria</p>
        <div className="subject-badges mt-sm">
          <span className="subject-badge ada">BCS401 ADA</span>
          <span className="subject-badge oocj">BCS402 OOCJ</span>
        </div>
      </div>

      <div className="glass-card-static mb-lg flex justify-between items-center bg-black bg-opacity-20 border-accent-blue">
        <div>
          <div className="text-xs text-muted font-bold uppercase mb-xs">Patient Case</div>
          <div className="text-lg font-bold">{emergencyRequest.patientName} <span className="text-muted font-normal text-sm">({emergencyRequest.emergencyType} • {emergencyRequest.needsIcu ? 'ICU' : 'General Ward'})</span></div>
          <div className="text-sm text-secondary mt-xs flex items-center gap-xs">
            <MapPin size={14} className="text-accent-red" /> {sourceName}
          </div>
        </div>
        <div className="flex gap-sm">
          <button className="btn btn-cyan" onClick={() => navigate('/map')}>View on Map</button>
          <button className="btn btn-secondary" onClick={() => navigate('/visualizer')}>Visualize Algorithm</button>
        </div>
      </div>

      <div className="grid-2 mb-xl">
        {primary ? (
          <div className="result-primary">
            <h2 className="mb-xs text-accent-green">{primary.hospital.name}</h2>
            <p className="text-sm text-muted mb-md flex items-center gap-xs">
              <MapPin size={14} /> {primary.hospital.address}
            </p>
            
            <div className="flex gap-sm mb-lg">
              {primary.hospital.specializations.map(s => <span key={s} className="spec-badge bg-black">{s}</span>)}
            </div>

            <div className="grid-2 gap-md mb-lg p-md rounded bg-black bg-opacity-30">
              <div>
                <div className="text-xs text-muted mb-xs">Estimated Time</div>
                <div className="text-xl font-bold font-mono text-accent-cyan flex items-center gap-sm">
                  <Clock size={20} />
                  {/* ETA: emergency vehicles average 50 km/h in Bangalore with priority */}
                  {Math.round((primary.cost / 50) * 60)} min
                </div>
              </div>
              <div>
                <div className="text-xs text-muted mb-xs">Route Distance</div>
                <div className="text-xl font-bold font-mono">
                  {primary.cost.toFixed(2)} km
                </div>
              </div>
            </div>

            <h4 className="text-sm mb-sm text-muted uppercase">Shortest Path Found</h4>
            {renderPath(primary.path)}
            
            <div className="mt-md p-md border border-accent-green rounded bg-accent-green bg-opacity-10 text-sm">
              <strong>Why this hospital?</strong> {explanation}
            </div>
            
            <div className="mt-lg flex items-center gap-sm text-sm font-bold bg-white text-black p-sm rounded justify-center" style={{cursor:'pointer'}}>
              <Phone size={16} /> Call {primary.hospital.contact}
            </div>
          </div>
        ) : (
          <div className="result-primary border-accent-red">
            <h2 className="text-accent-red mb-md">No Suitable Hospital Found</h2>
            <p>{explanation}</p>
          </div>
        )}

        <div className="flex flex-col gap-lg">
          {backup && (
            <div className="result-backup">
              <div className="text-xs font-bold text-accent-amber uppercase mb-sm">Backup Option</div>
              <h3 className="mb-xs">{backup.hospital.name}</h3>
              <div className="text-sm text-muted mb-md">{backup.hospital.address}</div>
              <div className="font-mono text-sm mb-sm text-accent-cyan">Distance: {backup.cost.toFixed(2)} km</div>
              {renderPath(backup.path)}
            </div>
          )}

          <div className="glass-card-static flex-1">
            <h3 className="mb-md">Algorithm Filtering Steps</h3>
            <div className="timeline" style={{ paddingLeft: 20 }}>
              {filterSteps.map((step, i) => (
                <div key={i} className="timeline-item" style={{ padding: '12px', marginBottom: '16px' }}>
                  <div className="font-bold text-accent-purple text-sm mb-xs">{step.step}</div>
                  <div className="text-xs text-muted mb-sm">{step.description}</div>
                  <div className="text-sm">
                    Remaining: <strong className="text-accent-cyan">{step.count}</strong> hospitals
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
