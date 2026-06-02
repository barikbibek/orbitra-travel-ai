import { Link, useNavigate } from 'react-router-dom';
import { Plane, LogOut, Map, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b-0 border-white/5 px-6 py-4 transition-colors duration-300">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <div className="bg-blue-600 p-2 rounded-xl group-hover:bg-blue-500 transition-colors shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            <Plane className="text-white" size={20} />
          </div>
          <span className="text-foreground font-semibold text-lg tracking-tight">Orbitravel<span className="text-blue-500">AI</span></span>
        </Link>

        {user && (
          <div className="flex items-center gap-6">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-muted
                         hover:text-foreground transition-colors text-sm font-medium"
            >
              <Map size={16} />
              Itineraries
            </Link>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 text-muted hover:text-foreground hover:bg-surface-hover rounded-full transition-colors"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border-subtle">
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-foreground text-sm font-medium pr-1">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-muted hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-500/10"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};