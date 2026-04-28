// client/src/components/AiChat.jsx
import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import toast, { Toaster } from 'react-hot-toast';

// --- CONFIGURACIÓN DE LA API ---
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const AiChat = ({ token, onVisualDataReceived }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pregunta, setPregunta] = useState('');
  const [cargando, setCargando] = useState(false);
  
  const [historialIA, setHistorialIA] = useState([]); 
  const [mensajesChat, setMensajesChat] = useState([]); 
  const [accionPendiente, setAccionPendiente] = useState(null);

  // Cargar historial de MongoDB al abrir el chat
  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        // MODIFICACIÓN: Usar API_BASE_URL
        const res = await fetch(`${API_BASE_URL}/api/ai/history`, {
          headers: { 'auth-token': token }
        });
        const data = await res.json();
        
        const formateadosParaChat = data.map(m => ({ role: m.role, texto: m.text }));
        setMensajesChat(formateadosParaChat);

        const formateadosParaIA = data.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));
        setHistorialIA(formateadosParaIA);
      } catch (error) {
        console.error("Error cargando historial:", error);
      }
    };
    if (isOpen && token) cargarHistorial();
  }, [isOpen, token]);

  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensajesChat, cargando]);

  // FUNCIÓN PARA EJECUTAR EL REGISTRO REAL EN DB
  const confirmarRegistro = async (payload) => {
    try {
      // MODIFICACIÓN: Usar API_BASE_URL
      const res = await fetch(`${API_BASE_URL}/api/transactions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'auth-token': token 
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(`¡${payload.type === 'gasto' ? 'Gasto' : 'Ingreso'} registrado!`, {
          style: { borderRadius: '10px', background: '#333', color: '#fff' }
        });
        setAccionPendiente(null);
      }
    } catch (error) {
      toast.error("Error al guardar la transacción.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pregunta.trim()) return;

    const preguntaActual = pregunta;
    setMensajesChat(prev => [...prev, { role: 'user', texto: preguntaActual }]);
    setPregunta('');
    setCargando(true);
    setAccionPendiente(null);

    try {
      // MODIFICACIÓN: Usar API_BASE_URL
      const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token
        },
        body: JSON.stringify({ 
          pregunta: preguntaActual, 
          historial: historialIA 
        })
      });

      const data = await res.json();

      if (data.respuesta) {
        const respuestaTexto = data.respuesta.texto;
        setMensajesChat(prev => [...prev, { role: 'model', texto: respuestaTexto }]);

        if (data.respuesta.action?.type === 'CONFIRM_TRANSACTION') {
          setAccionPendiente(data.respuesta.action.payload);
        }

        if (onVisualDataReceived) onVisualDataReceived(data.respuesta.visual);

        setHistorialIA(prev => [
          ...prev,
          { role: "user", parts: [{ text: preguntaActual }] },
          { role: "model", parts: [{ text: respuestaTexto }] }
        ]);
      }
    } catch (error) {
      setMensajesChat(prev => [...prev, { role: 'model', texto: "❌ Error de conexión." }]);
    } finally {
      setCargando(false);
    }
  };

  // ... (Resto del componente y estilos se mantienen iguales)
  return (
    <>
      <Toaster position="top-center" /> 
      
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} style={styles.floatingButton}>
          ✨ IA
        </button>
      )}

      {isOpen && (
        <div style={styles.chatWindow}>
          <div style={styles.header}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#222222', fontWeight: '600' }}>Asistente IA ✨</h3>
            <button onClick={() => setIsOpen(false)} style={styles.closeButton}>✕</button>
          </div>
          
          <div style={styles.responseArea} ref={scrollRef}>
            {mensajesChat.length === 0 && !cargando && (
              <p style={{ margin: 0, color: '#717171' }}>¡Hola! Pregúntame sobre tus finanzas.</p>
            )}

            {mensajesChat.map((msg, index) => (
              <div 
                key={index} 
                style={{
                  ...styles.messageBubble,
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor: msg.role === 'user' ? '#f3f4f6' : 'transparent',
                  padding: msg.role === 'user' ? '10px 14px' : '0',
                  borderRadius: '12px',
                  marginBottom: '10px'
                }}
              >
                <ReactMarkdown>{msg.texto}</ReactMarkdown>

                {index === mensajesChat.length - 1 && accionPendiente && (
                  <div style={styles.confirmCard}>
                    <div style={styles.confirmInfo}>
                      <strong>{accionPendiente.description}</strong>
                      <span>${accionPendiente.amount} | {accionPendiente.date}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <button 
                        onClick={() => confirmarRegistro(accionPendiente)}
                        style={styles.confirmBtn}
                      >
                        Confirmar ✅
                      </button>
                      <button 
                        onClick={() => setAccionPendiente(null)}
                        style={styles.cancelBtn}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {cargando && (
              <p style={{ color: '#717171', margin: '10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={styles.spinner}></span> Analizando...
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <input 
              type="text" 
              value={pregunta} 
              onChange={(e) => setPregunta(e.target.value)} 
              placeholder="Pregunta algo..."
              style={styles.input}
              disabled={cargando}
            />
            <button 
              type="submit" 
              disabled={cargando} 
              style={{...styles.submitButton, opacity: cargando ? 0.7 : 1}}
            >
              ↑
            </button>
          </form>
        </div>
      )}
    </>
  );
};

// ... (Los estilos permanecen iguales que en tu código original)
const styles = {
  floatingButton: {
    position: 'fixed', bottom: '24px', right: '24px', backgroundColor: '#222222',
    color: '#ffffff', border: 'none', borderRadius: '32px', padding: '14px 24px',
    fontSize: '1rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 6px 16px rgba(0,0,0,0.12)', zIndex: 1000
  },
  chatWindow: {
    position: 'fixed', bottom: '90px', right: '24px', width: '340px',
    backgroundColor: '#ffffff', border: '1px solid #ebebeb', borderRadius: '16px',
    boxShadow: '0 8px 28px rgba(0,0,0,0.12)', zIndex: 1000, display: 'flex', flexDirection: 'column', overflow: 'hidden'
  },
  header: {
    backgroundColor: '#ffffff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ebebeb'
  },
  closeButton: { background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer' },
  responseArea: {
    padding: '20px', height: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff'
  },
  messageBubble: { maxWidth: '90%', fontSize: '0.95rem', lineHeight: '1.5', display: 'flex', flexDirection: 'column' },
  form: { display: 'flex', padding: '16px 20px', borderTop: '1px solid #ebebeb', gap: '12px' },
  input: { flex: 1, padding: '12px 16px', borderRadius: '24px', border: '1px solid #b0b0b0', outline: 'none' },
  submitButton: {
    backgroundColor: '#FF385C', color: '#ffffff', border: 'none', borderRadius: '50%', width: '42px', height: '42px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer'
  },
  spinner: {
    display: 'inline-block', width: '12px', height: '12px', border: '2px solid rgba(0,0,0,0.1)', borderTopColor: '#717171', borderRadius: '50%', animation: 'spin 1s linear infinite'
  },
  confirmCard: {
    marginTop: '10px', padding: '12px', backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
  },
  confirmInfo: { display: 'flex', flexDirection: 'column', fontSize: '0.85rem', color: '#374151' },
  confirmBtn: {
    flex: 1, backgroundColor: '#10b981', color: 'white', border: 'none', padding: '8px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer'
  },
  cancelBtn: {
    flex: 1, backgroundColor: '#f3f4f6', color: '#4b5563', border: '1px solid #d1d5db', padding: '8px', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer'
  }
};

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
document.head.appendChild(styleSheet);

export default AiChat;