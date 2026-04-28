import { useState, useEffect } from 'react'
import { Calendar, Tag, DollarSign, Type, Plus, X } from 'lucide-react'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// --- CONFIGURACIÓN DE LA API ---
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// --- HELPERS PARA EL DATEPICKER ---
const parseDateString = (dateString) => {
  if (!dateString || typeof dateString !== 'string' || !dateString.includes('-')) {
    return new Date();
  }
  try {
    const [y, m, d] = dateString.split('-');
    return new Date(y, m - 1, d);
  } catch (error) {
    return new Date();
  }
};

const formatDateObj = (dateObj) => {
  if (!dateObj) return '';
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function TransactionForm({ onTransactionAdded, editingTransaction, token }) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('gasto') 
  // Inicializamos con la fecha actual formateada YYYY-MM-DD
  const [date, setDate] = useState(formatDateObj(new Date()))
  const [category, setCategory] = useState('')
  const [availableCategories, setAvailableCategories] = useState([]) 
  const [isCustomCategory, setIsCustomCategory] = useState(false) 

  useEffect(() => {
    if (token) fetchCategories();
  }, [token])

  useEffect(() => {
    if (editingTransaction) {
        setDescription(editingTransaction.description);
        setAmount(Math.abs(editingTransaction.amount));
        setType(editingTransaction.type);
        setDate(editingTransaction.date);
        setCategory(editingTransaction.category);
        setIsCustomCategory(false);
    } else {
        setDescription('');
        setAmount('');
        setType('gasto');
        setDate(formatDateObj(new Date()));
        setCategory('');
        setIsCustomCategory(false);
    }
  }, [editingTransaction])

  const fetchCategories = () => {
    fetch(`${API_BASE_URL}/api/categories`, {
        headers: { 'auth-token': token }
    })
      .then(res => res.json())
      .then(data => { if(Array.isArray(data)) setAvailableCategories(data); })
      .catch(err => console.error(err))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!description || !amount || !category) return 

    if (isCustomCategory) {
      await fetch(`${API_BASE_URL}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'auth-token': token },
        body: JSON.stringify({ name: category, type }) 
      });
      fetchCategories(); 
    }

    const finalAmount = type === 'gasto' ? -Math.abs(amount) : Math.abs(amount);
    const transactionData = { description, amount: finalAmount, type, category, date }

    const method = editingTransaction ? 'PUT' : 'POST';
    const url = editingTransaction 
        ? `${API_BASE_URL}/api/transactions/${editingTransaction._id}`
        : `${API_BASE_URL}/api/transactions`;

    fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'auth-token': token },
        body: JSON.stringify(transactionData)
    })
    .then(res => res.json())
    .then(data => {
        onTransactionAdded(data); 
        if(!editingTransaction) {
            setDescription('');
            setAmount('');
            setCategory('');
        }
        setIsCustomCategory(false);
    });
  }

  const handleCategoryChange = (e) => {
    if (e.target.value === 'NEW_CUSTOM') {
      setIsCustomCategory(true);
      setCategory(''); 
    } else {
      setIsCustomCategory(false);
      setCategory(e.target.value);
    }
  };

  const filteredCategories = availableCategories.filter(c => c.type === type);

return (
  <div style={{ padding: '8px' }}>
    
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', padding: '10px', color: 'white', borderRadius: '12px', width: 'fit-content' }}>
        <Plus size={20} />
      </div>
      <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>
        {editingTransaction ? 'Editar Movimiento' : 'Nuevo Movimiento'}
      </h3>
    </div>
    
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* FECHA (CON REACT-DATEPICKER MODAL) */}
      <div>
        <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Fecha</label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {/* Aumentamos el z-index del ícono para que no quede tapado */}
          <Calendar size={18} style={{ position: 'absolute', left: '16px', color: '#94a3b8', zIndex: 10 }} />
          <div style={{ width: '100%' }}>
            <DatePicker 
              selected={parseDateString(date)} 
              onChange={(d) => setDate(formatDateObj(d))} 
              dateFormat="dd/MM/yyyy"
              withPortal
              customInput={
                <input 
                  className="bento-input" 
                  style={{ paddingLeft: '48px', width: '100%', boxSizing: 'border-box' }} 
                />
              }
            />
          </div>
        </div>
      </div>

      {/* CONCEPTO */}
      <div>
        <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Concepto</label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Type size={18} style={{ position: 'absolute', left: '16px', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Ej. Suscripción Netflix" 
            className="bento-input"
            style={{ paddingLeft: '48px' }}
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            required
          />
        </div>
      </div>

      {/* CANTIDAD */}
      <div>
        <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Cantidad</label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <DollarSign size={18} style={{ position: 'absolute', left: '16px', color: '#94a3b8' }} />
          <input 
            type="number" 
            placeholder="0.00" 
            className="bento-input"
            style={{ paddingLeft: '48px', fontWeight: 'bold', fontSize: '1.25rem' }}
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            required
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* TIPO */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Tipo</label>
            <select 
                className="bento-input bento-select"
                value={type} 
                onChange={(e) => {
                  setType(e.target.value);
                  setCategory(''); 
                  setIsCustomCategory(false);
                }}
            >
                <option value="ingreso">🟢 Ingreso</option>
                <option value="gasto">🔴 Gasto</option>
            </select>
          </div>

          {/* CATEGORÍA */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Categoría</label>
            
            {isCustomCategory ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  className="bento-input"
                  placeholder="Ej. Nómina" 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                  autoFocus
                  required
                />
                <button 
                  type="button" 
                  onClick={() => { setIsCustomCategory(false); setCategory(''); }}
                  style={{ padding: '0 14px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', color: '#64748b' }}
                  title="Cancelar"
                >
                  ✖
                </button>
              </div>
            ) : (
              <select 
                  value={category} 
                  onChange={handleCategoryChange} 
                  className="bento-input bento-select"
                  required
              >
                  <option value="">Seleccionar</option>
                  {filteredCategories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                  <option value="NEW_CUSTOM">➕ Nueva...</option>
              </select>
            )}
          </div>
      </div>

      {/* BOTÓN REGISTRAR */}
      <button 
        type="submit"
        className="btn-bento-primary"
        style={{ 
          width: '100%', 
          marginTop: '16px', 
          padding: '14px', 
          fontSize: '1rem',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
          {editingTransaction ? 'Actualizar Movimiento' : 'Registrar Movimiento'}
      </button>
    </form>
  </div>
);
}

export default TransactionForm