import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// 1. Añadimos la prop 'type' con valor por defecto 'gasto'
export const ExpenseChart = ({ transactions, type = 'gasto' }) => {
  
  // 2. Filtramos dinámicamente según el tipo recibido
  const filteredData = transactions.filter(t => t.type?.toLowerCase() === type);

  const categoryTotals = filteredData.reduce((acc, t) => {
    const category = t.category;
    const amount = Math.abs(t.amount);
    acc[category] = (acc[category] || 0) + amount;
    return acc;
  }, {});

  const data = Object.keys(categoryTotals).map(key => ({
    name: key,
    value: categoryTotals[key]
  })).filter(item => item.value > 0);

  // Paleta de colores (se mantiene igual)
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  // 3. Mensaje dinámico según el tipo
  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400 italic">
        <p>No hay {type === 'ingreso' ? 'ingresos' : 'gastos'} registrados</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%" cy="50%"
          innerRadius={65} outerRadius={90}
          paddingAngle={8} cornerRadius={10}
          dataKey="value" stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }}
          // 4. Etiqueta dinámica en el Tooltip
          formatter={(value) => [`$${value}`, type === 'ingreso' ? 'Ingreso' : 'Gasto']}
        />
        <Legend verticalAlign="bottom" iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
};