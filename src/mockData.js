// Mock database for the SLRC Shelter in localStorage
const MOCK_KEY = 'albergue_residentes';

const SEED_RESIDENTS = [
  {
    id: '1',
    nombre: 'Cristiano Ronaldo',
    sexo: 'M',
    edad: 39,
    nacionalidad: 'Portugal',
    familiaId: 'CR7-MADRID',
    destino: 'Miami, USA',
    fechaIngreso: '2026-06-01',
    condicion: 'Salud Óptima',
    contactoEmergencia: '+34 600 000 000',
    viajeProgramado: '2026-06-25',
    estado: 'activo'
  },
  {
    id: '2',
    nombre: 'María Elena Santos',
    sexo: 'F',
    edad: 28,
    nacionalidad: 'Honduras',
    familiaId: 'FAM-204',
    destino: 'Phoenix, Arizona',
    fechaIngreso: '2026-06-05',
    condicion: 'Embarazo (5 meses) - Control médico al día',
    contactoEmergencia: '+504 9988-7766',
    viajeProgramado: '',
    estado: 'activo'
  },
  {
    id: '3',
    nombre: 'Mateo Santos Flores',
    sexo: 'M',
    edad: 6,
    nacionalidad: 'Honduras',
    familiaId: 'FAM-204',
    destino: 'Phoenix, Arizona',
    fechaIngreso: '2026-06-05',
    condicion: 'Sano - Cursando primaria',
    contactoEmergencia: '+504 9988-7766',
    viajeProgramado: '',
    estado: 'activo'
  },
  {
    id: '4',
    nombre: 'Jean Baptiste Pierre',
    sexo: 'M',
    edad: 32,
    nacionalidad: 'Haití',
    familiaId: 'IND-901',
    destino: 'Tijuana, México',
    fechaIngreso: '2026-05-15',
    condicion: 'Búsqueda de empleo local - Trámite CURP',
    contactoEmergencia: '+509 3322-1100',
    viajeProgramado: '2026-06-18',
    estado: 'activo'
  },
  {
    id: '5',
    nombre: 'Gabriela Ruiz Domínguez',
    sexo: 'F',
    edad: 42,
    nacionalidad: 'México',
    familiaId: 'FAM-092',
    destino: 'Los Ángeles, California',
    fechaIngreso: '2026-06-10',
    condicion: 'Deshidratación leve - En recuperación',
    contactoEmergencia: '+52 653 100 2233',
    viajeProgramado: '',
    estado: 'activo'
  },
  {
    id: '6',
    nombre: 'Sofía Ruiz Domínguez',
    sexo: 'F',
    edad: 14,
    nacionalidad: 'México',
    familiaId: 'FAM-092',
    destino: 'Los Ángeles, California',
    fechaIngreso: '2026-06-10',
    condicion: 'Sana',
    contactoEmergencia: '+52 653 100 2233',
    viajeProgramado: '',
    estado: 'activo'
  },
  {
    id: '7',
    nombre: 'Carlos Manuel Tejeda',
    sexo: 'M',
    edad: 21,
    nacionalidad: 'Guatemala',
    familiaId: 'IND-456',
    destino: 'Denver, Colorado',
    fechaIngreso: '2026-05-20',
    condicion: 'Tratamiento por lesión en tobillo',
    contactoEmergencia: '+502 4433-2211',
    viajeProgramado: '2026-06-20',
    estado: 'activo'
  },
  {
    id: '8',
    nombre: 'Yusuf Al-Fayed',
    sexo: 'M',
    edad: 45,
    nacionalidad: 'Siria',
    familiaId: 'FAM-880',
    destino: 'Montreal, Canadá',
    fechaIngreso: '2026-05-10',
    condicion: 'Estatus refugiado humanitario - Salud buena',
    contactoEmergencia: '+963 11 222 333',
    viajeProgramado: '2026-07-02',
    estado: 'activo'
  },
  {
    id: '9',
    nombre: 'Layla Al-Fayed',
    sexo: 'F',
    edad: 40,
    nacionalidad: 'Siria',
    familiaId: 'FAM-880',
    destino: 'Montreal, Canadá',
    fechaIngreso: '2026-05-10',
    condicion: 'Salud buena',
    contactoEmergencia: '+963 11 222 333',
    viajeProgramado: '2026-07-02',
    estado: 'activo'
  },
  {
    id: '10',
    nombre: 'Tariq Al-Fayed',
    sexo: 'M',
    edad: 10,
    nacionalidad: 'Siria',
    familiaId: 'FAM-880',
    destino: 'Montreal, Canadá',
    fechaIngreso: '2026-05-10',
    condicion: 'Sano',
    contactoEmergencia: '+963 11 222 333',
    viajeProgramado: '2026-07-02',
    estado: 'activo'
  },
  {
    id: '11',
    nombre: 'Roberto Gómez Bolaños',
    sexo: 'M',
    edad: 73,
    nacionalidad: 'México',
    familiaId: 'IND-001',
    destino: 'Guadalajara, México',
    fechaIngreso: '2026-04-01',
    condicion: 'Crónico estable (Diabetes)',
    contactoEmergencia: '+52 55 5555 5555',
    viajeProgramado: '',
    estado: 'archivado'
  },
  {
    id: '12',
    nombre: 'Ana María Orozco',
    sexo: 'F',
    edad: 35,
    nacionalidad: 'Colombia',
    familiaId: 'IND-012',
    destino: 'Bogota, Colombia',
    fechaIngreso: '2026-04-10',
    condicion: 'Saludable',
    contactoEmergencia: '+57 300 123 4567',
    viajeProgramado: '2026-05-01',
    estado: 'archivado'
  }
];

export const initDB = () => {
  const data = localStorage.getItem(MOCK_KEY);
  if (!data || data.includes('Portugués') || data.includes('Hondureña') || data.includes('Mexicana')) {
    localStorage.setItem(MOCK_KEY, JSON.stringify(SEED_RESIDENTS));
  }
};

export const getResidents = () => {
  initDB();
  return JSON.parse(localStorage.getItem(MOCK_KEY));
};

export const saveResidents = (residents) => {
  localStorage.setItem(MOCK_KEY, JSON.stringify(residents));
};

export const calculateDaysRefuged = (dateStr) => {
  const checkIn = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now - checkIn);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};
