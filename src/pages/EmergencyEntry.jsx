import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

export default function EmergencyEntry() {
  const navigate = useNavigate();
  const { locations, emergencyTypes, runRecommendation, trafficEnabled, setTrafficEnabled } = useApp();

  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    contact: '',
    bloodGroup: 'A+',
    sourceLocationId: locations[0].id,
    emergencyType: 'CARDIAC',
    needsIcu: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.patientName) {
      alert("Please enter patient name");
      return;
    }
    
    // Call the engine
    runRecommendation({
      sourceNodeId: parseInt(formData.sourceLocationId),
      emergencyType: formData.emergencyType,
      needsIcu: formData.needsIcu,
      patientName: formData.patientName,
      useTraffic: trafficEnabled
    });
    
    navigate('/results');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="page-header">
        <h1 className="page-title">New Emergency Case</h1>
        <p className="page-subtitle">Enter details to find the best hospital route.</p>
        <div className="subject-badges mt-sm">
          <span className="subject-badge oocj">BCS402 OOCJ</span>
          <span className="subject-badge dbms">BCS403 DBMS</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-card-static" style={{ maxWidth: 800, margin: '0 auto' }}>
        <h3 className="mb-lg border-bottom pb-sm">Patient Information</h3>
        
        <div className="grid-2 mb-md">
          <div className="form-group">
            <label className="form-label">Patient Name</label>
            <input 
              type="text" 
              className="form-input" 
              value={formData.patientName}
              onChange={e => setFormData({...formData, patientName: e.target.value})}
              required 
              placeholder="e.g. John Doe"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Age</label>
            <input 
              type="number" 
              className="form-input" 
              value={formData.age}
              onChange={e => setFormData({...formData, age: e.target.value})}
              placeholder="e.g. 45"
            />
          </div>
        </div>

        <div className="grid-2 mb-lg">
          <div className="form-group">
            <label className="form-label">Contact</label>
            <input 
              type="text" 
              className="form-input" 
              value={formData.contact}
              onChange={e => setFormData({...formData, contact: e.target.value})}
              placeholder="Phone number"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Blood Group</label>
            <select 
              className="form-select"
              value={formData.bloodGroup}
              onChange={e => setFormData({...formData, bloodGroup: e.target.value})}
            >
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>
        </div>

        <h3 className="mb-lg border-bottom pb-sm">Emergency Details</h3>
        
        <div className="form-group mb-lg">
          <label className="form-label">Source Location</label>
          <select 
            className="form-select"
            value={formData.sourceLocationId}
            onChange={e => setFormData({...formData, sourceLocationId: e.target.value})}
          >
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name} ({loc.area})</option>
            ))}
          </select>
        </div>

        <div className="form-group mb-lg">
          <label className="form-label mb-md">Emergency Type</label>
          <div className="emergency-type-grid">
            {emergencyTypes.map(type => (
              <div 
                key={type.type}
                className={`emergency-type-card ${formData.emergencyType === type.type ? 'selected' : ''}`}
                onClick={() => setFormData({...formData, emergencyType: type.type})}
              >
                <span className="icon">{type.icon}</span>
                <span className="label">{type.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid-2 mb-xl">
          <div className="form-group">
            <label className="form-label mb-sm">Requires ICU?</label>
            <div className="form-toggle" onClick={() => setFormData({...formData, needsIcu: !formData.needsIcu})}>
              <div className={`toggle-track ${formData.needsIcu ? 'active' : ''}`}>
                <div className="toggle-thumb" />
              </div>
              <span className="text-sm font-bold">{formData.needsIcu ? 'Yes, ICU Needed' : 'No, General Ward OK'}</span>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label mb-sm">Consider Live Traffic?</label>
            <div className="form-toggle" onClick={() => setTrafficEnabled(!trafficEnabled)}>
              <div className={`toggle-track ${trafficEnabled ? 'active' : ''}`}>
                <div className="toggle-thumb" />
              </div>
              <span className="text-sm font-bold">{trafficEnabled ? 'Traffic Multipliers Active' : 'Distance Only'}</span>
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-lg w-full" style={{ justifyContent: 'center' }}>
          Find Best Hospital & Route
        </button>
      </form>
    </motion.div>
  );
}
