// La ruta base de nuestro servidor backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Función para obtener los headers con el token guardado
const getAuthHeaders = (isFormData = false) => {
  const token = localStorage.getItem('albergue_token');
  const headers = {
    'Authorization': `Bearer ${token}`
  };
  
  // Si NO estamos enviando un archivo (FormData), avisamos que enviamos JSON
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  return headers;
};

// --- AUTENTICACIÓN ---
export const loginAPI = async (username, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.mensaje || 'Error al iniciar sesión');
  return data;
};

// --- LECTURA DE DATOS ---

// Funcion utilitaria para formatear lo que viene de MySQL al estilo de React
const formatearResidente = (r) => ({
  ...r, // Conserva id, nombre, sexo, edad, nacionalidad, condicion, destino, estado
  familiaId: r.familia_id,
  fechaIngreso: r.fecha_ingreso ? r.fecha_ingreso.split('T')[0] : '',
  contactoEmergencia: r.contacto_emergencia,
  viajeProgramado: r.viaje_programado ? r.viaje_programado.split('T')[0] : '',
  fotoUrl: r.foto_url
});

export const getActivosAPI = async () => {
  const response = await fetch(`${API_URL}/residentes/activos`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Error al obtener residentes activos');
  const data = await response.json();
  return data.map(formatearResidente);
};

export const getArchivadosAPI = async () => {
  const response = await fetch(`${API_URL}/residentes/archivados`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Error al obtener el historial');
  const data = await response.json();
  return data.map(formatearResidente);
};

// --- ESCRITURA Y ACTUALIZACIÓN (Usan FormData para soportar la foto) ---
export const registrarResidenteAPI = async (formData) => {
  const response = await fetch(`${API_URL}/residentes/registrar`, {
    method: 'POST',
    headers: getAuthHeaders(true), // true porque enviamos imagen
    body: formData
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.mensaje || 'Error al registrar');
  return data;
};

export const actualizarResidenteAPI = async (id, formData) => {
  const response = await fetch(`${API_URL}/residentes/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(true), // true porque podemos enviar imagen nueva
    body: formData
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.mensaje || 'Error al actualizar');
  return data;
};

export const getFamiliasAPI = async () => {
  const response = await fetch(`${API_URL}/familias`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Error al obtener el listado de familias');
  return response.json();
};

export const crearFamiliaAPI = async (familiaData) => {
  const response = await fetch(`${API_URL}/familias`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(familiaData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.mensaje || 'Error al crear la familia');
  return data;
};

// --- CAMBIOS DE ESTADO ---
export const archivarResidenteAPI = async (id) => {
  const response = await fetch(`${API_URL}/residentes/${id}/archivar`, {
    method: 'PATCH',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.mensaje || 'Error al archivar');
  return data;
};

export const reingresarResidenteAPI = async (id) => {
  const response = await fetch(`${API_URL}/residentes/${id}/reingresar`, {
    method: 'PATCH',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.mensaje || 'Error al reingresar');
  return data;
};