import { useState, useEffect } from 'react'
import TransactionForm from './components/TransactionForm'
import { Balance } from './components/Balance'
import { IncomeExpenses } from './components/IncomeExpenses'
import { ExpenseChart } from './components/ExpenseChart'
import { Login } from './components/Login'
import { ComparisonChart } from './components/ComparisonChart'
import { NetFlowChart } from './components/NetFlowChart'
import AiChat from './components/AiChat'; 
import { VisualInsight } from './components/VisualInsight'; 
import './App.css' 

// --- CONFIGURACIÓN DE LA API ---
// Usa la variable de Vercel en producción o localhost en desarrollo
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function App() {
  // 1. ESTADOS DE AUTENTICACIÓN
  const [token, setToken] = useState(localStorage.getItem('auth-token') || '');
  const [username, setUsername] = useState(localStorage.getItem('auth-user') || 'Usuario');

  // ESTADOS DE VISTA
  const [chartView, setChartView] = useState('expense'); 
  const [historyFilter, setHistoryFilter] = useState('all'); 
  
  // DATOS
  const [transactions, setTransactions] = useState([])
  const [globalBalance, setGlobalBalance] = useState(0) 
  
  // INSIGHTS VISUALES DE LA IA
  const [aiVisualData, setAiVisualData] = useState(null);

  const handleVisualData = (data) => {
    console.log("Datos visuales recibidos en App:", data);
    setAiVisualData(data);
  };

  // MODALES
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);

  const [dateRange, setDateRange] = useState({
    from: new Date().toISOString().split('T')[0].substring(0, 8) + '01', 
    to: new Date().toISOString().split('T')[0] 
  })

  // --- LOGOUT ---
  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-user');
    setUsername('Usuario');
    setTransactions([]);
    setGlobalBalance(0);
    setAiVisualData(null); 
  }

  // --- LOGIN SUCCESS ---
  const handleLoginSuccess = (newToken) => {
    localStorage.setItem('auth-token', newToken);
    setToken(newToken);
    const savedName = localStorage.getItem('auth-user');
    if (savedName) setUsername(savedName);
  };

  // --- FETCHERS ---
  const fetchGlobalBalance = (endDate) => {
    if (!token) return;
    const cutOffDate = endDate || dateRange.to;
    // CAMBIO: Usar API_BASE_URL
    fetch(`${API_BASE_URL}/api/transactions/summary?date=${cutOffDate}`, { headers: { 'auth-token': token } })
      .then(res => res.json())
      .then(data => setGlobalBalance(data.balance))
      .catch(err => console.error(err));
  }

  const refreshData = () => {
    if (!token) return;
    // CAMBIO: Usar API_BASE_URL
    const url = `${API_BASE_URL}/api/transactions?from=${dateRange.from}&to=${dateRange.to}`;
    fetch(url, { headers: { 'auth-token': token } })
      .then(res => { if (res.status === 401) { handleLogout(); return []; } return res.json(); })
      .then(data => { if(Array.isArray(data)) setTransactions(data); })
      .catch(err => console.error(err)); 
    fetchGlobalBalance(dateRange.to);
  }

  useEffect(() => { if (token) refreshData(); }, [dateRange, token])

  // --- HANDLERS ---
  const confirmDelete = async () => {
    if (!transactionToDelete) return;
    try {
        // CAMBIO: Usar API_BASE_URL
        const res = await fetch(`${API_BASE_URL}/api/transactions/${transactionToDelete}`, {
            method: 'DELETE', headers: { 'auth-token': token }
        });
        if (res.ok) {
            setTransactions(transactions.filter(t => t._id !== transactionToDelete));
            fetchGlobalBalance(dateRange.to);
            setIsDeleteModalOpen(false); setTransactionToDelete(null);
        }
    } catch (error) { console.error(error); }
  }

  const handleTogglePaid = async (transaction) => {
    try {
        const updatedStatus = !transaction.isPaid;
        // CAMBIO: Usar API_BASE_URL
        const res = await fetch(`${API_BASE_URL}/api/transactions/${transaction._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'auth-token': token },
            body: JSON.stringify({ isPaid: updatedStatus }) 
        });

        if (res.ok) {
            setTransactions(transactions.map(t => 
                t._id === transaction._id ? { ...t, isPaid: updatedStatus } : t
            ));
        }
    } catch (error) { console.error("Error toggling paid:", error); }
  }

  const handleTransactionUpdate = () => { refreshData(); setIsModalOpen(false); setEditingTransaction(null); }
  const handleEditClick = (t) => { setEditingTransaction(t); setIsModalOpen(true); }
  const handleNewClick = () => { setEditingTransaction(null); setIsModalOpen(true); }
  const handleDeleteClick = (id) => { setTransactionToDelete(id); setIsDeleteModalOpen(true); }
  const handleDateChange = (e) => { setDateRange({ ...dateRange, [e.target.name]: e.target.value }) }

  // CAMBIO: Pasar la API_URL al Login si es necesario, o que Login use la misma lógica
  if (!token) return <Login onLogin={handleLoginSuccess} />;

  // --- FILTRADO ---
  const filteredTransactions = transactions
    .filter(t => historyFilter === 'all' || t.type === historyFilter)
    .sort((a,b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="bento-container">
      {/* ... (Resto del JSX igual que tu archivo original) ... */}
      <aside className="bento-box area-nav">
        <div>
          <h1 className="app-title">BlackLabs Systems</h1>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
             <p className="user-greet" style={{marginBottom:0}}>
                Bienvenido, <strong>{username}</strong> 👋
             </p>
             <button onClick={handleLogout} className="btn-logout" style={{width:'auto', padding:'6px 10px', fontSize:'0.75rem', height:'fit-content'}}>
                Salir
             </button>
          </div>
          <div className="control-group">
            <button className="btn-bento-primary" onClick={handleNewClick}><span>+</span> Nueva Transacción</button>
          </div>
          <div className="control-group">
             <label>Periodo Actual</label>
             <input type="date" name="from" value={dateRange.from} onChange={handleDateChange} />
             <input type="date" name="to" value={dateRange.to} onChange={handleDateChange} />
          </div>
          <div className="control-group">
             <label>Resumen Mensual</label>
             <IncomeExpenses transactions={transactions} />
          </div>
        </div>
      </aside>

      <section className={`bento-box area-balance ${globalBalance < 0 ? 'balance-danger' : globalBalance > 0 ? 'balance-success' : ''}`}>
         <Balance transactions={transactions} globalBalance={globalBalance} />
      </section>

      <section className="bento-box area-chart">
        <div className="box-header">
            <h3>Análisis Visual</h3>
            <div className="chart-toggle">
               <button className={chartView === 'expense' ? 'active' : ''} onClick={() => setChartView('expense')}>Gastos</button>
               <button className={chartView === 'income' ? 'active' : ''} onClick={() => setChartView('income')}>Ingresos</button>
               <button className={chartView === 'comparison' ? 'active' : ''} onClick={() => setChartView('comparison')}>Comparación</button>
               <button className={chartView === 'netflow' ? 'active' : ''} onClick={() => setChartView('netflow')}>Flujo Neto</button>
            </div>
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
           {chartView === 'expense' && <ExpenseChart transactions={transactions} type="gasto" />}
           {chartView === 'comparison' && <ComparisonChart transactions={transactions} />}
           {chartView === 'netflow' && <NetFlowChart transactions={transactions} />}
           {chartView === 'income' && <ExpenseChart transactions={transactions} type="ingreso" />}
        </div>
      </section>

      {aiVisualData && (
        <section className="bento-box area-ai-visual">
          <div className="box-header">
            <h3>AI Insight ✨</h3>
            <button onClick={() => setAiVisualData(null)} style={{background:'none', border:'none', cursor:'pointer', color:'#9ca3af'}}>✕</button>
          </div>
          <VisualInsight visualData={aiVisualData} />
        </section>
      )}

      <section className="bento-box area-history">
        <div className="box-header">
            <h3>Movimientos</h3>
            <div className="history-tabs">
               <button className={historyFilter === 'all' ? 'tab-active' : ''} onClick={() => setHistoryFilter('all')}>Todo</button>
               <button className={historyFilter === 'ingreso' ? 'tab-active' : ''} onClick={() => setHistoryFilter('ingreso')}>Ingresos</button>
               <button className={historyFilter === 'gasto' ? 'tab-active' : ''} onClick={() => setHistoryFilter('gasto')}>Gastos</button>
            </div>
        </div>
        
        <div className="transactions-feed">
           {filteredTransactions.length === 0 ? (
             <p style={{textAlign:'center', color:'#999', marginTop:'40px'}}>
                No hay {historyFilter === 'all' ? 'movimientos' : historyFilter === 'ingreso' ? 'ingresos' : 'gastos'} registrados.
             </p>
           ) : (
             filteredTransactions.map(t => (
               <div key={t._id} className={`transaction-item ${t.isPaid ? 'paid-item' : ''}`}>
                  <div style={{display:'flex', alignItems:'center'}}>
                    <div className="t-icon">{t.type === 'ingreso' ? '💰' : '💸'}</div>
                    <div className="t-details">
                       <span className="t-desc">
                           {t.description}
                           {t.isPaid && <span className="paid-badge">PAGADO</span>}
                       </span>
                       <span className="t-sub">{t.date} • {t.category}</span>
                    </div>
                  </div>
                  <div style={{textAlign:'right'}}>
                     <div className={`t-amount ${t.type === 'ingreso' ? 'plus' : 'minus'}`}>
                        {t.type === 'ingreso' ? '+' : '-'}${Math.abs(t.amount)}
                     </div>
                     <div className="mini-actions">
                        <button onClick={() => handleTogglePaid(t)} title={t.isPaid ? "Marcar pendiente" : "Marcar pagado"} style={{ color: t.isPaid ? '#3b82f6' : '#9ca3af' }}>
                            {t.isPaid ? '✅' : '☑️'}
                        </button>
                        <button onClick={() => handleEditClick(t)} title="Editar">✏️</button>
                        <button onClick={() => handleDeleteClick(t._id)} title="Borrar" style={{color:'#ef4444'}}>🗑️</button>
                     </div>
                  </div>
               </div>
             ))
           )}
        </div>
      </section>

      <AiChat token={token} onVisualDataReceived={handleVisualData} />

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="btn-close-modal" onClick={() => setIsModalOpen(false)}>✖</button>
            <TransactionForm onTransactionAdded={handleTransactionUpdate} editingTransaction={editingTransaction} token={token} />
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '400px'}}>
             <h3>⚠️ Confirmar</h3>
             <div className="modal-body"><p>¿Eliminar este movimiento?</p></div>
             <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
                <button className="btn-delete-confirm" onClick={confirmDelete}>Eliminar</button>
             </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App