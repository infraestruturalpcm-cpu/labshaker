import React, { useState, useEffect } from 'react';
import { Reservation, Shaker, ProjectType, ReservationStatus } from '../types';
import { getReservations, getShakers, cancelReservation } from '../services/storageService';
import { List, Calendar as CalendarIcon, Filter, XCircle, Info } from 'lucide-react';

// Fixed palette for Shakers
const SHAKER_COLORS = [
  'bg-red-50 text-red-700 border-red-200',
  'bg-orange-50 text-orange-700 border-orange-200',
  'bg-amber-50 text-amber-700 border-amber-200',
  'bg-lime-50 text-lime-700 border-lime-200',
  'bg-emerald-50 text-emerald-700 border-emerald-200',
  'bg-teal-50 text-teal-700 border-teal-200',
  'bg-cyan-50 text-cyan-700 border-cyan-200',
  'bg-sky-50 text-sky-700 border-sky-200',
  'bg-indigo-50 text-indigo-700 border-indigo-200',
  'bg-violet-50 text-violet-700 border-violet-200',
  'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
  'bg-pink-50 text-pink-700 border-pink-200',
  'bg-rose-50 text-rose-700 border-rose-200',
];

export const ReservationList: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [shakers, setShakers] = useState<Shaker[]>([]);
  
  // Filters
  const [filterShaker, setFilterShaker] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setReservations(getReservations());
    setShakers(getShakers());
  };

  const handleCancel = (res: Reservation) => {
    if (window.confirm('Deseja cancelar esta reserva?')) {
      cancelReservation(res.id);
      alert('Reserva cancelada com sucesso.');
      loadData();
    }
  };

  const getShakerName = (id: string) => {
    return shakers.find(s => s.id === id)?.name || 'Desconhecido';
  };

  const getShakerColorClass = (id: string) => {
    const index = shakers.findIndex(s => s.id === id);
    if (index === -1) return 'bg-gray-50 text-gray-700 border-gray-200';
    return SHAKER_COLORS[index % SHAKER_COLORS.length];
  };

  const getStatusBorderColor = (status: ReservationStatus) => {
    switch (status) {
      case ReservationStatus.SCHEDULED: return 'border-l-blue-500';
      case ReservationStatus.COMPLETED: return 'border-l-green-500';
      case ReservationStatus.CANCELLED: return 'border-l-red-500';
      default: return 'border-l-gray-300';
    }
  };

  const filteredReservations = reservations.filter(r => {
    let matches = true;
    if (filterShaker && r.shaker_id !== filterShaker) matches = false;
    if (filterProject && r.project !== filterProject) matches = false;
    if (filterStart && r.end_date < filterStart) matches = false;
    if (filterEnd && r.start_date > filterEnd) matches = false;
    return matches;
  }).sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());

  // Helper for Calendar View
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay, year, month };
  };

  const renderCalendar = () => {
    const { days, firstDay, year, month } = getDaysInMonth(currentMonth);
    const blanks = Array(firstDay).fill(null);
    const dayNumbers = Array.from({ length: days }, (_, i) => i + 1);
    
    const monthName = currentMonth.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

    return (
      <div className="bg-white rounded-lg shadow p-2 md:p-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
          <div className="flex gap-2 w-full md:w-auto justify-between">
             <button onClick={() => setCurrentMonth(new Date(year, month - 1))} className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm">Anterior</button>
             <button onClick={() => setCurrentMonth(new Date(year, month + 1))} className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm md:hidden">Próximo</button>
          </div>
          
          <div className="flex flex-col items-center">
             <h3 className="text-lg font-bold capitalize">{monthName}</h3>
             <div className="flex gap-3 text-xs mt-1">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div>Agendado</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div>Concluído</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div>Cancelado</span>
             </div>
          </div>
          <button onClick={() => setCurrentMonth(new Date(year, month + 1))} className="hidden md:block px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm">Próximo</button>
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
            <div key={d} className="text-center font-bold text-gray-500 text-xs md:text-sm py-2">{d}</div>
          ))}
          
          {blanks.map((_, i) => <div key={`blank-${i}`} className="h-16 md:h-32 bg-gray-50 border border-gray-100"></div>)}
          
          {dayNumbers.map(day => {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const daysReservations = filteredReservations.filter(r => 
               dateStr >= r.start_date && dateStr <= r.end_date
            );

            return (
              <div key={day} className="h-20 md:h-32 border border-gray-200 p-1 overflow-y-auto bg-white hover:bg-gray-50 scrollbar-thin">
                <div className="text-xs font-bold text-gray-400 mb-1">{day}</div>
                {daysReservations.map(r => {
                  const colorClass = getShakerColorClass(r.shaker_id);
                  const borderStatus = getStatusBorderColor(r.status);
                  const isCancelled = r.status === ReservationStatus.CANCELLED;

                  return (
                    <div 
                      key={r.id} 
                      className={`text-[9px] md:text-[10px] rounded px-1 py-1 mb-1 border-l-[3px] shadow-sm ${colorClass} ${borderStatus} ${isCancelled ? 'opacity-50 grayscale' : ''}`} 
                      title={`${getShakerName(r.shaker_id)} - ${r.user_name} (${r.status})`}
                    >
                      <div className="font-bold truncate hidden md:block">{getShakerName(r.shaker_id)}</div>
                      <div className="truncate">{r.user_name}</div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 md:py-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            <List size={18} /> Lista
          </button>
          <button
             onClick={() => setViewMode('calendar')}
             className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 md:py-2 rounded-md transition-colors ${viewMode === 'calendar' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            <CalendarIcon size={18} /> Calendário
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Shaker</label>
          <select 
            value={filterShaker} 
            onChange={e => setFilterShaker(e.target.value)}
            className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 h-10"
          >
            <option value="">Todos</option>
            {shakers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Projeto</label>
          <select 
             value={filterProject} 
             onChange={e => setFilterProject(e.target.value)}
             className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 h-10"
          >
            <option value="">Todos</option>
            {Object.values(ProjectType).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">De</label>
          <input 
            type="date" 
            value={filterStart}
            onChange={e => setFilterStart(e.target.value)}
            className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 h-10"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Até</label>
           <input 
            type="date" 
            value={filterEnd}
            onChange={e => setFilterEnd(e.target.value)}
            className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 h-10"
          />
        </div>
      </div>

      {/* View Content */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shaker</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Período</th>
                  <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuário</th>
                  <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Projeto</th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detalhes</th>
                  <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReservations.map(r => (
                  <tr key={r.id} className={r.status === ReservationStatus.CANCELLED ? 'bg-gray-50 opacity-60' : ''}>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${r.status === ReservationStatus.SCHEDULED ? 'bg-blue-100 text-blue-800' : 
                          r.status === ReservationStatus.CANCELLED ? 'bg-red-100 text-red-800' : 
                          'bg-green-100 text-green-800'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-900">
                        {getShakerName(r.shaker_id)}
                        {/* Mobile Only Details */}
                        <div className="md:hidden text-xs text-gray-500 mt-1">
                           {r.user_name} • {r.project}
                        </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span>{new Date(r.start_date).toLocaleDateString('pt-BR')}</span>
                        <span className="text-xs">até {new Date(r.end_date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 text-sm text-gray-900">
                      <div className="font-medium">{r.user_name}</div>
                      <div className="text-gray-500 text-xs">{r.user_email}</div>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 text-sm text-gray-500">{r.project}</td>
                    <td className="hidden sm:table-cell px-6 py-4 text-sm text-gray-500">
                      {r.quantity_flasks}x {r.flask_volume}
                      <div className="text-xs italic mt-1">{r.microorganism_type}</div>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-right text-sm font-medium">
                      {r.status === ReservationStatus.SCHEDULED && (
                        <button 
                          onClick={() => handleCancel(r)}
                          className="text-red-600 hover:text-red-900 flex items-center justify-end gap-1 w-full"
                          title="Cancelar"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      )}
                      {r.status === ReservationStatus.CANCELLED && r.cancelled_at && (
                        <span className="text-xs text-gray-400 block" title={`Cancelado em ${new Date(r.cancelled_at).toLocaleString()}`}>
                          Cancelado
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredReservations.length === 0 && (
                   <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Nenhuma reserva encontrada para os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        renderCalendar()
      )}
    </div>
  );
};