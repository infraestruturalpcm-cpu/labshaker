import React, { ReactNode, useState } from 'react';
import { LayoutDashboard, Calendar, FlaskConical, PlusCircle, LogOut, UserCircle, Menu, X } from 'lucide-react';
import { UserRole } from '../types';

interface LayoutProps {
  children: ReactNode;
  currentView: string;
  userRole: UserRole;
  onChangeView: (view: string) => void;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, userRole, onChangeView, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Define menu items based on Role
  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin'] },
    { id: 'reservations', label: 'Consultar Reservas', icon: Calendar, roles: ['admin', 'user'] },
    { id: 'new-reservation', label: 'Nova Reserva', icon: PlusCircle, roles: ['admin', 'user'] },
    { id: 'shakers', label: 'Gerenciar Shakers', icon: FlaskConical, roles: ['admin'] },
  ];

  const filteredNavItems = allNavItems.filter(item => item.roles.includes(userRole));

  const handleNavClick = (viewId: string) => {
    onChangeView(viewId);
    setIsMobileMenuOpen(false); // Close menu on mobile after click
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-indigo-900 text-white p-4 flex justify-between items-center sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-2 font-bold text-lg">
          <FlaskConical className="h-6 w-6" />
          LabShaker
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-1">
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar (Desktop: Visible, Mobile: Conditional) */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-indigo-900 text-white transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-indigo-800 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <FlaskConical className="h-6 w-6" />
              LabShaker
            </h1>
            <p className="text-xs text-indigo-300 mt-1">Gestão de Equipamentos</p>
          </div>
          {/* Close button for mobile inside drawer */}
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-indigo-300">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="p-4 flex-1">
          <ul className="space-y-2">
            {filteredNavItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-4 md:py-3 rounded-lg transition-colors text-base md:text-sm touch-manipulation ${
                    currentView === item.id
                      ? 'bg-indigo-700 text-white font-medium'
                      : 'text-indigo-100 hover:bg-indigo-800'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-indigo-800 bg-indigo-900">
          <div className="flex items-center gap-3 mb-4 px-2">
            <UserCircle className="h-8 w-8 text-indigo-300" />
            <div>
              <p className="text-sm font-medium text-white capitalize">{userRole === 'admin' ? 'Administrador' : 'Pesquisador'}</p>
              <p className="text-xs text-indigo-300">{userRole === 'admin' ? 'Acesso Total' : 'Acesso Padrão'}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-4 py-3 md:py-2 text-sm text-indigo-200 hover:text-white hover:bg-indigo-800 rounded transition-colors touch-manipulation"
          >
            <LogOut className="h-4 w-4" />
            Sair do sistema
          </button>
        </div>
      </aside>

      {/* Overlay for mobile when menu is open */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto h-[calc(100vh-64px)] md:h-screen flex flex-col w-full">
        <header className="bg-white shadow-sm p-4 md:p-6 hidden md:block">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            {filteredNavItems.find((n) => n.id === currentView)?.label || 'LabShaker'}
          </h2>
        </header>
        <div className="p-4 md:px-6 md:py-6 pb-12 w-full max-w-7xl mx-auto flex-1">
          {children}
        </div>
      </main>
    </div>
  );
};