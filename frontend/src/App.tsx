import React, { useState, useEffect } from 'react';
import { LoginPage } from './pages/LoginPage';
import { silentRefresh, getMe, logout } from './services/authService';
import type { User } from './services/authService';
import { Plane, LogOut, MessageSquare, User as UserIcon } from 'lucide-react';
// Đảm bảo bạn đã import component Chat
import { TicketParserChat } from './features/tickets/TicketParseChat'; 

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // 👇 SỬA Ở ĐÂY: Đổi 'profile' thành 'chat'
  const [activeTab, setActiveTab] = useState<'profile' | 'chat'>('chat'); 

  useEffect(() => {
    (async () => {
      try {
        await silentRefresh();
        const userData = await getMe();
        setUser(userData);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogin = async () => {
    try {
      const userData = await getMe();
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Plane size={48} className="text-slate-400 animate-pulse mx-auto mb-4" />
          <p className="text-slate-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {user ? (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-emerald-50/30 flex flex-col">
          {/* Header */}
          <header className="bg-gradient-to-r from-slate-900 to-slate-800 sticky top-0 z-50 shadow-xl shadow-slate-900/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Plane size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white leading-tight">Flight Automation</h1>
                  <p className="text-[10px] text-emerald-400 font-semibold tracking-wider">SMART PROCESSING</p>
                </div>
              </div>

              {/* Navigation Tabs (Centered) */}
              <div className="hidden md:flex bg-slate-800/50 p-1 rounded-xl border border-slate-700/50">
                 <button 
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        activeTab === 'profile' 
                        ? 'bg-white text-slate-900 shadow-lg' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                 >
                    <UserIcon size={16} /> Ho so
                 </button>
                 <button 
                    onClick={() => setActiveTab('chat')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        activeTab === 'chat' 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                 >
                    <MessageSquare size={16} /> Xu ly ve
                 </button>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-white">{user.username}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl border border-slate-700 hover:bg-red-500/10 hover:border-red-500/50 text-slate-400 hover:text-red-400 transition-all"
                  title="Dang xuat"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </header>

          {/* Mobile Bottom Navigation */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 shadow-lg">
            <div className="flex items-center justify-around py-2">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${
                  activeTab === 'profile' 
                    ? 'text-emerald-600' 
                    : 'text-slate-400'
                }`}
              >
                <UserIcon size={22} />
                <span className="text-xs font-semibold">Ho so</span>
              </button>
              <button 
                onClick={() => setActiveTab('chat')}
                className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${
                  activeTab === 'chat' 
                    ? 'text-emerald-600' 
                    : 'text-slate-400'
                }`}
              >
                <MessageSquare size={22} />
                <span className="text-xs font-semibold">Xu ly ve</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 pb-24 md:pb-6">
            {activeTab === 'profile' ? (
                // --- Profile View ---
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-lg shadow-slate-200/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <UserIcon size={32} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Xin chao, {user.username}!</h2>
                      <p className="text-slate-500">Chao mung ban quay tro lai</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-6 border border-slate-200">
                     <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                        <div>
                            <dt className="text-sm font-medium text-slate-500 mb-1">Email</dt>
                            <dd className="text-sm text-slate-900 font-semibold">{user.email}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500 mb-1">Trang thai</dt>
                            <dd>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${user.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                    <span className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                    {user.is_active ? 'Hoat dong' : 'Da khoa'}
                                </span>
                            </dd>
                        </div>
                     </dl>
                  </div>
                </div>
            ) : (
                // --- Ticket Chat View ---
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <TicketParserChat />
                </div>
            )}
          </main>
        </div>
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </>
  );
}

export default App;
