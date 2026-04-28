import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const ComparisonChart = ({ transactions }) => {
  const processData = () => {
    const dataMap = {};

    transactions.forEach(t => {
      const dateObj = new Date(t.date);
      const userTimezoneOffset = dateObj.getTimezoneOffset() * 60000;
      const adjustedDate = new Date(dateObj.getTime() + userTimezoneOffset);
      const monthKey = adjustedDate.toLocaleString('default', { month: 'short' }); 

      if (!dataMap[monthKey]) {
        dataMap[monthKey] = { name: monthKey, Ingresos: 0, Gastos: 0 };
      }

      if (t.type === 'ingreso') {
        dataMap[monthKey].Ingresos += Math.abs(t.amount);
      } else {
        dataMap[monthKey].Gastos += Math.abs(t.amount);
      }
    });

    return Object.values(dataMap);
  };

  const data = processData();

  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400 italic">
        <p>No hay datos para comparar</p>
      </div>
    );
  }

  // RETORNO DIRECTO DEL RESPONSIVE CONTAINER (Tu método)
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{fill: '#6b7280', fontSize: 12}} 
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{fill: '#6b7280', fontSize: 12}} 
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip 
          cursor={{fill: 'transparent'}}
          contentStyle={{ 
            borderRadius: '12px', 
            border: 'none', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(4px)'
          }}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36} 
          iconType="circle"
        />
        <Bar dataKey="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
        <Bar dataKey="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ComparisonChart;