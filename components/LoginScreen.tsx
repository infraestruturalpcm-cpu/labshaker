import React from 'react';
import { FlaskConical, Shield, User } from 'lucide-react';
import { UserRole } from '../types';

interface LoginScreenProps {
  onLogin: (role: UserRole) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-indigo-900 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-indigo-800 rounded-full">
              <FlaskConical className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">LabShaker Manager</h1>
          <p className="text-indigo-200 mt-2">Sistema de Controle de Shakers</p>
        </div>
        
        <div className="p-8">
          <p className="text-center text-gray-600 mb-6">Selecione o perfil de acesso:</p>
          
          <div className="space-y-4">
            <button
              onClick={() => onLogin('admin')}
              className="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
            >
              <div className="p-3 bg-indigo-100 rounded-full group-hover:bg-indigo-200 text-indigo-700">
                <Shield className="h-6 w-6" />
              </div>
              <div className="ml-4 text-left">
                <p className="font-semibold text-gray-900">Administrador</p>
                <p className="text-sm text-gray-500">Gestão total do sistema e dashboards</p>
              </div>
            </button>

            <button
              onClick={() => onLogin('user')}
              className="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
            >
              <div className="p-3 bg-green-100 rounded-full group-hover:bg-green-200 text-green-700">
                <User className="h-6 w-6" />
              </div>
              <div className="ml-4 text-left">
                <p className="font-semibold text-gray-900">Pesquisador / Usuário</p>
                <p className="text-sm text-gray-500">Realizar reservas e consultar agenda</p>
              </div>
            </button>
          </div>
        </div>
        
        <div className="bg-gray-50 px-8 py-4 text-center text-xs text-gray-400">
          Versão 1.2.0 • Acesso Restrito
        </div>
      </div>
    </div>
  );
};