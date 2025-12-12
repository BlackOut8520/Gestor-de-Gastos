import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const ExpenseChart = ({ transactions }) => {

  // 1. Filtramos solo los GASTOS
  const expenses = transactions.filter(transaction => transaction.type === 'gasto');

  // 2. Agrupar montos por categoría (Lógica robusta)
  const categoryTotals = expenses.reduce((acc, transaction) => {
    const category = transaction.category;
    const amount = Math.abs(transaction.amount); // Aseguramos positivo

    if (acc[category]) {
      acc[category] += amount;
    } else {
      acc[category] = amount;
    }
    return acc;
  }, {});

  // 3. Convertir a formato que le gusta a Recharts (Array de objetos)
  const data = Object.keys(categoryTotals).map(key => ({
    name: key,
    value: categoryTotals[key]
  })).filter(item => item.value > 0); // Solo mostramos si hay dinero gastado

  // 4. Paleta de colores base (Puedes agregar más si quieres)
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff6b6b'];

  // Función para obtener color (si se acaban, recicla)
  const getColor = (index) => {
    return COLORS[index % COLORS.length];
  };

  // Si no hay datos, mostramos mensaje
  if (data.length === 0) {
    return (
      <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af'}}>
        <p>No hay gastos registrados</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ percent }) => `${(percent * 100).toFixed(0)}%`} // Muestra % dentro
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColor(index)} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `$${value}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ExpenseChart;