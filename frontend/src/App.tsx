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
        <div className="min-h-screen bg-slate-100 flex flex-col">
          {/* Header */}
          <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-slate-900/20 shadow-lg">
                  <Plane size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900 leading-tight">Flight Automation</h1>
                  <p className="text-[10px] text-slate-500 font-medium">SMART PROCESSING</p>
                </div>
              </div>

              {/* Navigation Tabs (Centered) */}
              <div className="hidden md:flex bg-slate-100 p-1 rounded-xl">
                 <button 
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        activeTab === 'profile' 
                        ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                 >
                    <UserIcon size={16} /> Hồ sơ
                 </button>
                 <button 
                    onClick={() => setActiveTab('chat')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        activeTab === 'chat' 
                        ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                 >
                    <MessageSquare size={16} /> Xử lý vé
                 </button>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-900">{user.username}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all"
                  title="Đăng xuất"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
            {activeTab === 'profile' ? (
                // --- Profile View ---
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">👋 Xin chào, {user.username}!</h2>
                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 mt-6">
                     <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Email</dt>
                            <dd className="mt-1 text-sm text-slate-900">{user.email}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-slate-500">Trạng thái</dt>
                            <dd className="mt-1">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {user.is_active ? 'Hoạt động' : 'Đã khóa'}
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