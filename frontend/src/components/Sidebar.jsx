import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../services/api';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/admin/login');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-navy text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-gold">
        <h1 className="text-xl font-bold text-gold">ÉCOLE AL BADIL</h1>
        <p className="text-sm text-gray-300 mt-1">Système de Pointage</p>
      </div>

      <nav className="flex-1 p-4">
        <Link
          to="/admin/dashboard"
          className={`block py-3 px-4 rounded mb-2 transition ${
            isActive('/admin/dashboard')
              ? 'bg-gold text-navy font-semibold'
              : 'hover:bg-navy-light hover:bg-opacity-50'
          }`}
        >
          Dashboard
        </Link>
        <Link
          to="/admin/teachers"
          className={`block py-3 px-4 rounded mb-2 transition ${
            isActive('/admin/teachers')
              ? 'bg-gold text-navy font-semibold'
              : 'hover:bg-navy-light hover:bg-opacity-50'
          }`}
        >
          Professeurs
        </Link>
        <Link
          to="/admin/pointages"
          className={`block py-3 px-4 rounded mb-2 transition ${
            isActive('/admin/pointages')
              ? 'bg-gold text-navy font-semibold'
              : 'hover:bg-navy-light hover:bg-opacity-50'
          }`}
        >
          Pointages
        </Link>
      </nav>

      <div className="p-4 border-t border-gold">
        <button
          onClick={handleLogout}
          className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 rounded transition font-semibold"
        >
          Déconnexion
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
