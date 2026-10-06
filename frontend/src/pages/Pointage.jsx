import { useState, useEffect } from 'react';
import { lookupTeacher, confirmPointage } from '../services/api';

const Pointage = () => {
  const [matricule, setMatricule] = useState('');
  const [step, setStep] = useState('input'); // input, confirm, success, error, already-checked
  const [teacher, setTeacher] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pointageTime, setPointageTime] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (step === 'success') {
      const timer = setTimeout(() => {
        resetForm();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const resetForm = () => {
    setMatricule('');
    setStep('input');
    setTeacher(null);
    setError('');
    setPointageTime('');
  };

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!matricule.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await lookupTeacher(matricule);
      setTeacher(response.data.teacher);

      if (response.data.already_checked_in) {
        setPointageTime(response.data.pointage_time.substring(0, 5));
        setStep('already-checked');
      } else {
        setStep('confirm');
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Matricule incorrect');
        setStep('error');
      } else {
        setError('Une erreur est survenue');
        setStep('error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);

    try {
      const response = await confirmPointage(teacher.id);
      const time = response.data.pointage.heure.substring(0, 5);
      setPointageTime(time);
      setStep('success');
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
        if (err.response.data.pointage_time) {
          setPointageTime(err.response.data.pointage_time.substring(0, 5));
        }
        setStep('already-checked');
      } else {
        setError('Une erreur est survenue');
        setStep('error');
      }
    } finally {
      setLoading(false);
    }
  };

  const getPhotoUrl = (photo) => {
    if (!photo) return null;
    return `http://localhost:8000/storage/${photo}`;
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-[#001848] to-navy flex flex-col">
      {/* Header avec logo et horloge */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-gold/30 py-4 px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="École Al Badil Attarbaoui" className="h-16 w-auto" />
            <div>
              <h1 className="text-2xl font-bold text-white">ÉCOLE AL BADIL ATTARBAOUI</h1>
              <p className="text-gold text-sm font-semibold">Système de Pointage</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white text-3xl font-bold font-mono">{formatTime(currentTime)}</div>
            <div className="text-gold text-sm mt-1">{formatDate(currentTime)}</div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          {/* Étape 1: Saisie du matricule */}
          {step === 'input' && (
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-12 border-4 border-gold">
              <div className="text-center mb-10">
                <div className="inline-block bg-gradient-to-r from-navy to-[#001848] text-gold px-8 py-3 rounded-full mb-6">
                  <h2 className="text-3xl font-bold">POINTAGE</h2>
                </div>
                <p className="text-gray-600 text-lg">Veuillez saisir votre matricule</p>
              </div>

              <form onSubmit={handleLookup} className="space-y-8">
                <div>
                  <label className="block text-xl font-bold text-navy mb-4 text-center">
                    Matricule
                  </label>
                  <input
                    type="text"
                    value={matricule}
                    onChange={(e) => setMatricule(e.target.value)}
                    className="w-full text-center text-5xl py-8 px-6 border-4 border-navy rounded-2xl focus:ring-4 focus:ring-gold focus:border-gold transition-all font-bold text-navy bg-gray-50"
                    placeholder="1025"
                    autoFocus
                    disabled={loading}
                    maxLength={10}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !matricule.trim()}
                  className="w-full bg-gradient-to-r from-navy to-[#001848] text-white text-3xl py-8 px-8 rounded-2xl font-bold hover:shadow-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-xl border-2 border-gold"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                      <span>RECHERCHE...</span>
                    </div>
                  ) : (
                    'ENTRER'
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Étape 2: Confirmation */}
          {step === 'confirm' && teacher && (
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-12 border-4 border-gold">
              <div className="text-center">
                <div className="relative inline-block mb-8">
                  <div className="w-40 h-40 mx-auto rounded-full flex items-center justify-center text-white text-6xl font-bold overflow-hidden border-4 border-gold shadow-xl bg-gradient-to-br from-navy to-[#001848]">
                    {teacher.photo ? (
                      <img
                        src={getPhotoUrl(teacher.photo)}
                        alt={`${teacher.prenom} ${teacher.nom}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      `${teacher.prenom[0]}${teacher.nom[0]}`
                    )}
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gold text-navy px-6 py-2 rounded-full font-bold text-sm shadow-lg">
                    {teacher.matricule}
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gold mb-3">Bienvenue</h2>
                  <h3 className="text-5xl font-bold text-navy mb-4">
                    {teacher.prenom} {teacher.nom}
                  </h3>
                  <div className="inline-block bg-navy text-gold px-6 py-3 rounded-full text-xl font-semibold">
                    {teacher.matiere}
                  </div>
                </div>

                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white text-3xl py-8 px-8 rounded-2xl font-bold hover:shadow-2xl transition-all transform hover:scale-105 disabled:opacity-50 shadow-xl border-2 border-green-800 mb-4"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                      <span>ENREGISTREMENT...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>PRÉSENT</span>
                    </div>
                  )}
                </button>

                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700 underline text-lg font-semibold"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Étape 3: Succès */}
          {step === 'success' && teacher && (
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-12 border-4 border-green-500 animate-pulse-slow">
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl animate-bounce">
                  <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <h2 className="text-4xl font-bold text-green-600 mb-8 flex items-center justify-center gap-3">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  POINTAGE ENREGISTRÉ
                </h2>

                <h3 className="text-4xl font-bold text-navy mb-6">
                  Bienvenue {teacher.prenom} {teacher.nom}
                </h3>

                <div className="bg-gradient-to-r from-gold/20 to-gold/30 rounded-2xl p-8 mb-6">
                  <p className="text-gray-600 text-xl mb-2">Heure d'arrivée</p>
                  <p className="text-7xl font-bold text-gold font-mono">{pointageTime}</p>
                </div>

                <p className="text-3xl text-navy font-semibold">Bonne journée ! ☀️</p>
              </div>
            </div>
          )}

          {/* Erreur: Matricule incorrect */}
          {step === 'error' && (
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-12 border-4 border-red-500">
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                  <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>

                <h2 className="text-4xl font-bold text-red-600 mb-4">Matricule incorrect</h2>
                <p className="text-2xl text-gray-600 mb-10">Veuillez réessayer.</p>

                <button
                  onClick={resetForm}
                  className="w-full bg-gradient-to-r from-navy to-[#001848] text-white text-3xl py-8 px-8 rounded-2xl font-bold hover:shadow-2xl transition-all transform hover:scale-105 shadow-xl border-2 border-gold"
                >
                  RÉESSAYER
                </button>
              </div>
            </div>
          )}

          {/* Déjà pointé */}
          {step === 'already-checked' && teacher && (
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-12 border-4 border-orange-500">
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                  <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>

                <h2 className="text-3xl font-bold text-orange-600 mb-8">
                  Vous avez déjà effectué votre pointage aujourd'hui
                </h2>

                <div className="bg-gradient-to-r from-orange-100 to-orange-200 rounded-2xl p-8 mb-8">
                  <p className="text-xl text-gray-700 mb-3">Heure du pointage</p>
                  <p className="text-7xl font-bold text-orange-600 font-mono">{pointageTime}</p>
                </div>

                <button
                  onClick={resetForm}
                  className="w-full bg-gradient-to-r from-navy to-[#001848] text-white text-3xl py-8 px-8 rounded-2xl font-bold hover:shadow-2xl transition-all transform hover:scale-105 shadow-xl border-2 border-gold"
                >
                  RETOUR
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white/10 backdrop-blur-sm border-t border-gold/30 py-4 text-center text-white">
        <p className="text-sm">© 2026 École Al Badil Attarbaoui - Tous droits réservés</p>
      </div>
    </div>
  );
};

export default Pointage;
