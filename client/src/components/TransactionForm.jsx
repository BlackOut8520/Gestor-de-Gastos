import { useState, useEffect } from 'react'
import { Calendar, Tag, DollarSign, Type, Plus, X } from 'lucide-react'

// --- CONFIGURACIÓN DE LA API ---
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function TransactionForm({ onTransactionAdded, editingTransaction, token }) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('gasto') 
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'))
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
    } else {
        setDescription('');
        setAmount('');
        setType('gasto');
        setDate(new Date().toLocaleDateString('en-CA'));
        setCategory('');
    }
  }, [editingTransaction])

  const fetchCategories = () => {
    // MODIFICACIÓN: Usar API_BASE_URL
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
      // MODIFICACIÓN: Usar API_BASE_URL
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
    // MODIFICACIÓN: Usar API_BASE_URL
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
        }
        setIsCustomCategory(false);
    });
  }

  const filteredCategories = availableCategories.filter(c => c.type === type);

return (
  <div className="p-2">
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-900 text-white rounded-lg">
          <Plus size={20} />
        </div>
        <h3 className="text-xl font-bold text-slate-800">
          {editingTransaction ? 'Editar Movimiento' : 'Nuevo Movimiento'}
        </h3>
      </div>
    </div>
    
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* FECHA */}
      <div>
        <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Fecha</label>
        <div className="relative flex items-center">
          <Calendar className="absolute left-4 text-slate-400 pointer-events-none" size={18} />
          <input 
            type="date" 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-700"
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            required 
          />
        </div>
      </div>

      {/* CONCEPTO */}
      <div>
        <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Concepto</label>
        <div className="relative flex items-center">
          <Type className="absolute left-4 text-slate-400 pointer-events-none" size={18} />
          <input 
            type="text" 
            placeholder="Ej. Suscripción Netflix" 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-700"
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            required
          />
        </div>
      </div>

      {/* CANTIDAD */}
      <div>
        <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Cantidad</label>
        <div className="relative flex items-center">
          <DollarSign className="absolute left-4 text-slate-400 pointer-events-none" size={18} />
          <input 
            type="number" 
            placeholder="0.00" 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-xl text-slate-900"
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Tipo</label>
            <select 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-slate-700 appearance-none"
                value={type} 
                onChange={(e) => setType(e.target.value)}
            >
                <option value="ingreso">🟢 Ingreso</option>
                <option value="gasto">🔴 Gasto</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Categoría</label>
            <select 
                value={category} 
                onChange={(e) => e.target.value === 'NEW_CUSTOM' ? setIsCustomCategory(true) : setCategory(e.target.value)} 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-slate-700 appearance-none"
                required
            >
                <option value="">Seleccionar</option>
                {filteredCategories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                <option value="NEW_CUSTOM">➕ Nueva...</option>
            </select>
          </div>
      </div>

      <button 
        type="submit"
        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-black hover:shadow-xl hover:shadow-slate-200 transform active:scale-[0.98] transition-all mt-4 border-none cursor-pointer"
      >
          {editingTransaction ? 'Actualizar Movimiento' : 'Registrar Movimiento'}
      </button>
    </form>
  </div>
);
}

export default TransactionForm