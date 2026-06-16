import React from 'react';

export default function Breadcrumbs({ currentView, residentName, onViewChange }) {
  if (currentView.name === 'login') return null;

  const navigateTo = (viewName, params = {}) => {
    onViewChange({ name: viewName, params });
  };

  return (
    <nav style={styles.nav} aria-label="Breadcrumb">
      <ul style={styles.list}>
        
        {/* Raíz: Panel de Control */}
        {currentView.name === 'dashboard' ? (
          <li style={{ ...styles.item, ...styles.active }}>
            <svg style={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="9" />
              <rect x="14" y="3" width="7" height="5" />
              <rect x="14" y="12" width="7" height="9" />
              <rect x="3" y="16" width="7" height="5" />
            </svg>
            Panel de Control
          </li>
        ) : (
          <li style={styles.item}>
            <button 
              style={styles.linkButton} 
              onClick={() => navigateTo('dashboard')}
              title="Volver al Panel de Control"
            >
              <svg style={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="9" />
                <rect x="14" y="3" width="7" height="5" />
                <rect x="14" y="12" width="7" height="9" />
                <rect x="3" y="16" width="7" height="5" />
              </svg>
              Panel de Control
            </button>
          </li>
        )}

        {/* Sub-rutas */}
        {currentView.name === 'register' && (
          <>
            <span style={styles.separator}>/</span>
            <li style={{ ...styles.item, ...styles.active }}>Registrar Residente</li>
          </>
        )}

        {currentView.name === 'archived' && (
          <>
            <span style={styles.separator}>/</span>
            <li style={{ ...styles.item, ...styles.active }}>Archivados</li>
          </>
        )}

        {currentView.name === 'details' && (
          <>
            {currentView.params?.fromArchived && (
              <>
                <span style={styles.separator}>/</span>
                <li style={styles.item}>
                  <button style={styles.linkButton} onClick={() => navigateTo('archived')}>
                    Archivados
                  </button>
                </li>
              </>
            )}
            <span style={styles.separator}>/</span>
            <li style={{ ...styles.item, ...styles.active }}>
              {residentName ? `Ficha: ${residentName}` : 'Cargando Detalles...'}
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

const styles = {
  nav: {
    padding: '12px 24px',
    backgroundColor: 'var(--surface-color)',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
  },
  list: {
    listStyle: 'none',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  active: {
    color: 'var(--primary-dark)',
    fontWeight: '600',
  },
  separator: {
    color: 'var(--secondary)',
    opacity: 0.6,
    userSelect: 'none',
    margin: '0 4px',
  },
  linkButton: {
    background: 'none',
    border: 'none',
    padding: '4px 8px',
    borderRadius: '6px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'var(--transition-smooth)',
  },
  icon: {
    width: '16px',
    height: '16px',
    marginRight: '2px',
  }
};