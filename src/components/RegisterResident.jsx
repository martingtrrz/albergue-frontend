import React, { useState } from 'react';
import CountrySelector from './CountrySelector';

export default function RegisterResident({ onSave, onCancel, currentCapacity, maxCapacity = 50, countries = [], familias, onCrearFamilia }) {
  const [formData, setFormData] = useState({
    nombre: '',
    sexo: 'M',
    edad: '',
    nacionalidad: '',
    familiaId: '',
    destino: '',
    fechaIngreso: new Date().toISOString().split('T')[0],
    condicion: '',
    contactoEmergencia: '',
    viajeProgramado: ''
  });

  const [errors, setErrors] = useState({});

  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState('/usuarioVacio.png');
  const [fotoError, setFotoError] = useState('');
  const [showNuevaFamiliaForm, setShowNuevaFamiliaForm] = useState(false);
  const [nuevoCodigoFamilia, setNuevoCodigoFamilia] = useState('');
  const [nuevasNotasFamilia, setNuevasNotasFamilia] = useState('');

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    setFotoError('');
    
    // Si el usuario cancela la selección
    if (!file) {
      setFotoFile(null);
      setFotoPreview('/usuarioVacio.png');
      return;
    }

    // 1. Validar formato (Solo JPG y PNG)
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setFotoError('Formato inválido. Solo se permiten imágenes JPG o PNG.');
      setFotoFile(null);
      setFotoPreview('/usuarioVacio.png');
      e.target.value = ''; // Limpiar el input
      return;
    }

    // 2. Validar peso máximo (Opcional, configurado a 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setFotoError('La imagen es muy pesada. El tamaño máximo es de 5MB.');
      setFotoFile(null);
      setFotoPreview('/usuarioVacio.png');
      e.target.value = ''; 
      return;
    }

    // Si pasa las validaciones, la guardamos y creamos una previsualización
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleNacionalidad = (countryName) => {
    setFormData((prev) => ({ ...prev, nacionalidad: countryName }));
    if (errors.nacionalidad) setErrors((prev) => ({ ...prev, nacionalidad: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (currentCapacity >= maxCapacity) {
      showNotification('El albergue ha alcanzado su capacidad máxima (50/50). Dé de baja a un residente activo antes de reingresar a otra persona.', 'error');
      return;
    }

    const newErrors = {};

    // Validar nombre
    const nombreTrim = formData.nombre.trim();
    if (!nombreTrim) {
      newErrors.nombre = 'El nombre es obligatorio';
    } else if (nombreTrim.length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombreTrim)) {
      newErrors.nombre = 'El nombre solo debe contener letras y espacios';
    }

    // Validar edad
    const edadNum = Number(formData.edad);
    if (formData.edad === '' || isNaN(edadNum)) {
      newErrors.edad = 'La edad es obligatoria';
    } else if (edadNum < 0 || edadNum > 120) {
      newErrors.edad = 'La edad debe estar entre 0 y 120 años';
    }

    // Validar nacionalidad
    if (!formData.nacionalidad || !formData.nacionalidad.trim()) {
      newErrors.nacionalidad = 'La nacionalidad es obligatoria';
    }

    // Validar fecha de ingreso (no puede ser en el futuro)
    if (!formData.fechaIngreso) {
      newErrors.fechaIngreso = 'La fecha de ingreso es obligatoria';
    } else {
      const hoy = new Date().toISOString().split('T')[0];
      if (formData.fechaIngreso > hoy) {
        newErrors.fechaIngreso = 'La fecha de ingreso no puede ser futura';
      }
    }

    // Validar fecha de viaje programada
    if (formData.viajeProgramado) {
      if (formData.fechaIngreso && formData.viajeProgramado < formData.fechaIngreso) {
        newErrors.viajeProgramado = 'La fecha de viaje no puede ser anterior al ingreso';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const residentToSave = {
      ...formData,
      id: Date.now().toString(),
      edad: Number(formData.edad),
      estado: 'activo'
    };

    onSave(residentToSave, fotoFile);
  };

  return (
    <div style={styles.container} className="view-container mobile-padding">
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Dar de Alta Residente</h2>
          <p style={styles.subtitle}>Registre una nueva persona en las instalaciones del albergue</p>
        </div>
        <div style={styles.capacityIndicator}>
          Capacidad actual: <strong style={{ color: currentCapacity >= maxCapacity ? 'var(--error-color)' : 'var(--success-color)' }}>{currentCapacity} / {maxCapacity}</strong>
        </div>
      </div>
<div style={styles.detailsGroup}>
  <h3 style={styles.groupTitle}>Fotografía del Residente (Opcional)</h3>
  <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '16px' }}>
    
    <div style={styles.avatarWrapper}>
      <img src={fotoPreview} alt="Vista previa" style={styles.avatarImg} />
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label style={styles.uploadButton}>
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
        </svg>
        Seleccionar Foto
        <input 
          type="file" 
          accept="image/jpeg, image/png, image/jpg" 
          onChange={handleFotoChange} 
          style={{ display: 'none' }} 
        />
      </label>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        Formatos aceptados: JPG, PNG.
      </span>
      {fotoError && (
        <span style={{ color: 'var(--error-color)', fontSize: '0.85rem', fontWeight: '600' }}>
          {fotoError}
        </span>
      )}
    </div>
  </div>
</div>
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Sección 1: Datos Personales */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>1. Datos Personales</h3>
          <div className="grid-3-cols">
            <div style={styles.formGroup} className="span-2">
              <label htmlFor="nombre" style={styles.label}>Nombre Completo *</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="form-control"
                style={{ borderColor: errors.nombre ? 'var(--error-color)' : '' }}
                placeholder="Ej. Juan Carlos Pérez Martínez"
              />
              {errors.nombre && <span style={styles.errorText}>{errors.nombre}</span>}
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="sexo" style={styles.label}>Sexo *</label>
              <select
                id="sexo"
                name="sexo"
                value={formData.sexo}
                onChange={handleChange}
                className="form-control"
              >
                <option value="M">Masculino (M)</option>
                <option value="F">Femenino (F)</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="edad" style={styles.label}>Edad (años) *</label>
              <input
                type="number"
                id="edad"
                name="edad"
                value={formData.edad}
                onChange={handleChange}
                className="form-control"
                style={{ borderColor: errors.edad ? 'var(--error-color)' : '' }}
                min="0"
                max="120"
                placeholder="Ej. 28"
              />
              {errors.edad && <span style={styles.errorText}>{errors.edad}</span>}
            </div>

            {/* ── Nacionalidad con buscador ── */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Nacionalidad *</label>
              <CountrySelector
                countries={countries}
                value={formData.nacionalidad}
                onChange={handleNacionalidad}
                hasError={!!errors.nacionalidad}
                inputStyle={{}}
              />
              {errors.nacionalidad && <span style={styles.errorText}>{errors.nacionalidad}</span>}
            </div>

            {/* Selector de Familia Dinamico */}
<div style={styles.field}>
  <label style={styles.fieldLabel}>Familia / Grupo</label>
  <select
    name="familiaId"
    value={showNuevaFamiliaForm ? 'NEW_FAMILY' : (formData.familiaId || '')}
    onChange={(e) => {
      if (e.target.value === 'NEW_FAMILY') {
        setShowNuevaFamiliaForm(true);
        setFormData(prev => ({ ...prev, familiaId: '' }));
      } else {
        setShowNuevaFamiliaForm(false);
        setFormData(prev => ({ ...prev, familiaId: e.target.value }));
      }
    }}
    className="form-control"
  >
    <option value="">Individual (Ninguno)</option>
    {familias?.map(f => (
      <option key={f.id} value={f.id}>{f.codigo_familia}</option>
    ))}
    <option value="NEW_FAMILY" style={{ fontWeight: 'bold', color: 'var(--primary-dark)' }}>
      + Registrar una nueva familia...
    </option>
  </select>
</div>

{/* Sub-formulario condicional si eligen registrar nueva familia */}
{showNuevaFamiliaForm && (
  <div style={styles.newFamilyBox} className="fade-in">
    <h4 style={styles.newFamilyTitle}>Datos de la Nueva Familia</h4>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div>
        <label style={styles.fieldLabel}>Codigo de Familia (Ej: FAM-100)</label>
        <input 
          type="text" 
          value={nuevoCodigoFamilia} 
          onChange={(e) => setNuevoCodigoFamilia(e.target.value.toUpperCase())}
          className="form-control"
          placeholder="Escribe el codigo identificador"
        />
      </div>
      <div>
        <label style={styles.fieldLabel}>Notas de la Familia</label>
        <textarea 
          value={nuevasNotasFamilia} 
          onChange={(e) => setNuevasNotasFamilia(e.target.value)}
          className="form-control"
          placeholder="Notas o procedencia del grupo familiar"
          rows="2"
        />
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button 
          type="button" 
          onClick={() => { setShowNuevaFamiliaForm(false); setNuevoCodigoFamilia(''); setNuevasNotasFamilia(''); }}
          style={styles.btnSmallSecondary}
        >
          Cancelar
        </button>
        <button 
          type="button" 
          onClick={async () => {
            if(!nuevoCodigoFamilia.trim()) return alert('El codigo de familia es obligatorio');
            const nuevoId = await onCrearFamilia(nuevoCodigoFamilia, nuevasNotasFamilia);
            if(nuevoId) {
              setFormData(prev => ({ ...prev, familiaId: nuevoId }));
              setShowNuevaFamiliaForm(false);
              setNuevoCodigoFamilia('');
              setNuevasNotasFamilia('');
            }
          }}
          style={styles.btnSmallPrimary}
        >
          Crear y Asignar
        </button>
      </div>
    </div>
  </div>
)}
          </div>
        </div>

        {/* Sección 2: Expediente e Ingreso */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>2. Expediente e Ingreso</h3>
          <div className="grid-3-cols">
            <div style={styles.formGroup}>
              <label htmlFor="fechaIngreso" style={styles.label}>Fecha de Ingreso *</label>
              <input
                type="date"
                id="fechaIngreso"
                name="fechaIngreso"
                value={formData.fechaIngreso}
                onChange={handleChange}
                className="form-control"
                style={{ borderColor: errors.fechaIngreso ? 'var(--error-color)' : '' }}
              />
              {errors.fechaIngreso && <span style={styles.errorText}>{errors.fechaIngreso}</span>}
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="contactoEmergencia" style={styles.label}>Contacto de Emergencia</label>
              <input
                type="text"
                id="contactoEmergencia"
                name="contactoEmergencia"
                value={formData.contactoEmergencia}
                onChange={handleChange}
                className="form-control"
                placeholder="Teléfono y nombre de contacto"
              />
            </div>

            <div style={styles.formGroup} className="span-3">
              <label htmlFor="condicion" style={styles.label}>Condiciones Particulares (Salud / Legal / Vulnerabilidad)</label>
              <textarea
                id="condicion"
                name="condicion"
                value={formData.condicion}
                onChange={handleChange}
                className="form-control"
                placeholder="Describa si el residente tiene alguna condición médica, discapacidad, estado de vulnerabilidad o requerimientos especiales..."
              />
            </div>
          </div>
        </div>

        {/* Sección 3: Programación de Viaje */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>3. Programación de Viaje (Opcional)</h3>
          <div className="grid-3-cols">
            <div style={styles.formGroup}>
              <label htmlFor="destino" style={styles.label}>Destino Previsto</label>
              <input
                type="text"
                id="destino"
                name="destino"
                value={formData.destino}
                onChange={handleChange}
                className="form-control"
                placeholder="Ej. Tucson, Arizona, USA"
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="viajeProgramado" style={styles.label}>Fecha Programada de Viaje</label>
              <input
                type="date"
                id="viajeProgramado"
                name="viajeProgramado"
                value={formData.viajeProgramado}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>
        </div>

        {/* Botones */}
        <div style={styles.buttonContainer}>
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Guardar Residente
          </button>
        </div>
      </form>
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
  capacityIndicator: {
    fontSize: '0.92rem',
    fontWeight: '600',
    backgroundColor: 'var(--surface-color)',
    border: '1px solid var(--border-color)',
    padding: '8px 16px',
    borderRadius: '12px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    maxWidth: '850px',
  },
  section: {
    backgroundColor: 'var(--surface-color)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: 'var(--card-shadow)',
  },
  sectionTitle: {
    fontSize: '1.05rem',
    fontWeight: '700',
    color: 'var(--primary-dark)',
    marginBottom: '20px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '8px',
  },
 
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  label: {
    fontSize: '0.82rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    marginBottom: '6px',
  },
  input: {
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1.5px solid var(--border-color)',
    backgroundColor: 'var(--bg-color)',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    fontFamily: 'var(--font-family)',
    transition: 'var(--transition-smooth)',
    outline: 'none',
    '&:focus': {
      borderColor: 'var(--primary-dark)',
      backgroundColor: '#ffffff',
    }
  },
  select: {
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1.5px solid var(--border-color)',
    backgroundColor: 'var(--bg-color)',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    fontFamily: 'var(--font-family)',
    outline: 'none',
    cursor: 'pointer',
  },
  textarea: {
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1.5px solid var(--border-color)',
    backgroundColor: 'var(--bg-color)',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    fontFamily: 'var(--font-family)',
    minHeight: '80px',
    resize: 'vertical',
    outline: 'none',
  },
  errorText: {
    color: 'var(--error-color)',
    fontSize: '0.78rem',
    fontWeight: '600',
    marginTop: '4px',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '8px',
  },
  avatarWrapper: {
    width: '90px',
    height: '110px',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '2px dashed var(--border-color)',
    backgroundColor: '#e6f2f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
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
    fontSize: '0.9rem',
    cursor: 'pointer',
    border: '1px solid var(--border-color)',
    transition: 'var(--transition-smooth)',
  },
  newFamilyBox: {
    gridColumn: 'span 3',
    backgroundColor: 'var(--bg-color)',
    border: '1.5px dashed var(--primary)',
    borderRadius: '12px',
    padding: '16px',
    marginTop: '8px',
  },
  newFamilyTitle: {
    margin: '0 0 12px 0',
    fontSize: '0.95rem',
    fontWeight: '700',
    color: 'var(--primary-dark)',
    textTransform: 'uppercase',
  },
  btnSmallPrimary: {
    padding: '6px 12px',
    backgroundColor: 'var(--primary)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '0.82rem',
    cursor: 'pointer'
  },
  btnSmallSecondary: {
    padding: '6px 12px',
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '0.82rem',
    cursor: 'pointer'
  }
};
