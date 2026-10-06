import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { getTeachers, createTeacher, updateTeacher, deleteTeacher } from '../services/api';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    matiere: '',
    matricule: '',
    photo: null,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await getTeachers();
      setTeachers(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des professeurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, photo: e.target.files[0] });
  };

  const openAddModal = () => {
    setEditingTeacher(null);
    setFormData({ nom: '', prenom: '', matiere: '', matricule: '', photo: null });
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      nom: teacher.nom,
      prenom: teacher.prenom,
      matiere: teacher.matiere,
      matricule: teacher.matricule,
      photo: null,
    });
    setErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    try {
      if (editingTeacher) {
        await updateTeacher(editingTeacher.id, formData);
      } else {
        await createTeacher(formData);
      }
      setShowModal(false);
      fetchTeachers();
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert('Une erreur est survenue');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTeacher(id);
      fetchTeachers();
      setDeleteConfirm(null);
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  const getPhotoUrl = (photo) => {
    if (!photo) return null;
    return `http://localhost:8000/storage/${photo}`;
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-navy">Professeurs</h1>
          <button
            onClick={openAddModal}
            className="bg-navy text-white px-6 py-3 rounded-lg font-semibold hover:bg-navy/90 transition"
          >
            + Ajouter un professeur
          </button>
        </div>

        {teachers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">Aucun professeur enregistré</p>
            <button
              onClick={openAddModal}
              className="bg-navy text-white px-6 py-2 rounded-lg hover:bg-navy/90"
            >
              Ajouter le premier professeur
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map((teacher) => (
              <div key={teacher.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-navy rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
                      {teacher.photo ? (
                        <img
                          src={getPhotoUrl(teacher.photo)}
                          alt={`${teacher.prenom} ${teacher.nom}`}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        `${teacher.prenom[0]}${teacher.nom[0]}`
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-navy text-lg">
                        {teacher.prenom} {teacher.nom}
                      </h3>
                      <p className="text-gray-600 text-sm">{teacher.matiere}</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <span className="bg-navy text-white px-3 py-1 rounded text-sm font-semibold">
                      {teacher.matricule}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(teacher)}
                      className="flex-1 bg-gold text-white py-2 px-4 rounded hover:bg-gold/90 transition font-semibold"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(teacher.id)}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition font-semibold"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Ajout/Modification */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-navy">
                  {editingTeacher ? 'Modifier le professeur' : 'Ajouter un professeur'}
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                    required
                  />
                  {errors.nom && <p className="text-red-600 text-sm mt-1">{errors.nom[0]}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                    required
                  />
                  {errors.prenom && <p className="text-red-600 text-sm mt-1">{errors.prenom[0]}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Matière</label>
                  <input
                    type="text"
                    name="matiere"
                    value={formData.matiere}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                    required
                  />
                  {errors.matiere && <p className="text-red-600 text-sm mt-1">{errors.matiere[0]}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Matricule</label>
                  <input
                    type="text"
                    name="matricule"
                    value={formData.matricule}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                    required
                  />
                  {errors.matricule && <p className="text-red-600 text-sm mt-1">{errors.matricule[0]}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Photo (optionnelle)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  {errors.photo && <p className="text-red-600 text-sm mt-1">{errors.photo[0]}</p>}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-navy text-white py-2 px-4 rounded-lg hover:bg-navy/90 transition font-semibold disabled:opacity-50"
                  >
                    {submitting ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de confirmation de suppression */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-navy mb-4">Confirmer la suppression</h3>
              <p className="text-gray-600 mb-6">Voulez-vous vraiment supprimer ce professeur ?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition font-semibold"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition font-semibold"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Teachers;
