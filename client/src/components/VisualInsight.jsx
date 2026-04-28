import React from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  ResponsiveContainer, Legend 
} from 'recharts';

export const VisualInsight = ({ visualData }) => {
  
  // 1. Verificación de seguridad de datos
  if (!visualData || visualData.renderizar === false || !visualData.datos || visualData.datos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-400 text-sm text-center p-8 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
        <div className="bg-slate-200 p-3 rounded-full mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
        </div>
        <p className="font-medium">Esperando análisis...</p>
        <p className="text-xs opacity-70">Haz una pregunta en el chat para visualizar tus finanzas.</p>
      </div>
    );
  }

  // 2. Paleta de colores unificada BlackLabs (Azules y Esmeraldas)
  const COLORS = ['#2563eb', '#10b981', '#6366f1', '#f59e0b', '#3b82f6', '#06b6d4'];

  const renderChart = () => {
    if (visualData.tipo === 'pie') {
      return (
        <PieChart>
          <Pie
            data={visualData.datos}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
            animationBegin={0}
            animationDuration={800}
          >
            {visualData.datos.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                cornerRadius={6}
              />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
                borderRadius: '16px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(4px)'
            }}
          />
          <Legend iconType="circle" />
        </PieChart>
      );
    } else {
      return (
        <BarChart 
            data={visualData.datos} 
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} 
          />
          <Tooltip 
            cursor={{ fill: '#f8fafc', radius: 12 }} 
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} 
          />
          <Bar 
            dataKey="value" 
            radius={[10, 10, 0, 0]} 
            barSize={35}
            animationDuration={1000}
          >
            {visualData.datos.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      );
    }
  };

  return (
    <div className="flex flex-col h-full w-full p-4 bg-white rounded-3xl border border-slate-100 shadow-sm transition-all animate-in fade-in duration-500">
      {/* HEADER DE LA GRÁFICA IA */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
        <div>
            <h4 className="text-lg font-extrabold text-slate-800 tracking-tight leading-none">
                {visualData.titulo || 'Análisis de la IA'}
            </h4>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">BlackLabs Intelligence</span>
        </div>
      </div>

      {/* CONTENEDOR DE LA GRÁFICA CON ALTURA FIJA PARA EVITAR EL CORTE */}
      <div className="flex-1 w-full min-h-[280px] relative">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default VisualInsight;