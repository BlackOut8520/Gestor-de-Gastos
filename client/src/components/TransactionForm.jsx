import { useState, useEffect } from 'react'

// ACTUALIZACIÓN: Ahora recibimos "token" en los props
function TransactionForm({ onTransactionAdded, editingTransaction, token }) {
  
  // Estados iniciales vacíos
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('gasto') 
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'))
  const [category, setCategory] = useState('')
  
  const [availableCategories, setAvailableCategories] = useState([]) 
  const [isCustomCategory, setIsCustomCategory] = useState(false) 

  // --- EFECTO: CARGAR CATEGORÍAS ---
  useEffect(() => {
    if (token) {
        fetchCategories();
    }
  }, [token]) // Se ejecuta al recibir el token

  // --- EFECTO: DETECTAR SI VAMOS A EDITAR ---
  useEffect(() => {
    if (editingTransaction) {
        setDescription(editingTransaction.description);
        setAmount(Math.abs(editingTransaction.amount));
        setType(editingTransaction.type);
        setDate(editingTransaction.date);
        setCategory(editingTransaction.category);
    } else {
        setDescription('');
        setAmount('');
        setType('gasto');
        setDate(new Date().toLocaleDateString('en-CA'));
        setCategory('');
    }
  }, [editingTransaction])


  const fetchCategories = () => {
    // ACTUALIZACIÓN: Enviamos el token para obtener categorías
    fetch('http://localhost:4000/api/categories', {
        headers: { 'auth-token': token }
    })
      .then(res => res.json())
      .then(data => {
          if(Array.isArray(data)) setAvailableCategories(data);
      })
      .catch(err => console.error(err))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!description || !amount || !category) return

    // 1. Guardar categoría nueva si aplica
    if (isCustomCategory) {
      await fetch('http://localhost:4000/api/categories', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'auth-token': token // <--- Header de seguridad
        },
        body: JSON.stringify({ name: category, type }) 
      });
      fetchCategories(); 
    }

    const finalAmount = type === 'gasto' ? -Math.abs(amount) : Math.abs(amount);

    const transactionData = {
      description,
      amount: finalAmount,
      type,
      category, 
      date 
    }

    // --- DECISIÓN: ¿CREAR O EDITAR? ---
    if (editingTransaction) {
        // MODO EDICIÓN (PUT)
        fetch(`http://localhost:4000/api/transactions/${editingTransaction._id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'auth-token': token // <--- Header de seguridad
            },
            body: JSON.stringify(transactionData)
        })
        .then(res => res.json())
        .then(data => {
            onTransactionAdded(data); 
            setIsCustomCategory(false);
        });

    } else {
        // MODO CREACIÓN (POST)
        fetch('http://localhost:4000/api/transactions', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'auth-token': token // <--- Header de seguridad
            },
            body: JSON.stringify(transactionData)
        })
        .then(res => res.json())
        .then(data => {
            onTransactionAdded(data);
            setDescription('');
            setAmount('');
            setIsCustomCategory(false);
        });
    }
  }

  const filteredCategories = availableCategories.filter(c => c.type === type);

  return (
    <div className="form-container">
      <h3>{editingTransaction ? '✏️ Editar Movimiento' : 'Agregar Movimiento'}</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Fecha</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <input 
          type="text" 
          placeholder="Descripción" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          required
        />
        <input 
          type="number" 
          placeholder="Monto" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
          required
        />
        <div className="form-row">
            <select 
                value={type} 
                onChange={(e) => {
                    setType(e.target.value);
                    if(!editingTransaction) setCategory('');
                    setIsCustomCategory(false);
                }}
            >
                <option value="ingreso">Ingreso</option>
                <option value="gasto">Gasto</option>
            </select>

            {isCustomCategory ? (
                <div style={{ display: 'flex', gap: '5px', width: '100%' }}>
                    <input 
                        type="text" 
                        placeholder="Nueva categoría..." 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)}
                        autoFocus
                    />
                    <button type="button" onClick={() => setIsCustomCategory(false)}>✖</button>
                </div>
            ) : (
                <select value={category} onChange={(e) => e.target.value === 'NEW_CUSTOM' ? setIsCustomCategory(true) : setCategory(e.target.value)} required>
                    <option value="">-- Categoría --</option>
                    {filteredCategories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                    <option value="NEW_CUSTOM">➕ Crear nueva...</option>
                </select>
            )}
        </div>
        <button className="btn-block">
            {editingTransaction ? 'Guardar Cambios' : 'Agregar Transacción'}
        </button>
      </form>
    </div>
  )
}

export default TransactionForm