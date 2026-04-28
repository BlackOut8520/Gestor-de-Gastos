import { useState } from 'react';
import './Login.css';

// --- CONFIGURACIÓN DE LA API ---
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const Login = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
    const targetUrl = `${API_BASE_URL}${endpoint}`; // Extraemos la URL final

    // --- EL CHIVATO (Trampa para el celular) ---
    alert(`ATENCIÓN: Intentando conectar a:\n${targetUrl}`);
    // ------------------------------------------

    try {
      // MODIFICACIÓN: Usamos la variable targetUrl que acabamos de crear
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Error en la solicitud');

      if (isRegistering) {
        alert("¡Registro exitoso! Ahora inicia sesión.");
        setIsRegistering(false);
      } else {
        const nameToSave = data.username || (data.user && data.user.username) || 'Usuario';
        localStorage.setItem('auth-user', nameToSave); 
        onLogin(data.token);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}</h2>
        {error && <p className="error-msg">{error}</p>}
        
        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <input 
              type="text" name="username" placeholder="Nombre de usuario" 
              value={formData.username} onChange={handleChange} required 
            />
          )}
          <input 
            type="email" name="email" placeholder="Correo electrónico" 
            value={formData.email} onChange={handleChange} required 
          />
          <input 
            type="password" name="password" placeholder="Contraseña" 
            value={formData.password} onChange={handleChange} required 
          />
          
          <button type="submit" className="btn-block">
            {isRegistering ? 'Registrarse' : 'Entrar'}
          </button>
        </form>

        <p onClick={() => setIsRegistering(!isRegistering)} className="toggle-link">
          {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
        </p>
      </div>
    </div>
  );
};