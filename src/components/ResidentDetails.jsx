import React, { useState, useEffect } from 'react';
import imagenDefault from '../assets/usuarioVacio.png';

export default function ResidentDetails({ resident, onUpdate, onArchive, onRestore, onCancel, countries }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({ ...resident });
  const [errors, setErrors] = useState({});
  
  // Estados para la nueva foto en modo edicion
  const [fotoFile, setFotoFile] = useState(null);
const [fotoPreview, setFotoPreview] = useState(resident?.fotoUrl ? `https://martin.utportfolio.cloud/api/${resident.fotoUrl}` : imagenDefault);  const [fotoError, setFotoError] = useState('');

  // Estado para nuestro modal de confirmacion
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null }); // type: 'archive' | 'restore'

  useEffect(() => {
    setEditedData({ ...resident });
    setFotoPreview(resident?.fotoUrl ? `https://martin.utportfolio.cloud/api/${resident.fotoUrl}` : imagenDefault);
    setFotoFile(null);
    setErrors({});
  }, [resident]);

  if (!resident) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({ ...prev, [name]: value }));
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    setFotoError('');
    
    if (!file) {
      setFotoFile(null);
      setFotoPreview(resident?.fotoUrl ? `https://martin.utportfolio.cloud/api/${resident.fotoUrl}` : imagenDefault);
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setFotoError('Formato invalido. Solo JPG o PNG.');
      e.target.value = '';
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setFotoError('La imagen supera los 5MB.');
      e.target.value = ''; 
      return;
    }

    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
  };

