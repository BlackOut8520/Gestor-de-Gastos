import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const NetFlowChart = ({ transactions }) => {
  const totalIncome = transactions
    .filter(t => t.type === 'ingreso')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'gasto')
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const data = [
    { name: 'Ingresos', value: totalIncome },
    { name: 'Gastos', value: totalExpense }
  ].filter(d => d.value > 0);

  const COLORS = ['#10b981', '#ef4444'];

  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400 italic">
        <p>No hay datos de flujo</p>
      </div>
    );
  }

  // RETORNO DIRECTO DEL RESPONSIVE CONTAINER (Tu método)
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={90}
          paddingAngle={8}
          cornerRadius={10}
          dataKey="value"
          stroke="none"
          animationBegin={0}
          animationDuration={1200}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        
        <Tooltip 
          contentStyle={{ 
            borderRadius: '12px', 
            border: 'none', 
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(4px)'
          }}
          formatter={(value) => [`$${value.toLocaleString()}`, 'Total']}
        />
        
        <Legend 
          verticalAlign="bottom" 
          height={36} 
          iconType="circle"
          formatter={(value) => <span className="text-slate-600 font-medium text-sm">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default NetFlowChart;