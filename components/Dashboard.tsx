import React, { useState, useEffect } from 'react';
import { getReservations, getShakers } from '../services/storageService';
import { Reservation, Shaker, ReservationStatus, ProjectType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { Filter } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [shakers, setShakers] = useState<Shaker[]>([]);
  
  // State for Filters
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedShakerId, setSelectedShakerId] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');

  useEffect(() => {
    setReservations(getReservations());
    setShakers(getShakers());
  }, []);

  // Filter Data based on Month/Year, Shaker, and Project
  const activeData = reservations.filter(r => {
    if (r.status === ReservationStatus.CANCELLED) return false;
    
    // Period Filter
    const start = new Date(r.start_date);
    const end = new Date(r.end_date);
    const monthStart = new Date(selectedYear, selectedMonth, 1);
    const monthEnd = new Date(selectedYear, selectedMonth + 1, 0);

    const isInPeriod = start <= monthEnd && end >= monthStart;
    if (!isInPeriod) return false;

    // Shaker Filter
    if (selectedShakerId && r.shaker_id !== selectedShakerId) return false;

    // Project Filter
    if (selectedProject && r.project !== selectedProject) return false;

    return true;
  });

  // Calculate Daily Data for Line Chart
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const dailyData = [];

  for (let i = 1; i <= daysInMonth; i++) {
    const currentDayDate = new Date(selectedYear, selectedMonth, i).toISOString().split('T')[0];
    
    // Count active reservations for this specific day matching filters
    const count = activeData.filter(r => 
      r.start_date <= currentDayDate && r.end_date >= currentDayDate
    ).length;

    dailyData.push({
      day: i,
      reservations: count
    });
  }

  // Stats: Total Reservations per Shaker (in this period)
  const shakerStatsMap = shakers.map(s => {
    const count = activeData.filter(r => r.shaker_id === s.id).length;
    return { name: s.name, count };
  }).filter(item => item.count > 0).sort((a, b) => b.count - a.count);

  // Stats: Top 3 Shakers
  const top3Shakers = shakerStatsMap.slice(0, 3);

  // Stats: Project Distribution (in this period)
  const projectStatsMap = activeData.reduce((acc, curr) => {
    acc[curr.project] = (acc[curr.project] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const projectStats = Object.keys(projectStatsMap).map(key => ({
    name: key,
    value: projectStatsMap[key]
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

  // Month names for select
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <div className="space-y-6">
      {/* Filters Header */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-gray-700 border-b pb-2">
           <Filter size={18} />
           <h2 className="text-lg font-semibold">Filtros de Visualização</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Mês</label>
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Ano</label>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {Array.from({length: 5}, (_, i) => today.getFullYear() - 2 + i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Shaker</label>
            <select
              value={selectedShakerId}
              onChange={(e) => setSelectedShakerId(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Todos os Shakers</option>
              {shakers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Projeto</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Todos os Projetos</option>
              {Object.values(ProjectType).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* KPI Cards */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-indigo-500 flex flex-col justify-between">
          <div>
            <h4 className="text-gray-500 text-sm font-medium uppercase">Total de Reservas</h4>
            <p className="text-3xl font-bold text-gray-900 mt-2">{activeData.length}</p>
          </div>
          <span className="text-xs text-gray-400 mt-2 block">No período filtrado</span>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500 flex flex-col justify-between">
          <div>
            <h4 className="text-gray-500 text-sm font-medium uppercase">Shaker Mais Utilizado</h4>
            <p className="text-lg font-bold text-gray-900 mt-2 truncate">
              {top3Shakers.length > 0 ? top3Shakers[0].name : 'N/A'}
            </p>
          </div>
           <span className="text-xs text-gray-400 mt-2 block">
             {top3Shakers.length > 0 ? `${top3Shakers[0].count} reservas` : 'Sem dados'}
           </span>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-500 flex flex-col justify-between">
          <div>
            <h4 className="text-gray-500 text-sm font-medium uppercase">Total de Frascos</h4>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {activeData.reduce((acc, curr) => acc + curr.quantity_flasks, 0)}
            </p>
          </div>
          <span className="text-xs text-gray-400 mt-2 block">Processados no período</span>
        </div>
      </div>

      {/* Main Line Chart */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Ocupação Diária (Reservas Ativas)</h3>
        <div className="h-64 md:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{fontSize: 12}} />
              <YAxis allowDecimals={false} tick={{fontSize: 12}} />
              <Tooltip labelFormatter={(label) => `Dia ${label}`} />
              <Line type="monotone" dataKey="reservations" name="Reservas" stroke="#4f46e5" strokeWidth={3} dot={{r: 3}} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart: Reservations by Shaker */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ranking de Uso (Shaker)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {shakerStatsMap.length > 0 ? (
                <BarChart data={shakerStatsMap} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" allowDecimals={false} hide />
                  <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 10}} interval={0} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4f46e5" radius={[0, 4, 4, 0]} name="Reservas" barSize={20} />
                </BarChart>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">Sem dados para exibir</div>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart: Projects */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Distribuição por Projeto</h3>
           <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {projectStats.length > 0 ? (
                <PieChart>
                  <Pie
                    data={projectStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {projectStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{fontSize: '12px'}} />
                </PieChart>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">Sem dados para exibir</div>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};