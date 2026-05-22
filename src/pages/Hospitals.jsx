import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext.jsx';

export default function Hospitals() {
  const { hospitals, updateBeds } = useApp();

  return (
    <motion.div 
      className="hospitals-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="page-header">
        <h1 className="page-title">Hospital Management</h1>
        <p className="page-subtitle">Manage hospital resources and availability</p>
        <div className="subject-badges mt-sm">
          <span className="subject-badge dbms">BCS403 DBMS</span>
          <span className="subject-badge oocj">BCS402 OOCJ</span>
        </div>
      </div>

      <div className="hospital-grid mb-lg">
        {hospitals.map(h => (
          <div key={h.id} className="hospital-card">
            <div className="hospital-name">{h.name}</div>
            <div className="hospital-location mb-md">
              <span className="text-muted">{h.address}</span>
            </div>
            
            <div className="specialization-badges mb-lg">
              {h.specializations.map(s => <span key={s} className="spec-badge">{s}</span>)}
            </div>

            <h4 className="text-sm mb-md text-muted uppercase">Resource Allocation</h4>
            
            <div className="bed-bars">
              <div className="bed-bar">
                <div className="bed-bar-label">
                  <span>ICU Beds</span>
                  <div className="flex gap-sm">
                    <button className="btn-icon" style={{width: 24, height: 24}} onClick={() => updateBeds(h.id, 'icuBedsAvailable', h.icuBedsAvailable - 1)} disabled={h.icuBedsAvailable <= 0}>-</button>
                    <span>{h.icuBedsAvailable} / {h.icuBedsTotal}</span>
                    <button className="btn-icon" style={{width: 24, height: 24}} onClick={() => updateBeds(h.id, 'icuBedsAvailable', h.icuBedsAvailable + 1)} disabled={h.icuBedsAvailable >= h.icuBedsTotal}>+</button>
                  </div>
                </div>
                <div className="bed-bar-track">
                  <div 
                    className={`bed-bar-fill ${h.icuBedsAvailable > h.icuBedsTotal / 2 ? 'green' : h.icuBedsAvailable > 0 ? 'amber' : 'red'}`} 
                    style={{ width: `${(h.icuBedsAvailable / h.icuBedsTotal) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bed-bar mt-md">
                <div className="bed-bar-label">
                  <span>General Beds</span>
                  <div className="flex gap-sm">
                    <button className="btn-icon" style={{width: 24, height: 24}} onClick={() => updateBeds(h.id, 'generalBedsAvailable', h.generalBedsAvailable - 1)} disabled={h.generalBedsAvailable <= 0}>-</button>
                    <span>{h.generalBedsAvailable} / {h.generalBedsTotal}</span>
                    <button className="btn-icon" style={{width: 24, height: 24}} onClick={() => updateBeds(h.id, 'generalBedsAvailable', h.generalBedsAvailable + 1)} disabled={h.generalBedsAvailable >= h.generalBedsTotal}>+</button>
                  </div>
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
      </div>

      <div className="glass-card-static">
        <h3>Database Normalization Info (DBMS)</h3>
        <p className="text-muted mt-md mb-md">How hospital data is structured in our database following normal forms:</p>
        <ul className="text-sm text-secondary" style={{ marginLeft: '20px', lineHeight: '1.8' }}>
          <li><strong>1NF (First Normal Form):</strong> All attributes contain atomic values. Specializations are separated into their own table rather than a comma-separated list.</li>
          <li><strong>2NF (Second Normal Form):</strong> All non-key attributes are fully functionally dependent on the primary key. Location details depend on location_id, not hospital_id.</li>
          <li><strong>3NF (Third Normal Form):</strong> No transitive dependencies. Hospital resources (beds) are separated from the main hospital entity into a 1:1 relationship.</li>
        </ul>
      </div>
    </motion.div>
  );
}
