import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { getDashboardStats, getTodayPointages } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_teachers: 0,
    present_today: 0,
    absent_today: 0,
    total_pointages_today: 0,
  });
  const [pointages, setPointages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsResponse, pointagesResponse] = await Promise.all([
        getDashboardStats(),
        getTodayPointages(),
      ]);
      setStats(statsResponse.data);
      setPointages(pointagesResponse.data);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time) => {
    return time.substring(0, 5); // HH:MM
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8 bg-lightBg">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 bg-lightBg min-h-screen">
        <h1 className="text-3xl font-bold text-navy mb-8">Dashboard</h1>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Total Professeurs</p>
            <p className="text-4xl font-bold text-navy">{stats.total_teachers}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Présents Aujourd'hui</p>
            <p className="text-4xl font-bold text-green-600">{stats.present_today}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Absents Aujourd'hui</p>
            <p className="text-4xl font-bold text-red-600">{stats.absent_today}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Total Pointages</p>
            <p className="text-4xl font-bold text-gold">{stats.total_pointages_today}</p>
          </div>
        </div>

        {/* Liste des pointages du jour */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-navy">Pointages d'aujourd'hui</h2>
          </div>
          <div className="p-6">
            {pointages.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Aucun pointage aujourd'hui</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Professeur</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Matière</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Matricule</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Heure</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pointages.map((pointage) => (
                      <tr key={pointage.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          {pointage.teacher.prenom} {pointage.teacher.nom}
                        </td>
                        <td className="py-3 px-4">{pointage.teacher.matiere}</td>
                        <td className="py-3 px-4">
                          <span className="bg-navy text-white px-3 py-1 rounded text-sm">
                            {pointage.teacher.matricule}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-gold">
                          {formatTime(pointage.heure)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
