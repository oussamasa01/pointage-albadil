import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { getPointages } from '../services/api';

const Pointages = () => {
  const [pointages, setPointages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchPointages();
  }, [selectedDate]);

  const fetchPointages = async () => {
    setLoading(true);
    try {
      const response = await getPointages(selectedDate);
      setPointages(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des pointages:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (time) => {
    return time.substring(0, 5); // HH:MM
  };

  const getPhotoUrl = (photo) => {
    if (!photo) return null;
    return `http://localhost:8000/storage/${photo}`;
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 bg-lightBg min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-navy">Pointages</h1>
          <div>
            <label className="text-sm font-medium text-gray-700 mr-3">Date :</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-navy">
              Pointages du {formatDate(selectedDate)}
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement...</p>
            </div>
          ) : pointages.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">Aucun pointage pour cette date</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Photo</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Professeur</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Matière</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Matricule</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Heure</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pointages.map((pointage) => (
                      <tr key={pointage.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="w-10 h-10 bg-navy rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {pointage.teacher.photo ? (
                              <img
                                src={getPhotoUrl(pointage.teacher.photo)}
                                alt={`${pointage.teacher.prenom} ${pointage.teacher.nom}`}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              `${pointage.teacher.prenom[0]}${pointage.teacher.nom[0]}`
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {pointage.teacher.prenom} {pointage.teacher.nom}
                        </td>
                        <td className="py-3 px-4">{pointage.teacher.matiere}</td>
                        <td className="py-3 px-4">
                          <span className="bg-navy text-white px-3 py-1 rounded text-sm">
                            {pointage.teacher.matricule}
                          </span>
                        </td>
                        <td className="py-3 px-4">{formatDate(pointage.date)}</td>
                        <td className="py-3 px-4 font-semibold text-gold">
                          {formatTime(pointage.heure)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pointages;
