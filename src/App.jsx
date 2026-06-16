import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Breadcrumbs from './components/Breadcrumbs';
import Dashboard from './components/Dashboard';
import ResidentDetails from './components/ResidentDetails';
import RegisterResident from './components/RegisterResident';
import ArchivedList from './components/ArchivedList';
import countries from './components/paises.json';


// Importamos todas nuestras conexiones reales a la API
import { 
  getActivosAPI, 
  getArchivadosAPI, 
  registrarResidenteAPI, 
  actualizarResidenteAPI, 
  archivarResidenteAPI, 
  reingresarResidenteAPI ,
  getFamiliasAPI,
  crearFamiliaAPI
} from './api';

export default function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('albergue_usuario');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Separamos los estados para mantener la información clara
  const [residents, setResidents] = useState([]);
  const [archivedResidents, setArchivedResidents] = useState([]);
  const [familias, setFamilias] = useState([]);
  const [currentView, setCurrentView] = useState(() => {
    const savedUser = localStorage.getItem('albergue_usuario');
    return savedUser ? { name: 'dashboard', params: {} } : { name: 'login', params: {} };
  });

  const [sortBy, setSortBy] = useState('nacionalidad');
  const [searchQuery, setSearchQuery] = useState('');

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Funcion central para recargar los datos de MySQL
  const cargarDatosDelServidor = async () => {
    setIsLoading(true);
    try {
      const activos = await getActivosAPI();
      const archivados = await getArchivadosAPI();
      const listarFamilias = await getFamiliasAPI();
      setFamilias(listarFamilias);
      setResidents(activos);
      setArchivedResidents(archivados);
    } catch (error) {
      showNotification('Error de conexion con el servidor. Por favor, reinicie sesion.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar los datos cuando el usuario inicie sesion correctamente
  useEffect(() => {
    if (user) {
      cargarDatosDelServidor();
    }
  }, [user]);

  const handleLogin = (userInfo) => {
    setUser(userInfo);
    localStorage.setItem('albergue_usuario', JSON.stringify(userInfo));
    setCurrentView({ name: 'dashboard', params: {} });
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('albergue_usuario');
    localStorage.removeItem('albergue_token');
    setCurrentView({ name: 'login', params: {} });
  };

  const handleSaveResident = async (newResident, fotoFile) => {
    try {
      const formData = new FormData();
      Object.keys(newResident).forEach(key => {
        if (newResident[key] !== null && newResident[key] !== '') {
          formData.append(key, newResident[key]);
        }
      });
      
      if (fotoFile) {
        formData.append('foto', fotoFile);
      }

      await registrarResidenteAPI(formData);
      showNotification('Residente registrado con exito', 'success');
      
      await cargarDatosDelServidor();
      setCurrentView({ name: 'dashboard', params: {} });
    } catch (error) {
      showNotification(error.message || 'Error al guardar el residente', 'error');
    }
  };

  const handleUpdateResident = async (updatedData, fotoFile = null) => {
    try {
      const formData = new FormData();
      Object.keys(updatedData).forEach(key => {
        if (updatedData[key] !== null && updatedData[key] !== '') {
          formData.append(key, updatedData[key]);
        }
      });
      
      if (fotoFile) {
        formData.append('foto', fotoFile);
      }

      await actualizarResidenteAPI(updatedData.id, formData);
      showNotification('Ficha actualizada con exito', 'success');
      
      await cargarDatosDelServidor();
      setCurrentView({ name: 'details', params: { id: updatedData.id, fromArchived: currentView.params?.fromArchived } });
    } catch (error) {
      showNotification(error.message || 'Error al actualizar', 'error');
    }
  };

  const handleArchiveResident = async (id) => {
    try {
      await archivarResidenteAPI(id);
      showNotification('Residente dado de baja correctamente', 'success');
      await cargarDatosDelServidor();
      setCurrentView({ name: 'dashboard', params: {} });
    } catch (error) {
      showNotification(error.message || 'Error al dar de baja', 'error');
    }
  };

  const handleCrearNuevaFamilia = async (codigoFamilia, notas) => {
  try {
    const respuesta = await crearFamiliaAPI({ codigo_familia: codigoFamilia, notes: notas });
    showNotification('Familia creada con exito', 'success');
    
    // Volvemos a consultar el servidor para actualizar el dropdown en tiempo real
    const listaFamilias = await getFamiliasAPI();
    setFamilias(listaFamilias);
    return respuesta.id; // Devolvemos el ID de la recien creada
  } catch (error) {
    showNotification(error.message || 'Error al crear familia', 'error');
    return null;
  }
};

  const handleRestoreResident = async (id) => {
    if (residents.length >= 50) {
      showNotification('El albergue ha alcanzado su capacidad maxima (50/50). No se pueden reingresar mas personas.', 'error');
      return;
    }
    
    try {
      await reingresarResidenteAPI(id);
      showNotification('Residente reingresado con exito', 'success');
      await cargarDatosDelServidor();
      setCurrentView({ name: 'dashboard', params: {} });
    } catch (error) {
      showNotification(error.message || 'Error al reingresar', 'error');
    }
  };

  // Buscar el residente actual en ambas listas segun de donde vengamos
  const currentResident = currentView.name === 'details' 
    ? (currentView.params?.fromArchived 
        ? archivedResidents.find((r) => r.id === currentView.params.id) 
        : residents.find((r) => r.id === currentView.params.id))
    : null;

  // Funcion general de filtrado y ordenado
  const filterAndSortData = (dataList) => {
    return dataList.filter((resident) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        (resident.nombre || '').toLowerCase().includes(query) ||
        (resident.nacionalidad || '').toLowerCase().includes(query) ||
        (resident.familiaId && String(resident.familiaId).toLowerCase().includes(query))
      );
    }).sort((a, b) => {
      if (sortBy === 'nacionalidad') {
        return (a.nacionalidad || '').localeCompare(b.nacionalidad || '');
      }
      if (sortBy === 'antiguedad') {
        return new Date(a.fechaIngreso || 0) - new Date(b.fechaIngreso || 0);
      }
      if (sortBy === 'sexo') {
        return (a.sexo || '').localeCompare(b.sexo || '');
      }
      if (sortBy === 'familia') {
        const famA = String(a.familiaId || 'ZZZZZZ');
        const famB = String(b.familiaId || 'ZZZZZZ');
        return famA.localeCompare(famB);
      }
      return 0;
    });
  };

  const sortedActive = filterAndSortData(residents);
  const sortedArchived = filterAndSortData(archivedResidents);
  const activeCount = residents.length;

  // Renderizar vista de login
  if (currentView.name === 'login' || !user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div style={styles.appContainer} className="app-container-mobile">
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <img src="/logoSLRC.png" alt="Logo SLRC" style={styles.headerLogo} />
          <div style={styles.headerDivider} className="hide-mobile"></div>
          <h1 style={styles.headerTitle} className="hide-mobile">Control del Albergue</h1>
        </div>
        
        <div style={styles.headerRight}>
          <div style={styles.adminInfo}>
            <img src="/usuarioVacio.png" alt="Avatar Administrador" style={styles.adminAvatar} />
            <div style={styles.adminText} className="hide-mobile">
              <span style={styles.adminName}>{user?.nombre || 'Administrador'}</span>
              <span style={styles.adminRole}>Ayuntamiento SLRC</span>
            </div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn} title="Cerrar Sesion">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            <span className="hide-mobile">Cerrar Sesion</span>
          </button>
        </div>
      </header>

      {/* Breadcrumbs */}
      <Breadcrumbs 
        currentView={currentView} 
        residentName={currentResident?.nombre} 
        onViewChange={setCurrentView} 
      />

      {/* Layout */}
      <div className="app-main-layout">
        <Sidebar 
          totalCount={activeCount} 
          capacity={50} 
          currentView={currentView}
          onViewChange={setCurrentView}
          sortBy={sortBy}
          onSortChange={setSortBy}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main style={styles.contentPanel} className="app-content-panel">
          {isLoading && currentView.name !== 'login' ? (
            <div style={styles.loadingOverlay}>
               <svg style={styles.spinner} viewBox="0 0 50 50">
                  <circle cx="25" cy="25" r="20" fill="none" stroke="var(--primary-dark)" strokeWidth="4"></circle>
               </svg>
               <p style={{ marginTop: '16px', fontWeight: '600', color: 'var(--text-secondary)' }}>Sincronizando datos...</p>
            </div>
          ) : (
            <>
              {currentView.name === 'dashboard' && (
                <Dashboard 
                  residents={sortedActive} 
                  onViewChange={setCurrentView} 
                  countries={countries}
                />
              )}
              {currentView.name === 'details' && currentResident && (
                <ResidentDetails 
                  resident={currentResident}
                  onUpdate={handleUpdateResident}
                  onArchive={handleArchiveResident}
                  onRestore={handleRestoreResident}
                  onCancel={() => {
                    const backTo = currentView.params?.fromArchived ? 'archived' : 'dashboard';
                    setCurrentView({ name: backTo, params: {} });
                  }}
                  countries={countries}
                />
              )}
              {currentView.name === 'register' && (
                <RegisterResident 
                  onSave={handleSaveResident}
                  onCancel={() => setCurrentView({ name: 'dashboard', params: {} })}
                  currentCapacity={activeCount}
                  countries={countries}
                  familias={familias}
                  onCrearFamilia={handleCrearNuevaFamilia}
                />
              )}
              {currentView.name === 'archived' && (
                <ArchivedList 
                  residents={sortedArchived} 
                  onViewChange={setCurrentView}
                  onRestore={handleRestoreResident}
                  countries={countries}
                />
              )}
            </>
          )}
        </main>
      </div>

      {notification && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: notification.type === 'error' ? 'var(--error-color)' : '#388e3c',
          color: '#fff',
          padding: '16px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 9999,
          animation: 'fadeInUp 0.3s ease-out'
        }}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            {notification.type === 'error' 
              ? <>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </>
              : <polyline points="20 6 9 17 4 12" />
            }
          </svg>
          <span style={{ fontWeight: '500', fontSize: '0.95rem' }}>{notification.message}</span>
        </div>
      )}
    </div>
  );
}

const styles = {
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--bg-color)',
  },
  header: {
    height: '60px',
    backgroundColor: 'var(--surface-color)',
    borderBottom: '2.5px solid var(--primary)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 24px',
    zIndex: 10,
    boxShadow: '0 2px 10px rgba(0, 150, 143, 0.05)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  headerLogo: {
    height: '42px',
    width: 'auto',
    objectFit: 'contain',
  },
  headerDivider: {
    width: '1.5px',
    height: '28px',
    backgroundColor: 'var(--border-color)',
  },
  headerTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'var(--primary-dark)',
    letterSpacing: '-0.3px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  adminInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  adminAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-light)',
    border: '1.5px solid var(--secondary)',
  },
  adminText: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  adminName: {
    fontSize: '0.88rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    lineHeight: '1.2',
  },
  adminRole: {
    fontSize: '0.72rem',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  logoutBtn: {
    backgroundColor: 'rgba(211, 47, 47, 0.08)',
    color: 'var(--error-color)',
    border: 'none',
    boxShadow: 'none',
    padding: '6px 14px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'var(--transition-smooth)',
  },
  contentPanel: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(240, 247, 246, 0.8)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  spinner: {
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
  }
};