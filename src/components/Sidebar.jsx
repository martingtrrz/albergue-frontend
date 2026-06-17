import React from 'react';
import logoAlbergue from '../assets/logoSLRC.png';
import imagenDefault from '../assets/usuarioVacio.png';

export default function Sidebar({ 
  totalCount, 
  capacity = 50, 
  currentView, 
  onViewChange, 
  sortBy, 
  onSortChange, 
  searchQuery, 
  onSearchChange 
}) {
  const isArchivedView = currentView.name === 'archived';

  return (
    <aside className="app-sidebar">
      {/* Capacity Indicator Widget */}
      <div style={styles.cardWidget}>
        <h3 style={styles.widgetTitle}>Capacidad Albergue</h3>
        <div style={styles.gaugeContainer} className="hide-on-mobile-gauge">
          <div style={styles.circleBg}>
            <div style={styles.circleValue}>
              <span style={styles.countText}>{totalCount}</span>
              <span style={styles.limitText}>/ {capacity}</span>
            </div>
            {/* SVG circle stroke animation */}
            <svg style={styles.svgRing} viewBox="0 0 36 36">
              <path
                style={styles.ringTrack}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                style={{
                  ...styles.ringFill,
                  strokeDasharray: `${(totalCount / capacity) * 100}, 100`,
                  stroke: totalCount >= capacity ? 'var(--error-color)' : 'var(--primary-dark)'
                }}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
        </div>
        <p style={styles.capacityLabel}>
          {totalCount >= capacity ? 'Cupo completo' : `Espacios libres: ${capacity - totalCount}`}
        </p>
      </div>

      {/* Search Input Widget */}
      <div style={styles.widget}>
        <label htmlFor="sidebar-search" style={styles.label}>Buscar Residente</label>
        <div style={styles.searchContainer}>
          <input
            id="sidebar-search"
            type="text"
            placeholder="Nombre, país, ID familiar..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={styles.searchInput}
          />
          <svg style={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
      </div>

      {/* Sort Widget (Only useful in list views) */}
      {(currentView.name === 'dashboard' || isArchivedView) && (
        <div style={styles.widget}>
          <label style={styles.label}>Ordenar Por:</label>
          <div style={styles.sortGrid}>
            {[
              { id: 'nacionalidad', label: 'Nacionalidad' },
              { id: 'antiguedad', label: 'Antigüedad' },
              { id: 'sexo', label: 'Sexo' },
              { id: 'familia', label: 'Familia' }
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => onSortChange(option.id)}
                style={{
                  ...styles.sortBtn,
                  backgroundColor: sortBy === option.id ? 'var(--primary-dark)' : 'var(--surface-color)',
                  color: sortBy === option.id ? 'var(--text-light)' : 'var(--text-secondary)',
                  borderColor: sortBy === option.id ? 'var(--primary-dark)' : 'var(--border-color)',
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Primary Actions Widget */}
      <div style={styles.actionsWidget} className="sidebar-actions">
        <button
          onClick={() => onViewChange({ name: 'register' })}
          disabled={totalCount >= capacity}
          style={{
            ...styles.actionBtn,
            backgroundColor: '#2e7d32', // Clean Material Green for "Dar de Alta"
            color: '#ffffff',
            opacity: totalCount >= capacity ? 0.6 : 1,
            cursor: totalCount >= capacity ? 'not-allowed' : 'pointer',
          }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Dar de Alta
        </button>

        {isArchivedView ? (
          <button
            onClick={() => onViewChange({ name: 'dashboard' })}
            style={{
              ...styles.actionBtn,
              backgroundColor: 'var(--primary-dark)',
              color: 'var(--text-light)',
            }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="9" />
              <rect x="14" y="3" width="7" height="5" />
              <rect x="14" y="12" width="7" height="9" />
              <rect x="3" y="16" width="7" height="5" />
            </svg>
            Ver Activos
          </button>
        ) : (
          <button
            onClick={() => onViewChange({ name: 'archived' })}
            style={{
              ...styles.actionBtn,
              backgroundColor: '#c62828', // Darker Red for Archived button to denote backup / out-of-shelter
              color: '#ffffff',
            }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="21 8 21 21 3 21 3 8" />
              <rect x="1" y="3" width="22" height="5" />
              <line x1="10" y1="12" x2="14" y2="12" />
            </svg>
            Archivados
          </button>
        )}
      </div>
    </aside>
  );
}

const styles = {
 
  cardWidget: {
    backgroundColor: 'var(--surface-color)',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: 'var(--card-shadow)',
    textAlign: 'center',
  },
  widgetTitle: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '16px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  gaugeContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '12px',
  },
  circleBg: {
    position: 'relative',
    width: '120px',
    height: '120px',
  },
  circleValue: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  countText: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    lineHeight: '1',
  },
  limitText: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  svgRing: {
    width: '100%',
    height: '100%',
    transform: 'rotate(-90deg)',
  },
  ringTrack: {
    fill: 'none',
    stroke: 'rgba(0, 150, 143, 0.15)',
    strokeWidth: 2.8,
  },
  ringFill: {
    fill: 'none',
    strokeWidth: 2.8,
    strokeLinecap: 'round',
    transition: 'stroke-dasharray 0.5s ease',
  },
  capacityLabel: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  widget: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  searchContainer: {
    position: 'relative',
  },
  searchInput: {
    width: '100%',
    padding: '12px 36px 12px 16px',
    borderRadius: '12px',
    border: '1.5px solid var(--border-color)',
    backgroundColor: 'var(--surface-color)',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    fontFamily: 'var(--font-family)',
    outline: 'none',
    transition: 'var(--transition-smooth)',
  },
  searchIcon: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    width: '18px',
    height: '18px',
    color: 'var(--text-secondary)',
    pointerEvents: 'none',
  },
  sortGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
  },
  sortBtn: {
    padding: '10px 6px',
    borderRadius: '10px',
    border: '1px solid',
    fontSize: '0.82rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'var(--transition-smooth)',
    boxShadow: 'none',
    textAlign: 'center',
  },
  actionsWidget: {
    marginTop: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  actionBtn: {
    width: '100%',
    padding: '12px',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '0.92rem',
    boxShadow: '0 4px 6px rgba(0,0,0,0.06)',
  }
};
