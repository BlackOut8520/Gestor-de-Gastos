import React from 'react';

export const Balance = ({ transactions, globalBalance }) => {

  // Obtenemos la fecha de hoy "YYYY-MM-DD" en local para comparar correctamente
  const now = new Date();
  // Ajuste para zona horaria local (simple)
  const offset = now.getTimezoneOffset() * 60000;
  const todayString = new Date(now.getTime() - offset).toISOString().split('T')[0];

  // 1. Identificar movimientos futuros (que ya están en la lista pero aun no pasan)
  const futureTransactions = transactions.filter(t => t.date > todayString);

  // 2. Calcular cuánto suman esos futuros
  // CORRECCIÓN IMPORTANTE: Sumamos directo (acc + amount) porque el amount ya trae su signo (-).
  const pendingAmount = futureTransactions.reduce((acc, item) => acc + item.amount, 0);

  // 3. Calcular Saldo "Real Hoy" y "Proyección"
  // Si el filtro incluye futuro, 'globalBalance' ya tiene todo.
  // Para saber cuánto tengo HOY, le RESTAMOS lo que aun no pasa.
  const balanceToday = globalBalance - pendingAmount;
  
  // La proyección al cierre del filtro es simplemente el total que nos dio el servidor
  const projectedBalance = globalBalance;

  const formatMoney = (amount) => {
    return Number(amount).toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN'
    });
  };

  return (
    <div className="card-content" style={{width: '100%'}}>
        <h3>Saldo al día ({new Date().toLocaleDateString('es-MX', {day: 'numeric', month: 'short'})})</h3>
        
        {/* Mostramos el Saldo Real de Hoy */}
        <h1 className={`main-balance ${balanceToday < 0 ? 'negative' : ''}`}>
            {formatMoney(balanceToday)}
        </h1>

        {/* Solo mostramos la proyección si hay diferencia (hay movimientos futuros en el filtro) */}
        {futureTransactions.length > 0 && (
          <div className="projection-pill" style={{marginTop: '10px', display:'inline-block'}}>
             <span>🏁 Cierre del periodo: </span>
             <strong style={{color: projectedBalance < 0 ? '#fca5a5' : '#86efac'}}>
               {formatMoney(projectedBalance)}
             </strong>
          </div>
        )}
    </div>
  );
};

export default Balance;