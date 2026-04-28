import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const IncomeExpenses = ({ transactions }) => {
  // Diagnóstico rápido: Descomenta la siguiente línea para ver qué llega exactamente
  // console.log("Data en Sidebar:", transactions.map(t => ({ desc: t.description, type: t.type })));

  // 1. Lógica con normalización (evita que "Ingreso" o " INGRESO" rompan el filtro)
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
    <div className="flex w-full gap-4">
      {/* TARJETA DE INGRESOS */}
      <div className="flex-1 bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-4 transition-all hover:shadow-md">
        <div className="bg-emerald-500 p-3 rounded-xl text-white">
          <TrendingUp size={24} />
        </div>
        <div>
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Ingresos</p>
          <h2 className="text-xl font-black text-slate-800 leading-none">
            ${formatMoney(income)}
          </h2>
        </div>
      </div>

      {/* TARJETA DE GASTOS */}
      <div className="flex-1 bg-rose-50/50 border border-rose-100 p-4 rounded-2xl flex items-center gap-4 transition-all hover:shadow-md">
        <div className="bg-rose-500 p-3 rounded-xl text-white">
          <TrendingDown size={24} />
        </div>
        <div>
          <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Gastos</p>
          <h2 className="text-xl font-black text-slate-800 leading-none">
            ${formatMoney(expense)}
          </h2>
        </div>
      </div>
    </div>
  );
};

export default IncomeExpenses;