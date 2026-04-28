import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const IncomeExpenses = ({ transactions }) => {
  // Lógica segura para filtrar y sumar
  const income = transactions
    .filter(item => item.type?.trim().toLowerCase() === 'ingreso')
    .reduce((acc, item) => acc + Math.abs(item.amount), 0);

  const expense = transactions
    .filter(item => item.type?.trim().toLowerCase() === 'gasto')
    .reduce((acc, item) => acc + Math.abs(item.amount), 0);

  const formatMoney = (amount) => {
    return amount.toLocaleString('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="summary-container">
      {/* TARJETA DE INGRESOS */}
      <div className="summary-card card-income">
        <div className="summary-icon icon-income">
          <TrendingUp size={20} />
        </div>
        <div className="summary-data">
          <p className="summary-title">Ingresos</p>
          <h2 className="summary-amount">${formatMoney(income)}</h2>
        </div>
      </div>

      {/* TARJETA DE GASTOS */}
      <div className="summary-card card-expense">
        <div className="summary-icon icon-expense">
          <TrendingDown size={20} />
        </div>
        <div className="summary-data">
          <p className="summary-title">Gastos</p>
          <h2 className="summary-amount">${formatMoney(expense)}</h2>
        </div>
      </div>
    </div>
  );
};

export default IncomeExpenses;