const handleSave = () => {
    const newErrors = {};

    // 1. Validar Nombre
    const nombreTrim = (editedData.nombre || '').trim();
    if (!nombreTrim) {
      newErrors.nombre = 'El nombre es obligatorio';
    } else if (nombreTrim.length < 3 || nombreTrim.length > 100) {
      newErrors.nombre = 'El nombre debe tener entre 3 y 100 caracteres';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombreTrim)) {
      newErrors.nombre = 'El nombre solo debe contener letras y espacios';
    }

    // 2. Validar Edad
    const edadNum = Number(editedData.edad);
    if (editedData.edad === '' || isNaN(edadNum)) {
      newErrors.edad = 'La edad es obligatoria';
    } else if (!Number.isInteger(edadNum) || edadNum < 0 || edadNum > 120) {
      newErrors.edad = 'La edad debe ser un número entero entre 0 y 120';
    }

    // 3. Validar Nacionalidad
    if (!editedData.nacionalidad || !editedData.nacionalidad.trim()) {
      newErrors.nacionalidad = 'La nacionalidad es obligatoria';
    }

    // 4. Validar Contacto de Emergencia (Opcional, pero con formato si se ingresa)
    const contactoTrim = (editedData.contactoEmergencia || '').trim();
    if (contactoTrim && !/^[0-9+\-\s()]{7,20}$/.test(contactoTrim)) {
      newErrors.contactoEmergencia = 'Formato de teléfono inválido';
    }

    // 5. Validar Destino y Condición (Límites de texto para no romper la BD)
    if (editedData.destino && editedData.destino.length > 150) {
      newErrors.destino = 'El texto es demasiado largo (máx 150 caracteres)';
    }
    if (editedData.condicion && editedData.condicion.length > 300) {
      newErrors.condicion = 'El texto es demasiado largo (máx 300 caracteres)';
    }

    // 6. Validar Fechas (Viaje Programado vs Ingreso)
    if (editedData.viajeProgramado) {
      const fechaIngresoStr = editedData.fechaIngreso ? editedData.fechaIngreso.split('T')[0] : '';
      const viajeProgramadoStr = editedData.viajeProgramado.split('T')[0];
      if (fechaIngresoStr && viajeProgramadoStr < fechaIngresoStr) {
        newErrors.viajeProgramado = 'El viaje no puede ser anterior al ingreso';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onUpdate(editedData, fotoFile);
    setIsEditing(false);
  };

  const getStatusColor = (estado) => estado === 'activo' ? 'var(--secondary)' : 'var(--text-secondary)';

  return (
    <div className="fade-in" style={styles.container}>
      
      {/* Header y Acciones */}
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <button onClick={onCancel} style={styles.backBtn} title="Volver">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h2 style={styles.title}>
            {isEditing ? 'Editar Ficha Tecnica' : 'Ficha Tecnica del Residente'}
          </h2>
          {!isEditing && (
             <span style={{...styles.badge, backgroundColor: getStatusColor(resident.estado) }}>
               {resident.estado.toUpperCase()}
             </span>
          )}
        </div>
        
        <div style={styles.actions}>
          {!isEditing ? (
            <>
              {resident.estado === 'activo' && (
                <>
                  <button onClick={() => setIsEditing(true)} style={styles.editBtn}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    <span className="hide-mobile">Editar</span>
                  </button>
                  <button onClick={() => setConfirmModal({ isOpen: true, type: 'archive' })} style={styles.archiveBtn}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <polyline points="21 8 21 21 3 21 3 8"></polyline>
                      <rect x="1" y="3" width="22" height="5"></rect>
                      <line x1="10" y1="12" x2="14" y2="12"></line>
                    </svg>
                    <span className="hide-mobile">Dar de Baja</span>
                  </button>
                </>
              )}
              {resident.estado === 'archivado' && (
                <button onClick={() => setConfirmModal({ isOpen: true, type: 'restore' })} style={styles.restoreBtn}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="1 4 1 10 7 10"></polyline>
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                  </svg>
                  <span className="hide-mobile">Reingresar Residente</span>
                </button>
              )}
            </>
          ) : (
            <>
              <button onClick={() => { setIsEditing(false); setEditedData({...resident}); setFotoPreview(resident?.fotoUrl ? `https://martin.utportfolio.cloud/api/${resident.fotoUrl}` : imagenDefault); setFotoFile(null); setErrors({}); }} style={styles.cancelBtn}>
                Cancelar
              </button>
              <button onClick={handleSave} style={styles.saveBtn}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                Guardar Cambios
              </button>
            </>
          )}
        </div>
      </div>

      {/* Contenido Principal */}
      <div style={styles.card}>
        <div style={styles.profileSection} className="profile-section-responsive">
          <div style={styles.avatarWrapper}>
            <img 
              src={fotoPreview} 
              alt="Foto del residente" 
              style={styles.avatar}
            />
          
          {isEditing && (
            <div style={styles.fotoUploadControls}>
               <label style={styles.uploadButton}>
                 <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                 </svg>
                 Cambiar Foto
                 <input type="file" accept="image/jpeg, image/png" onChange={handleFotoChange} style={{display: 'none'}} />
               </label>
               {fotoError && <span style={styles.errorText}>{fotoError}</span>}
            </div>
          )}

          <div style={styles.profileInfo}>
            {isEditing ? (
              <>
                <input type="text" name="nombre" value={editedData.nombre} onChange={handleInputChange} style={styles.inputTitle} className="input-title-responsive" />
                {errors.nombre && <span style={{ ...styles.errorText, display: 'block', marginBottom: '8px', textAlign: 'center' }}>{errors.nombre}</span>}
              </>
            ) : (
              <h3 style={styles.residentName}>{resident.nombre}</h3>
            )}
            <p style={styles.residentMeta}>ID Sistema: #{resident.id} • Registrado: {new Date(resident.fechaIngreso).toLocaleDateString()}</p>
          </div>
        </div>

        <div style={styles.grid}>
          {/* Datos Personales */}
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>
              <svg width="18" height="18" fill="none" stroke="var(--primary)" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Datos Personales
            </h4>
            <div style={styles.fieldGroup}>
              <div style={styles.field}>
                <label style={styles.label}>Edad</label>
                {isEditing ? (
                  <>
                    <input type="number" name="edad" min="0" max="120" step="1" value={editedData.edad} onChange={handleInputChange} style={styles.input} />
                    {errors.edad && <span style={styles.errorText}>{errors.edad}</span>}
                  </>
                ) : <p style={styles.value}>{resident.edad} anos</p>}
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Sexo</label>
                {isEditing ? (
                  <select name="sexo" value={editedData.sexo} onChange={handleInputChange} style={styles.select}>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                ) : <p style={styles.value}>{resident.sexo}</p>}
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Nacionalidad</label>
                {isEditing ? (
                  <>
                    <select name="nacionalidad" value={editedData.nacionalidad} onChange={handleInputChange} style={styles.select}>
                      <option value="">Seleccione pais...</option>
                      {countries?.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                    </select>
                    {errors.nacionalidad && <span style={styles.errorText}>{errors.nacionalidad}</span>}
                  </>
                ) : <p style={styles.value}>{resident.nacionalidad}</p>}
              </div>
            </div>
          </div>

          {/* Grupo Familiar */}
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>
              <svg width="18" height="18" fill="none" stroke="var(--secondary)" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Grupo Familiar
            </h4>
            <div style={styles.fieldGroup}>
              <div style={styles.field}>
                <label style={styles.label}>ID de Familia</label>
                {isEditing ? <input type="text" name="familiaId" value={editedData.familiaId || ''} onChange={handleInputChange} style={styles.input} placeholder="Opcional" /> : <p style={styles.value}>{resident.familiaId || 'Sin asignar'}</p>}
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Contacto de Emergencia</label>
                {isEditing ? <input type="text" name="contactoEmergencia" maxLength="15" value={editedData.contactoEmergencia || ''} onChange={handleInputChange} style={styles.input} /> : <p style={styles.value}>{resident.contactoEmergencia || 'No registrado'}</p>}
              </div>
            </div>
          </div>

          {/* Estado Medico */}
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>
              <svg width="18" height="18" fill="none" stroke="#d32f2f" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
              Condicion o Estado Medico
            </h4>
            <div style={styles.field}>
              {isEditing ? <textarea name="condicion" maxLength="200" value={editedData.condicion || ''} onChange={handleInputChange} style={styles.textarea} rows="3" /> : <p style={styles.value}>{resident.condicion || 'Ninguna registrada'}</p>}
            </div>
          </div>

          {/* Estatus Migratorio */}
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>
              <svg width="18" height="18" fill="none" stroke="#f57c00" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
              Estatus y Destino
            </h4>
            <div style={styles.fieldGroup}>
              <div style={styles.field}>
                <label style={styles.label}>Destino Planeado</label>
                {isEditing ? <input type="text" name="destino" maxLength="100" value={editedData.destino || ''} onChange={handleInputChange} style={styles.input} /> : <p style={styles.value}>{resident.destino || 'No especificado'}</p>}
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Fecha de Viaje Programada</label>
                {isEditing ? (
                  <>
                    <input type="date" name="viajeProgramado" value={editedData.viajeProgramado || ''} onChange={handleInputChange} style={styles.input} />
                    {errors.viajeProgramado && <span style={styles.errorText}>{errors.viajeProgramado}</span>}
                  </>
                ) : <p style={styles.value}>{resident.viajeProgramado ? new Date(resident.viajeProgramado).toLocaleDateString() : 'Sin programar'}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmacion */}
      {confirmModal.isOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent} className="scale-in">
            <div style={{...styles.modalIcon, backgroundColor: confirmModal.type === 'archive' ? 'rgba(211,47,47,0.1)' : 'rgba(0,150,143,0.1)', color: confirmModal.type === 'archive' ? '#d32f2f' : 'var(--primary)'}}>
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <h3 style={styles.modalTitle}>
              {confirmModal.type === 'archive' ? 'Confirmar Baja' : 'Confirmar Reingreso'}
            </h3>
            <p style={styles.modalText}>
              {confirmModal.type === 'archive' 
                ? `¿Estas seguro que deseas archivar a ${resident.nombre}? El residente sera movido al historial.` 
                : `¿Deseas reactivar a ${resident.nombre}? Volvera a contar en la capacidad del albergue.`}
            </p>
            <div style={styles.modalActions}>
              <button onClick={() => setConfirmModal({ isOpen: false, type: null })} style={styles.modalCancelBtn}>
                Cancelar
              </button>
              <button 
                onClick={() => {
                  confirmModal.type === 'archive' ? onArchive(resident.id) : onRestore(resident.id);
                  setConfirmModal({ isOpen: false, type: null });
                }} 
                style={confirmModal.type === 'archive' ? styles.modalArchiveBtn : styles.modalRestoreBtn}
              >
                {confirmModal.type === 'archive' ? 'Si, Dar de Baja' : 'Si, Reingresar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>

  );
}


const styles = {
  container: {
    padding: '24px',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  titleSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  title: {
    fontSize: '1.5rem',
    color: 'var(--text-primary)',
    margin: 0,
  },
  badge: {
    padding: '4px 10px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '0.75rem',
    fontWeight: '700',
    letterSpacing: '0.5px',
  },
  backBtn: {
    backgroundColor: 'var(--surface-color)',
    border: '1.5px solid var(--border-color)',
    borderRadius: '10px',
    width: '40px',
    height: '40px',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    transition: 'var(--transition-smooth)',
  },
  actions: {
    display: 'flex',
    gap: '12px',
  },
  editBtn: {
    backgroundColor: 'var(--surface-color)',
    border: '1.5px solid var(--primary)',
    color: 'var(--primary)',
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  archiveBtn: {
    backgroundColor: 'rgba(211, 47, 47, 0.08)',
    border: '1.5px solid rgba(211, 47, 47, 0.2)',
    color: '#d32f2f',
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  restoreBtn: {
    backgroundColor: 'var(--primary)',
    border: 'none',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  saveBtn: {
    backgroundColor: 'var(--primary)',
    color: 'white',
    border: 'none',
    padding: '8px 20px',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  cancelBtn: {
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
    border: 'none',
    padding: '8px 16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  card: {
    backgroundColor: 'var(--surface-color)',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    padding: '32px',
    border: '1px solid var(--border-color)',
  },
  profileSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    paddingBottom: '24px',
    borderBottom: '1px solid var(--border-color)',
    marginBottom: '24px',
  },
  avatarWrapper: {
    width: '90px',
    height: '110px',
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: 'var(--bg-color)',
    border: '2px solid var(--border-color)',
    flexShrink: 0,
  },
  avatar: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  fotoUploadControls: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  uploadButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary-dark)',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.85rem',
    cursor: 'pointer',
    border: '1px solid var(--primary)',
  },
  errorText: {
    color: 'var(--error-color)',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  profileInfo: {
    flexGrow: 1,
  },
  residentName: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: 'var(--primary-dark)',
    margin: '0 0 8px 0',
  },
  inputTitle: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: 'var(--primary-dark)',
    backgroundColor: 'var(--bg-color)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '8px 12px',
    width: '100%',
    maxWidth: '400px',
    marginBottom: '8px',
  },
  residentMeta: {
    color: 'var(--text-secondary)',
    margin: 0,
    fontSize: '0.95rem',
    fontWeight: '500',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '32px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sectionTitle: {
    fontSize: '1.1rem',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: 0,
    borderBottom: '2px solid var(--bg-color)',
    paddingBottom: '8px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  value: {
    fontSize: '1rem',
    color: 'var(--text-primary)',
    margin: 0,
    fontWeight: '500',
    backgroundColor: 'var(--bg-color)',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid transparent',
  },
  input: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    fontSize: '1rem',
    color: 'var(--text-primary)',
    backgroundColor: 'var(--bg-color)',
  },
  select: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    fontSize: '1rem',
    color: 'var(--text-primary)',
    backgroundColor: 'var(--bg-color)',
  },
  textarea: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    fontSize: '1rem',
    color: 'var(--text-primary)',
    backgroundColor: 'var(--bg-color)',
    resize: 'vertical',
  },
  // Modal Styles
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'var(--surface-color)',
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '400px',
    width: '90%',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    textAlign: 'center',
  },
  modalIcon: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px auto',
  },
  modalTitle: {
    margin: '0 0 12px 0',
    color: 'var(--text-primary)',
    fontSize: '1.4rem',
  },
  modalText: {
    margin: '0 0 24px 0',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  modalCancelBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--surface-color)',
    color: 'var(--text-primary)',
    fontWeight: '600',
    cursor: 'pointer',
  },
  modalArchiveBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#d32f2f',
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer',
  },
  modalRestoreBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'var(--primary)',
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer',
  }
};