import React, { useState, useEffect } from 'react';
import { LoginPage } from './pages/LoginPage';
import { silentRefresh, getMe, logout } from './services/authService';
import type { User } from './services/authService';
import { Plane, LogOut, MessageSquare, User as UserIcon, ChevronDown, Settings, HelpCircle } from 'lucide-react';
import { TicketParserChat } from './features/tickets/TicketParseChat'; 

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'chat'>('chat'); 
  const [showUserMenu, setShowUserMenu] = useState(false);

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
    setShowUserMenu(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Plane size={32} className="text-white" />
          </div>
          <p className="text-slate-400 text-sm font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {user ? (
        <div className="min-h-screen bg-slate-100 flex flex-col">
          {/* Header */}
          <header className="bg-slate-900 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                  <Plane size={20} className="text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-base font-bold text-white leading-tight">Flight Automation</h1>
                  <p className="text-[10px] text-slate-400 font-medium tracking-wider">SMART PROCESSING</p>
                </div>
              </div>

              {/* Navigation Tabs (Centered) */}
              <div className="flex bg-white/10 p-1 rounded-xl border border-white/10">
                <button 
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'profile' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UserIcon size={16} /> 
                  <span className="hidden sm:inline">Hồ sơ</span>
                </button>
                <button 
                  onClick={() => setActiveTab('chat')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'chat' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <MessageSquare size={16} /> 
                  <span className="hidden sm:inline">Xử lý vé</span>
                </button>
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white font-semibold text-sm border border-white/10">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-medium text-white">{user.username}</p>
                    <p className="text-xs text-slate-400 truncate max-w-[120px]">{user.email}</p>
                  </div>
                  <ChevronDown size={16} className="text-slate-400 hidden md:block" />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
                      <div className="p-3 border-b border-slate-100 bg-slate-50">
                        <p className="text-sm font-semibold text-slate-900">{user.username}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                      <div className="p-1">
                        <button 
                          onClick={() => { setActiveTab('profile'); setShowUserMenu(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <UserIcon size={16} className="text-slate-400" />
                          Hồ sơ cá nhân
                        </button>
                        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                          <Settings size={16} className="text-slate-400" />
                          Cài đặt
                        </button>
                        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                          <HelpCircle size={16} className="text-slate-400" />
                          Trợ giúp
                        </button>
                      </div>
                      <div className="p-1 border-t border-slate-100">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <LogOut size={16} />
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
            {activeTab === 'profile' ? (
              // --- Profile View ---
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                {/* Profile Header */}
                <div className="bg-slate-900 p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white text-2xl font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Xin chào, {user.username}!</h2>
                      <p className="text-sm text-slate-400">{user.email}</p>
                    </div>
                  </div>
                </div>
                
                {/* Profile Content */}
                <div className="p-6">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Thông tin tài khoản</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <p className="text-xs font-medium text-slate-500 mb-1">Email</p>
                      <p className="text-sm font-medium text-slate-900">{user.email}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <p className="text-xs font-medium text-slate-500 mb-1">Trạng thái</p>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <span className={`text-sm font-medium ${user.is_active ? 'text-emerald-600' : 'text-red-600'}`}>
                          {user.is_active ? 'Đang hoạt động' : 'Đã khóa'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // --- Ticket Chat View ---
              <div>
                <TicketParserChat />
              </div>
            )}
          </main>

          {/* Mobile Bottom Nav */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-2 z-40">
            <div className="flex items-center justify-around">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-colors ${
                  activeTab === 'profile' ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                <UserIcon size={20} />
                <span className="text-xs font-medium">Hồ sơ</span>
              </button>
              <button 
                onClick={() => setActiveTab('chat')}
                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-colors ${
                  activeTab === 'chat' ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                <MessageSquare size={20} />
                <span className="text-xs font-medium">Xử lý vé</span>
              </button>
              <button 
                onClick={handleLogout}
                className="flex flex-col items-center gap-1 py-2 px-4 rounded-xl text-slate-400 hover:text-red-500 transition-colors"
              >
                <LogOut size={20} />
                <span className="text-xs font-medium">Thoát</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </>
  );
}

export default App;
