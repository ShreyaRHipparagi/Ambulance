import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, AlertTriangle, GitBranch, Map, ClipboardCheck,
  Building2, Database, History, ChevronLeft, ChevronRight, Ambulance,
  Menu, X, Sun, Moon, GraduationCap
} from 'lucide-react';

import { useApp } from './context/AppContext.jsx';
import Dashboard from './pages/Dashboard.jsx';
import EmergencyEntry from './pages/EmergencyEntry.jsx';
import AlgorithmVisualizer from './pages/AlgorithmVisualizer.jsx';
import MapView from './pages/MapView.jsx';
import Results from './pages/Results.jsx';
import Hospitals from './pages/Hospitals.jsx';
import ERDiagram from './pages/ERDiagram.jsx';
import HistoryPage from './pages/History.jsx';
import About from './pages/About.jsx';
import './App.css';

const NAV_ITEMS = [
  { path: '/',            icon: LayoutDashboard, label: 'Dashboard',   color: '#3b82f6' },
  { path: '/emergency',   icon: AlertTriangle,   label: 'Emergency',   color: '#ef4444' },
  { path: '/visualizer',  icon: GitBranch,       label: 'Algorithms',  color: '#8b5cf6' },
  { path: '/map',         icon: Map,             label: 'Map View',    color: '#06b6d4' },
  { path: '/results',     icon: ClipboardCheck,  label: 'Results',     color: '#10b981' },
  { path: '/hospitals',   icon: Building2,       label: 'Hospitals',   color: '#f59e0b' },
  { path: '/erdiagram',   icon: Database,        label: 'ER Diagram',  color: '#ec4899' },
  { path: '/history',     icon: History,         label: 'History',     color: '#14b8a6' },
  { path: '/about',       icon: GraduationCap,   label: 'Syllabus Map',color: '#f59e0b' },
];

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useApp();

  const currentNav = NAV_ITEMS.find(n => n.path === location.pathname) || NAV_ITEMS[0];

  return (
    <div className="app-layout">
      {/* Mobile menu button */}
      <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo" onClick={() => navigate('/')}>
          <div className="logo-icon">
            <Ambulance size={24} />
          </div>
          {!sidebarCollapsed && (
            <div className="logo-text">
              <span className="logo-title">Ambulance</span>
              <span className="logo-subtitle">Smart Routing</span>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => { navigate(item.path); setMobileMenuOpen(false); }}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <div className="nav-icon" style={{ color: isActive ? item.color : undefined }}>
                  <Icon size={20} />
                </div>
                {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
                {isActive && <div className="nav-indicator" style={{ background: item.color }} />}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>

      {/* Main Content */}
      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Header */}
        <header className="app-header">
          <div className="header-left">
            <h2 className="header-title">{currentNav.label}</h2>
          </div>
          <div className="header-right">
            <button 
              className="btn-icon theme-toggle" 
              onClick={toggleTheme} 
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              style={{
                borderRadius: '50%',
                background: 'var(--bg-tertiary)',
                borderColor: 'var(--border-subtle)',
                color: theme === 'dark' ? 'var(--accent-amber)' : 'var(--accent-purple)',
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="emergency-indicator">
              <span className="pulse-dot" />
              <span className="indicator-text">System Active</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="page-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <Routes location={location}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/emergency" element={<EmergencyEntry />} />
                <Route path="/visualizer" element={<AlgorithmVisualizer />} />
                <Route path="/map" element={<MapView />} />
                <Route path="/results" element={<Results />} />
                <Route path="/hospitals" element={<Hospitals />} />
                <Route path="/erdiagram" element={<ERDiagram />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/about" element={<About />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile overlay */}
      {mobileMenuOpen && <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />}
    </div>
  );
}
