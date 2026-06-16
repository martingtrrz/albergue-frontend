import React, { useState } from 'react';
import { calculateDaysRefuged } from '../mockData';
import { exportToPDF } from '../utils';


export default function ArchivedList({ residents, onViewChange, onRestore, countries = [] }) {
  const handleResidentClick = (id) => {
    onViewChange({ name: 'details', params: { id, fromArchived: true } });
  };

  if (residents.length === 0) {
    return (
      <div style={styles.emptyState}>
        <svg style={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polyline points="21 8 21 21 3 21 3 8" />
          <rect x="1" y="3" width="22" height="5" />
          <line x1="10" y1="12" x2="14" y2="12" />
        </svg>
        <h3 style={styles.emptyTitle}>Historial Vacío</h3>
        <p style={styles.emptyText}>No hay residentes archivados (dados de baja) en el sistema actualmente.</p>
      </div>
    );
  }

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(residents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedResidents = residents.slice(startIndex, startIndex + itemsPerPage); 

  return (
    <div style={styles.container} className="view-container mobile-padding">
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Residentes Archivados (Historial)</h2>
          <p style={styles.subtitle}>Personas que han completado su estancia y han sido dadas de baja</p>
        </div>
         <button 
  onClick={() => exportToPDF(residents, 'Reporte de Historial Archivados', 'historial_archivados')}
  className="btn btn-secondary"
  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
  title="Descargar en PDF"
>
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
  Exportar PDF
</button>
          
      </div>
      
      <div className="table-responsive" style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thRow}>
              <th style={styles.th}>Nombre</th>
              <th style={styles.th}>ID Familia</th>
              <th style={styles.th}>Edad</th>
              <th style={styles.th}>Sexo</th>
              <th style={styles.th}>Nacionalidad</th>
              <th style={styles.th}>Estancia</th>
              <th style={styles.th}>Último Destino</th>
              <th style={styles.th}>Fecha de Salida</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedResidents.map((resident) => {
              const days = calculateDaysRefuged(resident.fechaIngreso);
              return (
                <tr 
                  key={resident.id} 
                  style={styles.tbRow} 
                  onClick={() => handleResidentClick(resident.id)}
                >
                  <td style={{ ...styles.td, fontWeight: '600', color: 'var(--text-secondary)' }}>
                    {resident.nombre}
                  </td>
                  <td style={styles.td}>
                    <span style={styles.tableFamilyBadge}>{resident.familiaId}</span>
                  </td>
                  <td style={styles.td}>{resident.edad}</td>
                  <td style={styles.td}>{resident.sexo}</td>
                  <td style={styles.td}>
                    {(() => {
                      const countryObj = countries && resident.nacionalidad
                        ? countries.find(c => (c.country || '').toLowerCase() === resident.nacionalidad.toLowerCase())
                        : null;
                      return countryObj ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', verticalAlign: 'middle' }}>
                          <img src={countryObj.flag} alt="" style={{ width: '16px', height: '11px', objectFit: 'cover', borderRadius: '1.5px' }} />
                          {countryObj.country}
                        </span>
                      ) : resident.nacionalidad;
                    })()}
                  </td>
                  <td style={styles.td}>{days} {days === 1 ? 'día' : 'días'}</td>
                  <td style={styles.td}>{resident.destino || '-'}</td>
                  {/* Since they had an optional planned travel date, we display it as departure date or show "Salida registrada" */}
                  <td style={styles.td}>{resident.viajeProgramado || 'Baja general'}</td>
                  <td style={styles.td} onClick={(e) => e.stopPropagation()}>
                    <div style={styles.actionGroup}>
                      <button 
                        style={styles.tableBtnSecondary}
                        onClick={() => handleResidentClick(resident.id)}
                      >
                        Ficha
                      </button>
                      <button 
                        style={styles.tableBtnPrimary}
                        onClick={() => onRestore(resident.id)}
                      >
                        Reingresar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
      Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, residents.length)} de {residents.length} registros
    </span>
    <div style={{ display: 'flex', gap: '8px' }}>
      <button 
        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
        disabled={currentPage === 1}
        className="btn btn-secondary"
      >
        Anterior
      </button>
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', fontWeight: '600' }}>
        {currentPage} / {totalPages}
      </div>
      <button 
        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
        className="btn btn-secondary"
      >
        Siguiente
      </button>
    </div>
  </div>
)}
    </div>
  );
}

const styles = {
  container: {
    padding: '24px',
    flexGrow: 1,
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '24px',
    borderBottom: '2px solid var(--border-color)',
    paddingBottom: '16px',
  },
  title: {
    fontSize: '1.6rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    marginTop: '2px',
  },
  tableWrapper: {
    backgroundColor: 'var(--surface-color)',
    borderRadius: '16px',
    border: '1px solid var(--border-color)',
    overflow: 'hidden',
    boxShadow: 'var(--card-shadow)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  thRow: {
    backgroundColor: 'rgba(110, 176, 173, 0.12)',
    borderBottom: '2px solid var(--border-color)',
  },
  th: {
    padding: '14px 16px',
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tbRow: {
    borderBottom: '1px solid var(--border-color)',
    cursor: 'pointer',
    transition: 'var(--transition-smooth)',
    '&:hover': {
      backgroundColor: 'rgba(0, 150, 143, 0.02)',
    }
  },
  td: {
    padding: '14px 16px',
    fontSize: '0.9rem',
    color: 'var(--text-primary)',
    verticalAlign: 'middle',
  },
  tableFamilyBadge: {
    backgroundColor: 'var(--bg-color)',
    border: '1px solid var(--border-color)',
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '0.78rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  actionGroup: {
    display: 'flex',
    gap: '8px',
  },
  tableBtnSecondary: {
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '0.78rem',
    fontWeight: '600',
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary-dark)',
    boxShadow: 'none',
  },
  tableBtnPrimary: {
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '0.78rem',
    fontWeight: '600',
    backgroundColor: '#388e3c', // Green for restore re-admission
    color: '#ffffff',
    boxShadow: 'none',
  },
  emptyState: {
    padding: '60px 24px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  emptyIcon: {
    width: '64px',
    height: '64px',
    color: 'var(--secondary)',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '1.3rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '0.95rem',
    color: 'var(--text-secondary)',
    maxWidth: '400px',
  }
};
