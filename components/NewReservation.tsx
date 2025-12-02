import React, { useState, useEffect } from 'react';
import { Shaker, MicroorganismType, FlaskVolume, ProjectType, ReservationStatus, Reservation } from '../types';
import { getShakers, saveReservation, checkAvailability } from '../services/storageService';
import { Save, AlertTriangle, CheckCircle, Calendar, FlaskConical } from 'lucide-react';

export const NewReservation: React.FC = () => {
  const [shakers, setShakers] = useState<Shaker[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdReservation, setCreatedReservation] = useState<Reservation | null>(null);

  // Initial Form State
  const initialFormState = {
    shaker_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    quantity_flasks: 1,
    microorganism_type: MicroorganismType.BACTERIA,
    flask_volume: FlaskVolume.V250,
    temperature_c: 37,
    rpm: 150,
    project: ProjectType.INTERNAL,
    user_name: '',
    user_email: '',
    notes: '',
    agreement: false
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    setShakers(getShakers());
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.shaker_id) {
      setErrorMsg('Selecione um shaker.');
      return;
    }

    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      setErrorMsg('Data final deve ser igual ou posterior à data inicial.');
      return;
    }

    // Validation
    const availability = checkAvailability(
      formData.shaker_id,
      formData.start_date,
      formData.end_date,
      Number(formData.quantity_flasks)
    );

    if (!availability.available) {
      setErrorMsg(availability.message || 'Erro de disponibilidade.');
      return;
    }

    const newReservation: Reservation = {
      id: crypto.randomUUID(),
      shaker_id: formData.shaker_id,
      start_date: formData.start_date,
      end_date: formData.end_date,
      quantity_flasks: Number(formData.quantity_flasks),
      microorganism_type: formData.microorganism_type as MicroorganismType,
      flask_volume: formData.flask_volume as FlaskVolume,
      temperature_c: Number(formData.temperature_c),
      rpm: Number(formData.rpm),
      project: formData.project as ProjectType,
      user_name: formData.user_name,
      user_email: formData.user_email,
      notes: formData.notes,
      status: ReservationStatus.SCHEDULED
    };

    saveReservation(newReservation);
    
    // Trigger Success Modal
    setCreatedReservation(newReservation);
    setShowSuccessModal(true);
    
    setFormData(initialFormState);
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setCreatedReservation(null);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-4 md:p-6 relative">
      <h3 className="text-lg font-medium text-gray-900 border-b pb-4 mb-6">Nova Reserva</h3>
      
      {errorMsg && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 flex items-start gap-3">
          <AlertTriangle className="text-red-500 h-5 w-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dates and Shaker */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="md:col-span-3 lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Shaker *</label>
            <select
              name="shaker_id"
              required
              value={formData.shaker_id}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm border p-3 focus:border-indigo-500 focus:ring-indigo-500 text-base"
            >
              <option value="">Selecione...</option>
              {shakers.map(s => (
                <option key={s.id} value={s.id} className={!s.active ? 'text-gray-400 bg-gray-100' : ''}>
                  {s.name} {!s.active ? '(Inativo)' : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Início *</label>
            <input
              type="date"
              name="start_date"
              required
              value={formData.start_date}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm border p-3 focus:border-indigo-500 focus:ring-indigo-500 text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim *</label>
            <input
              type="date"
              name="end_date"
              required
              value={formData.end_date}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm border p-3 focus:border-indigo-500 focus:ring-indigo-500 text-base"
            />
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-gray-50 p-4 rounded-md grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Qtd. Frascos *</label>
            <input
              type="number"
              min="1"
              name="quantity_flasks"
              required
              value={formData.quantity_flasks}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Volume Frasco *</label>
            <select
              name="flask_volume"
              value={formData.flask_volume}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-indigo-500 focus:ring-indigo-500"
            >
              {Object.values(FlaskVolume).map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Microorganismo *</label>
            <select
              name="microorganism_type"
              value={formData.microorganism_type}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-indigo-500 focus:ring-indigo-500"
            >
              {Object.values(MicroorganismType).map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Temperatura (°C) *</label>
            <input
              type="number"
              name="temperature_c"
              required
              value={formData.temperature_c}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">RPM *</label>
            <input
              type="number"
              name="rpm"
              required
              value={formData.rpm}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Projeto *</label>
             <select
              name="project"
              value={formData.project}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-indigo-500 focus:ring-indigo-500"
            >
              {Object.values(ProjectType).map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        </div>

        {/* User Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Usuário *</label>
            <input
              type="text"
              name="user_name"
              required
              value={formData.user_name}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm border p-3 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
            <input
              type="email"
              name="user_email"
              required
              value={formData.user_email}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm border p-3 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
          <textarea
            name="notes"
            rows={2}
            value={formData.notes}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm border p-3 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-start bg-blue-50 p-3 rounded-lg border border-blue-100">
          <div className="flex items-center h-5">
            <input
              id="agreement"
              name="agreement"
              type="checkbox"
              required
              checked={formData.agreement}
              onChange={handleChange}
              className="focus:ring-indigo-500 h-5 w-5 text-indigo-600 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="agreement" className="font-medium text-gray-700">
              Declaro que seguirei as normas de uso, limpeza e devolução dos equipamentos. *
            </label>
          </div>
        </div>

        <div className="pt-4 border-t">
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-4 px-6 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors text-lg"
          >
            <Save className="h-6 w-6" />
            Confirmar Reserva
          </button>
        </div>
      </form>

      {/* SUCCESS MODAL POPUP */}
      {showSuccessModal && createdReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
            {/* Header */}
            <div className="bg-green-600 p-6 flex flex-col items-center text-white">
              <CheckCircle className="h-16 w-16 mb-2" />
              <h3 className="text-2xl font-bold">Reserva Confirmada!</h3>
              <p className="text-green-100 text-center">O equipamento foi agendado.</p>
            </div>
            
            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <FlaskConical className="h-6 w-6 text-indigo-600 mr-3" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Equipamento</p>
                  <p className="font-medium text-gray-900">
                    {shakers.find(s => s.id === createdReservation.shaker_id)?.name || 'Shaker'}
                  </p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Calendar className="h-6 w-6 text-indigo-600 mr-3" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Período</p>
                  <p className="font-medium text-gray-900">
                    {new Date(createdReservation.start_date).toLocaleDateString('pt-BR')} até {new Date(createdReservation.end_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mr-3 text-xs">
                  ID
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Responsável</p>
                  <p className="font-medium text-gray-900">{createdReservation.user_name}</p>
                  <p className="text-xs text-gray-500">{createdReservation.project}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t flex justify-center">
              <button
                onClick={closeSuccessModal}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition-colors text-lg"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};