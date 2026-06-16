import React, { useState } from 'react';
import { loginAPI } from '../api'; // <-- Importamos nuestra conexión

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Para mostrar que está cargando

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Llamamos al backend
      const respuesta = await loginAPI(username, password);
      
      // Si fue exitoso, guardamos el token en la computadora
      localStorage.setItem('albergue_token', respuesta.token);
      
      // Le avisamos a App.jsx que ya entramos y le pasamos los datos del usuario
      onLogin(respuesta.usuario);
      
    } catch (err) {
      // Si falla (contraseña incorrecta, etc), mostramos el error del servidor
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="login-container" style={styles.container}>
      {/* Background Image Layer */}
      <div style={styles.backgroundImage}></div>
      <div style={styles.overlay}></div>

      {/* Glassmorphic Login Box */}
      <div style={styles.loginBox}>
        <div style={styles.logoContainer}>
          <img 
            src="/logoSLRC.png" 
            alt="Logo San Luis Río Colorado" 
            style={styles.logo}
            onError={(e) => {
              // Fallback text if logo fails to load
              e.target.style.display = 'none';
            }}
          />
          <h2 style={styles.title}>Albergue Municipal</h2>
          <p style={styles.subtitle}>San Luis Río Colorado, Sonora</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.errorAlert}>{error}</div>}

          <div style={styles.inputWrapper}>
            <input
              type="text"
              id="username"
              placeholder="Usuario / Correo"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
            />
            <span style={styles.inputIcon}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
          </div>

          <div style={styles.inputWrapper}>
            <input
              type="password"
              id="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
            <span style={styles.inputIcon}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
          </div>

          <button 
            type="submit" 
            style={{
              ...styles.submitBtn,
              background: isLoading ? 'var(--secondary)' : 'linear-gradient(135deg, var(--accent) 0%, var(--primary-dark) 100%)',
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <span style={styles.spinner}></span>
            ) : (
              <>
                Entrar
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </>
            )}
          </button>
        </form>

        <div style={styles.forgotPasswordContainer}>
          <a 
            href="#olvido" 
            onClick={(e) => {
              e.preventDefault();
              alert('Por favor, póngase en contacto con el administrador de sistemas del ayuntamiento para restablecer su contraseña.');
            }}
            style={styles.forgotLink}
          >
            ¿Ha olvidado sus datos de acceso?
          </a>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url("/Iglesia_inmaculada_concepción_SLRC.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'scale(1.02)',
    zIndex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(11, 28, 27, 0.45)', // Tinted overlay matching primary colors
    backdropFilter: 'blur(3px)',
    zIndex: 2,
  },
  loginBox: {
    position: 'relative',
    zIndex: 3,
    width: '100%',
    maxWidth: '430px',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    border: '2px solid rgba(138, 43, 226, 0.35)', // Purplish accent border as seen in Canva
    borderRadius: '24px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25), 0 0 20px rgba(0, 227, 215, 0.15)',
    padding: '40px 32px',
    backdropFilter: 'blur(12px) saturate(180%)',
    margin: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    animation: 'fadeInUp 0.6s ease-out',
  },
  logoContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '32px',
    textAlign: 'center',
  },
  logo: {
    maxHeight: '75px',
    maxWidth: '220px',
    objectFit: 'contain',
    marginBottom: '16px',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#082522',
    lineHeight: '1.2',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: '#345552',
    marginTop: '4px',
    fontWeight: '500',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  errorAlert: {
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
    color: 'var(--error-color)',
    padding: '12px',
    borderRadius: '12px',
    fontSize: '0.88rem',
    border: '1px solid rgba(211, 47, 47, 0.2)',
    fontWeight: '500',
    textAlign: 'center',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    width: '100%',
    padding: '15px 16px 15px 44px',
    borderRadius: '14px',
    border: '1.5px solid rgba(110, 176, 173, 0.5)',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    color: '#112c29',
    fontSize: '1rem',
    fontFamily: 'var(--font-family)',
    transition: 'var(--transition-smooth)',
    outline: 'none',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#487270',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
  },
  label: {
    position: 'absolute',
    left: '44px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#6e8c89',
    fontSize: '1rem',
    pointerEvents: 'none',
    transition: '0.2s ease all',
    fontWeight: '400',
  },
  /* Trigger labels to float on focus/input fill */
  submitBtn: {
    marginTop: '10px',
    width: '100%',
    padding: '15px',
    borderRadius: '14px',
    border: 'none',
    color: '#ffffff',
    fontSize: '1.05rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'var(--transition-smooth)',
    boxShadow: '0 4px 12px rgba(0, 150, 143, 0.25)',
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTopColor: '#ffffff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  forgotPasswordContainer: {
    marginTop: '24px',
    textAlign: 'center',
  },
  forgotLink: {
    color: '#112c29',
    fontSize: '0.9rem',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'color 0.2s',
  }
};

// Add float label trick styling using a stylesheet injection or directly inside input selectors
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .login-container input::placeholder {
      color: #6e8c89 !important;
      opacity: 1 !important;
      transition: color 0.15s ease;
    }
    .login-container input:focus::placeholder {
      color: transparent !important;
    }

    .login-container input:focus {
      border-color: var(--primary-dark) !important;
      background-color: #ffffff !important;
      box-shadow: 0 0 0 3px rgba(0, 227, 215, 0.2) !important;
    }

    .login-container a:hover {
      text-decoration: underline !important;
      color: var(--primary-dark) !important;
    }
  `;
  document.head.appendChild(style);
}
