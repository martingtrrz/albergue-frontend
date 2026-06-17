import React, { useState } from 'react';
import { calculateDaysRefuged } from '../mockData';
import { exportToPDF } from '../utils';
import imagenDefault from '../assets/usuarioVacio.png';

export default function Dashboard({ residents, onViewChange, countries = [] }) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Estados de filtrado local para el Dashboard (País, Sexo, Antigüedad, Condición)
  const [filterCountry, setFilterCountry] = useState('');
  const [filterSexo, setFilterSexo] = useState('');
  const [filterAntiguedad, setFilterAntiguedad] = useState('');
  const [filterCondicion, setFilterCondicion] = useState('');

  const handleCardClick = (id) => {
    onViewChange({ name: 'details', params: { id, fromArchived: false } });
  };

  const clearFilters = () => {
    setFilterCountry('');
    setFilterSexo('');
    setFilterAntiguedad('');
    setFilterCondicion('');
  };

  // Obtener países únicos con residentes activos para alimentar el selector
  const uniqueCountries = Array.from(
    new Set(residents.map(r => r.nacionalidad).filter(Boolean))
  ).sort();

  // Filtrar residentes según las opciones seleccionadas
  const filteredResidents = residents.filter((resident) => {
    // 1. Filtrar por País de Procedencia / Origen
    if (filterCountry && resident.nacionalidad !== filterCountry) return false;

    // 2. Filtrar por Sexo
    if (filterSexo && resident.sexo !== filterSexo) return false;

    // 3. Filtrar por Antigüedad
    if (filterAntiguedad) {
      const days = calculateDaysRefuged(resident.fechaIngreso);
      if (filterAntiguedad === 'recent' && days > 3) return false;
      if (filterAntiguedad === 'medium' && (days < 4 || days > 10)) return false;
      if (filterAntiguedad === 'long' && days <= 10) return false;
    }

    // 4. Filtrar por Condición
    if (filterCondicion) {
      const condition = (resident.condicion || '').toLowerCase();
      const hasObservations = condition.trim() && 
                              !condition.includes('estable') && 
                              !condition.includes('saludable') && 
                              !condition.includes('ninguna');
      if (filterCondicion === 'with_notes' && !hasObservations) return false;
      if (filterCondicion === 'clean' && hasObservations) return false;
    }

    return true;
  });

  if (residents.length === 0) {
    return (
      <div style={styles.emptyState}>
        <svg style={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
        <h3 style={styles.emptyTitle}>Sin Residentes Activos</h3>
        <p style={styles.emptyText}>No se encontraron personas con los filtros seleccionados o el albergue está vacío.</p>
        <button 
          onClick={() => onViewChange({ name: 'register' })} 
          className="btn btn-primary"
          style={{ marginTop: '16px' }}
        >
          Dar de Alta Nuevo Residente
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container} className="view-container mobile-padding">
      {/* Header with View Controls */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Residentes Activos</h2>
          <p style={styles.subtitle}>
            {filteredResidents.length === residents.length
              ? `Mostrando ${residents.length} personas albergadas actualmente`
              : `Filtrados: ${filteredResidents.length} de ${residents.length} personas`}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={() => exportToPDF(
            filteredResidents, 
            'Reporte de Residentes Activos', 
            'residentes_activos'
          )}
          className="btn btn-secondary"
          //mostrarlo pegado a la derecha del header, pero con el icono a la izquierda del texto y un pequeño gap entre ambos
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
        <div style={styles.toggleGroup}>
          <button 
            style={{
              ...styles.toggleBtn,
              backgroundColor: viewMode === 'grid' ? 'var(--primary-light)' : 'transparent',
              color: viewMode === 'grid' ? 'var(--primary-dark)' : 'var(--text-secondary)',
            }}
            onClick={() => setViewMode('grid')}
            title="Vista de Fichas"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </button>
          <button 
            style={{
              ...styles.toggleBtn,
              backgroundColor: viewMode === 'list' ? 'var(--primary-light)' : 'transparent',
              color: viewMode === 'list' ? 'var(--primary-dark)' : 'var(--text-secondary)',
            }}
            onClick={() => setViewMode('list')}
            title="Vista de Tabla"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </button>
        </div>
        
      </div>
      </div>

      {/* Advanced Filter Bar directly on the Dashboard */}
      <div style={styles.filterBar}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>País de Origen</label>
          <select 
            value={filterCountry} 
            onChange={(e) => setFilterCountry(e.target.value)}
            className="form-control"
            style={styles.filterSelect}
          >
            <option value="">Todos los Países</option>
            {uniqueCountries.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Sexo</label>
          <select 
            value={filterSexo} 
            onChange={(e) => setFilterSexo(e.target.value)}
            className="form-control"
            style={styles.filterSelect}
          >
            <option value="">Todos</option>
            <option value="M">Masculino (M)</option>
            <option value="F">Femenino (F)</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Antigüedad</label>
          <select 
            value={filterAntiguedad} 
            onChange={(e) => setFilterAntiguedad(e.target.value)}
            className="form-control"
            style={styles.filterSelect}
          >
            <option value="">Cualquier estadía</option>
            <option value="recent">Recientes (1-3 días)</option>
            <option value="medium">Intermedios (4-10 días)</option>
            <option value="long">Prolongados (+10 días)</option>
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Condición</label>
          <select 
            value={filterCondicion} 
            onChange={(e) => setFilterCondicion(e.target.value)}
            className="form-control"
            style={styles.filterSelect}
          >
            <option value="">Todas</option>
            <option value="with_notes">Con observaciones especiales</option>
            <option value="clean">Sin observaciones (Estable/Saludable)</option>
          </select>
        </div>

        {(filterCountry || filterSexo || filterAntiguedad || filterCondicion) && (
          <button 
            onClick={clearFilters}
            className="btn btn-secondary"
            style={styles.clearBtn}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
            Limpiar
          </button>
        )}
      </div>

      {viewMode === 'grid' ? (
        /* Grid View */
        filteredResidents.length === 0 ? (
          <div style={styles.filterEmptyState}>
            <h3 style={styles.filterEmptyTitle}>Sin resultados de búsqueda</h3>
            <p style={styles.filterEmptyText}>No hay residentes albergados que cumplan con los filtros seleccionados.</p>
            <button onClick={clearFilters} className="btn btn-secondary" style={{ marginTop: '14px' }}>
              Restablecer Filtros
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {filteredResidents.map((resident) => {
              const days = calculateDaysRefuged(resident.fechaIngreso);
              const countryObj = countries && resident.nacionalidad 
                ? countries.find(c => (c.country || '').toLowerCase() === resident.nacionalidad.toLowerCase())
                : null;
              return (
                <div 
                  key={resident.id} 
                  style={styles.card}
                  onClick={() => handleCardClick(resident.id)}
                >
                  <div style={styles.cardHeader}>
                    <span style={styles.familyBadge}>
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: '4px' }}>
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      F: {resident.familiaId || 'Individual'}
                    </span>
                  
                  
                    <button 
                      style={styles.detailsBtn} 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(resident.id);
                      }}
                    >
                      Detalles
                    </button>
                  </div>

                  <div style={styles.cardBody}>
                    {/* Photo area */}
                    <div style={styles.photoContainer}>
                      <img 
                        src={resident.fotoUrl 
                          ? (resident.fotoUrl.startsWith('http') ? resident.fotoUrl : `https://martin.utportfolio.cloud/api/${resident.fotoUrl}`) 
                          : imagenDefault}
                        alt={resident.nombre} 
                        style={styles.photo} 
                      />
                      {/* Gender Indicator Badge */}
                      <div style={{
                        ...styles.genderBadge,
                        backgroundColor: resident.sexo === 'M' ? '#bbdefb' : resident.sexo === 'F' ? '#f8bbd0' : '#e0e0e0',
                        color: resident.sexo === 'M' ? '#0d47a1' : resident.sexo === 'F' ? '#880e4f' : '#424242'
                      }}>
                        {resident.sexo}
                      </div>
                    </div>

                    {/* Core details */}
                    <div style={styles.infoArea}>
                      <h3 style={styles.name}>{resident.nombre}</h3>
                      <p style={styles.nacionalidad}>
                        {resident.nacionalidad} • {resident.edad} años
                      </p>

                      <div style={styles.statsGrid}>
                        <div style={styles.statCell}>
                          <span style={styles.statLabel}>Estadía</span>
                          <span style={styles.statVal}>{days} {days === 1 ? 'día' : 'días'}</span>
                        </div>
                        <div style={styles.statCell}>
                          <span style={styles.statLabel}>Destino</span>
                          <span style={styles.statVal} title={resident.destino}>{resident.destino || 'Sin definir'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={styles.cardFooter}>
                    <span style={styles.conditionLabel}>Condición:</span>
                    <span style={styles.conditionText} title={resident.condicion}>
                      {resident.condicion || 'Estable'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Table View */
        filteredResidents.length === 0 ? (
          <div style={styles.filterEmptyState}>
            <h3 style={styles.filterEmptyTitle}>Sin resultados de búsqueda</h3>
            <p style={styles.filterEmptyText}>No hay residentes albergados que cumplan con los filtros seleccionados.</p>
            <button onClick={clearFilters} className="btn btn-secondary" style={{ marginTop: '14px' }}>
              Restablecer Filtros
            </button>
          </div>
        ) : (
          <div className="table-responsive" style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>Nombre</th>
                  <th style={styles.th}>ID Familia</th>
                  <th style={styles.th}>Edad</th>
                  <th style={styles.th}>Sexo</th>
                  <th style={styles.th}>Nacionalidad</th>
                  <th style={styles.th}>Estadía</th>
                  <th style={styles.th}>Destino</th>
                  <th style={styles.th}>Condición</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredResidents.map((resident) => (
                  <tr 
                    key={resident.id} 
                    style={styles.tbRow} 
                    onClick={() => handleCardClick(resident.id)}
                  >
                    <td style={{ ...styles.td, fontWeight: '600' }}>{resident.nombre}</td>
                    <td style={styles.td}>
                      <span style={styles.tableFamilyBadge}>{resident.familiaId}</span>
                    </td>
                    <td style={styles.td}>{resident.edad}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.miniGenderBadge,
                        backgroundColor: resident.sexo === 'M' ? '#bbdefb' : resident.sexo === 'F' ? '#f8bbd0' : '#e0e0e0',
                        color: resident.sexo === 'M' ? '#0d47a1' : resident.sexo === 'F' ? '#880e4f' : '#424242'
                      }}>
                        {resident.sexo}
                      </span>
                    </td>
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
                    <td style={styles.td}>{calculateDaysRefuged(resident.fechaIngreso)} días</td>
                    <td style={styles.td}>{resident.destino || '-'}</td>
                    <td style={styles.td}>{resident.condicion || 'Estable'}</td>
                    <td style={styles.td} onClick={(e) => e.stopPropagation()}>
                      <button 
                        style={styles.tableBtn}
                        onClick={() => handleCardClick(resident.id)}
                      >
                        Ver Ficha
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
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
  toggleGroup: {
    display: 'flex',
    backgroundColor: 'var(--border-color)',
    borderRadius: '10px',
    padding: '4px',
  },
  toggleBtn: {
    border: 'none',
    boxShadow: 'none',
    padding: '6px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'var(--transition-smooth)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
    gap: '20px',
  },
  /* Card following client Canva mockup details */
  card: {
    backgroundColor: '#0c2522', // Dark forest teal
    borderRadius: '16px',
    border: '1px solid rgba(0, 227, 215, 0.12)',
    boxShadow: 'var(--card-shadow)',
    overflow: 'hidden',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    transition: 'var(--transition-smooth)',
    padding: '16px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 0 12px 0',
    backgroundColor: 'transparent',
    borderBottom: 'none',
  },
  familyBadge: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#aee2de', // Light teal
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: '4px 10px',
    borderRadius: '20px',
    display: 'inline-flex',
    alignItems: 'center',
  },
  cardHeaderFlag: {
    width: '45px',
    height: '28px',
    objectFit: 'cover',
    borderRadius: '3px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
  },
  detailsBtn: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.78rem',
    fontWeight: '700',
    backgroundColor: '#aee2de', // Light cyan background
    color: '#0c2522', // Dark teal text
    border: 'none',
    cursor: 'pointer',
    boxShadow: 'none',
    transition: 'var(--transition-smooth)',
  },
  cardBody: {
    padding: '0',
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
  },
  photoContainer: {
    position: 'relative',
    width: '80px',
    height: '92px',
    backgroundColor: '#ffffff', // White backdrop for silhouette
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.1)',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  genderBadge: {
    position: 'absolute',
    bottom: '4px',
    right: '4px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    fontSize: '0.75rem',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
  },
  infoArea: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    minWidth: 0,
  },
  name: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#ffffff', // White name
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textTransform: 'uppercase',
  },
  nacionalidad: {
    fontSize: '0.85rem',
    color: '#85b9b5', // Light teal subtitle
    marginBottom: '8px',
    fontWeight: '500',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
    marginTop: '4px',
  },
  statCell: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'rgba(255, 255, 255, 0.04)', // Transparent light stats box
    padding: '8px 10px',
    borderRadius: '10px',
    minWidth: 0,
  },
  statLabel: {
    fontSize: '0.62rem',
    color: '#85b9b5', // Light teal label
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: '0.3px',
    marginBottom: '2px',
  },
  statVal: {
    fontSize: '0.82rem',
    color: '#ffffff', // White stat values
    fontWeight: '700',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cardFooter: {
    marginTop: '16px',
    padding: '12px 0 0 0',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    backgroundColor: 'transparent',
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.82rem',
    gap: '6px',
  },
  conditionLabel: {
    fontWeight: '700',
    color: '#85b9b5',
  },
  conditionText: {
    fontWeight: '600',
    color: '#ffffff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flexGrow: 1,
  },
  /* Table View Styles */
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
    backgroundColor: 'rgba(0, 150, 143, 0.06)',
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
      backgroundColor: 'rgba(0, 227, 215, 0.03)',
    }
  },
  td: {
    padding: '14px 16px',
    fontSize: '0.9rem',
    color: 'var(--text-primary)',
    verticalAlign: 'middle',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
  },
  miniGenderBadge: {
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '0.75rem',
    fontWeight: '700',
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
  tableBtn: {
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: '600',
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary-dark)',
    boxShadow: 'none',
  },
  /* Empty State Styles */
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
  },
  filterBar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    backgroundColor: 'var(--surface-color)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    padding: '16px 20px',
    marginBottom: '24px',
    alignItems: 'flex-end',
    boxShadow: 'var(--card-shadow)',
    width: '100%',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: '1 1 180px',
  },
  filterLabel: {
    fontSize: '0.78rem',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  filterSelect: {
    padding: '8px 12px',
    fontSize: '0.88rem',
    borderRadius: '8px',
    height: '38px',
  },
  clearBtn: {
    height: '38px',
    borderRadius: '8px',
    fontSize: '0.88rem',
    padding: '8px 16px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  filterEmptyState: {
    padding: '40px 20px',
    textAlign: 'center',
    backgroundColor: 'var(--surface-color)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    boxShadow: 'var(--card-shadow)',
    width: '100%',
  },
  filterEmptyTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '6px',
  },
  filterEmptyText: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
  }
};
