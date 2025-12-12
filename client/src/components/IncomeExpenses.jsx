import React from 'react';

export const IncomeExpenses = ({ transactions }) => {

  // 1. Filtramos solo los montos que son INGRESOS y los sumamos
  const income = transactions
    .filter(item => item.type === 'ingreso') // Buscamos la etiqueta correcta
    .reduce((acc, item) => acc + item.amount, 0)
    .toFixed(2);

  // 2. Filtramos solo los montos que son GASTOS y los sumamos
  const expense = transactions
    .filter(item => item.type === 'gasto')
    .reduce((acc, item) => acc + item.amount, 0)
    .toFixed(2);

  return (
    <div className="inc-exp-container">
      <div>
        <h4>Ingresos</h4>
        <p className="money plus">+${income}</p>
      </div>
      <div>
        <h4>Gastos</h4>
        <p className="money minus">-${expense}</p>
      </div>
    </div>
  );
};

export default IncomeExpenses;