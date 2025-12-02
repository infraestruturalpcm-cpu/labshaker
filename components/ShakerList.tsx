import React, { useState, useEffect } from 'react';
import { Shaker } from '../types';
import { getShakers, saveShaker, deleteShaker } from '../services/storageService';
import { Plus, Edit2, Trash2, X, Check, Ban } from 'lucide-react';

export const ShakerList: React.FC = () => {
  const [shakers, setShakers] = useState<Shaker[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShaker, setEditingShaker] = useState<Shaker | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Shaker>>({});

  useEffect(() => {
    loadShakers();
  }, []);

  const loadShakers = () => {
    setShakers(getShakers());
  };

  const handleOpenModal = (shaker?: Shaker) => {
    setError(null);
    if (shaker) {
      setEditingShaker(shaker);
      setFormData(shaker);
    } else {
      setEditingShaker(null);
      setFormData({
        capacity_flasks: 0,
        active: true, // Default to active
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingShaker(null);
    setFormData({});
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este shaker?')) {
      const success = deleteShaker(id);
      if (success) {
        loadShakers();
      } else {
        alert('Não é possível excluir um shaker com reservas agendadas.');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.capacity_flasks) {
      setError('Nome e capacidade são obrigatórios.');
      return;
    }

    const newShaker: Shaker = {
      id: editingShaker ? editingShaker.id : crypto.randomUUID(),
      name: formData.name || '',
      brand: formData.brand || '',
      model: formData.model || '',
      capacity_flasks: Number(formData.capacity_flasks),
      active: formData.active !== undefined ? formData.active : true,
      notes: formData.notes || '',
    };

    saveShaker(newShaker);
    loadShakers();
    handleCloseModal();
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Adicionar Novo Shaker
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca/Modelo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacidade (Frascos)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observações</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {shakers.map((shaker) => (
              <tr key={shaker.id} className={!shaker.active ? 'bg-gray-50 opacity-75' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {shaker.active ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Check className="h-3 w-3" /> Ativo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <Ban className="h-3 w-3" /> Inativo
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{shaker.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shaker.brand} {shaker.model}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shaker.capacity_flasks}</td>
                <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">{shaker.notes}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleOpenModal(shaker)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(shaker.id)} className="text-red-600 hover:text-red-900">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {shakers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                  Nenhum shaker cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                {editingShaker ? 'Editar Shaker' : 'Novo Shaker'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome *</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-indigo-500 focus:ring-indigo-500"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Marca</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-indigo-500 focus:ring-indigo-500"
                    value={formData.brand || ''}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Modelo</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-indigo-500 focus:ring-indigo-500"
                    value={formData.model || ''}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Capacidade (Frascos) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-indigo-500 focus:ring-indigo-500"
                  value={formData.capacity_flasks || ''}
                  onChange={(e) => setFormData({ ...formData, capacity_flasks: parseInt(e.target.value) })}
                />
              </div>
              
              <div className="flex items-center">
                <input
                  id="active"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={formData.active !== undefined ? formData.active : true}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                />
                <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                  Equipamento Ativo / Disponível
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Observações</label>
                <textarea
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-indigo-500 focus:ring-indigo-500"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};