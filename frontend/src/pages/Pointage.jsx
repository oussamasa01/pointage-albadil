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

      // Jouer un son de succès
      playSuccessSound();
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
        if (err.response.data.pointage_time) {
          setPointageTime(err.response.data.pointage_time.substring(0, 5));
        }
        setStep('already-checked');
        // Jouer un son d'avertissement
        playWarningSound();
      } else {
        setError('Une erreur est survenue');
        setStep('error');
        // Jouer un son d'erreur
        playErrorSound();
      }
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour jouer le son de succès
  const playSuccessSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE=');
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignore errors if autoplay is blocked
    } catch (error) {
      console.log('Audio playback not supported');
    }
  };

  // Fonction pour jouer le son d'avertissement
  const playWarningSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRhQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
      audio.volume = 0.2;
      audio.play().catch(() => {});
    } catch (error) {
      console.log('Audio playback not supported');
    }
  };

  // Fonction pour jouer le son d'erreur
  const playErrorSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRhQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
      audio.volume = 0.2;
      audio.play().catch(() => {});
    } catch (error) {
      console.log('Audio playback not supported');
    }
  };

  // Fonction pour obtenir le message personnalisé selon l'heure
  const getGreetingMessage = () => {
    const hour = new Date().getHours();
    const name = teacher?.prenom || '';

    if (hour >= 5 && hour < 12) {
      return `Bon matin ${name} ! ☀️`;
    } else if (hour >= 12 && hour < 18) {
      return `Bon après-midi ${name} ! 🌤️`;
    } else {
      return `Bonsoir ${name} ! 🌙`;
    }
  };

  const getPhotoUrl = (photo) => {
    if (!photo) return null;
    return `http://localhost:8000/storage/${photo}`;
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Africa/Casablanca',
      hour12: false
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Africa/Casablanca'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-[#001848] to-navy flex flex-col">
      {/* Header avec logo - Responsive */}
      <div className="bg-white/10 backdrop-blur-md border-b border-gold/40 py-3 sm:py-4 md:py-6 px-4 sm:px-6 md:px-8 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center gap-3 sm:gap-4 md:gap-5">
          <div className="bg-white rounded-xl sm:rounded-2xl p-1.5 sm:p-2 shadow-xl ring-2 ring-gold/60 flex-shrink-0">
            <img src="/logo.png" alt="École Al Badil Attarbaoui" className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-white tracking-wide truncate">
              GROUPE SCOLAIRE AL BADIL ATTARBAOUI
            </h1>
            <p className="text-gold text-xs sm:text-sm font-semibold tracking-wider uppercase truncate">
              Système de Pointage des Enseignants
            </p>
          </div>
        </div>
      </div>

      {/* Contenu principal - Responsive avec Grid Layout */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-x-hidden">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 items-center">

          {/* Colonne gauche - Horloge dynamique - Responsive */}
          <div className="flex items-center justify-center w-full">
            <div className="w-full max-w-lg bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md rounded-2xl sm:rounded-3xl border-2 border-gold/50 shadow-2xl p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col items-center justify-center text-center space-y-4 sm:space-y-6 md:space-y-8 min-h-[280px] sm:min-h-[320px] md:min-h-[400px]">

              {/* Heure - Force single line */}
              <div className="bg-navy/30 backdrop-blur-sm rounded-xl sm:rounded-2xl px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 border border-gold/30 w-full flex items-center justify-center">
                <div className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-mono tracking-wide drop-shadow-2xl whitespace-nowrap overflow-hidden">
                  {formatTime(currentTime)}
                </div>
              </div>

            {/* Séparateur */}
            <div className="flex items-center gap-2 sm:gap-3 w-full px-2 sm:px-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent"></div>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gold rounded-full flex-shrink-0"></div>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent"></div>
            </div>

            {/* Date */}
            <div className="text-gold text-base sm:text-lg md:text-xl font-semibold capitalize leading-relaxed px-2 text-center">
              {formatDate(currentTime)}
            </div>
            </div>
          </div>

          {/* Colonne droite - Boîte de pointage - Responsive et Centrée */}
          <div className="flex items-center justify-center w-full">
            <div className="w-full max-w-2xl">

            {/* Étape 1: Saisie du matricule */}
            {step === 'input' && (
              <div className="bg-white/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 lg:p-12 border-2 sm:border-4 border-gold">
                <div className="text-center mb-6 sm:mb-8 md:mb-10">
                  <div className="inline-block bg-gradient-to-r from-navy to-[#001848] text-gold px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-full mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">POINTAGE</h2>
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base md:text-lg">Veuillez saisir votre matricule</p>
                </div>

                <form onSubmit={handleLookup} className="space-y-4 sm:space-y-6 md:space-y-8">
                  <div>
                    <label className="block text-base sm:text-lg md:text-xl font-bold text-navy mb-3 sm:mb-4 text-center">
                      Matricule
                    </label>
                    <input
                      type="text"
                      value={matricule}
                      onChange={(e) => setMatricule(e.target.value)}
                      className="w-full text-center text-3xl sm:text-4xl md:text-5xl py-4 sm:py-6 md:py-8 px-4 sm:px-6 border-2 sm:border-4 border-navy rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-gold focus:border-gold transition-all font-bold text-navy bg-gray-50"
                      placeholder="1025"
                      autoFocus
                      disabled={loading}
                      maxLength={10}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !matricule.trim()}
                    className="w-full bg-gradient-to-r from-navy to-[#001848] text-white text-xl sm:text-2xl md:text-3xl py-4 sm:py-6 md:py-8 px-6 sm:px-8 rounded-xl sm:rounded-2xl font-bold hover:shadow-2xl hover:scale-105 transition-all transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-xl border-2 border-gold active:scale-95"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2 sm:gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-white"></div>
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
              <div className="bg-white/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 lg:p-12 border-2 sm:border-4 border-gold">
                <div className="text-center">
                  <div className="relative inline-block mb-6 sm:mb-8">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 mx-auto rounded-full flex items-center justify-center text-white text-3xl sm:text-4xl md:text-6xl font-bold overflow-hidden border-2 sm:border-4 border-gold shadow-xl bg-gradient-to-br from-navy to-[#001848]">
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
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gold text-navy px-3 sm:px-4 md:px-6 py-1 sm:py-2 rounded-full font-bold text-xs sm:text-sm shadow-lg whitespace-nowrap">
                      {teacher.matricule}
                    </div>
                  </div>

                  <div className="mb-6 sm:mb-8">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gold mb-2 sm:mb-3">Bienvenue</h2>
                    <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-navy mb-3 sm:mb-4 break-words px-2">
                      {teacher.prenom} {teacher.nom}
                    </h3>
                    <div className="inline-block bg-navy text-gold px-4 sm:px-5 md:px-6 py-2 sm:py-3 rounded-full text-base sm:text-lg md:text-xl font-semibold">
                      {teacher.matiere}
                    </div>
                  </div>

                  <button
                    onClick={handleConfirm}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white text-xl sm:text-2xl md:text-3xl py-4 sm:py-6 md:py-8 px-6 sm:px-8 rounded-xl sm:rounded-2xl font-bold hover:shadow-2xl hover:scale-105 transition-all transform disabled:opacity-50 shadow-xl border-2 border-green-800 mb-3 sm:mb-4 active:scale-95"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2 sm:gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-white"></div>
                        <span>ENREGISTREMENT...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 sm:gap-3">
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>PRÉSENT</span>
                      </div>
                    )}
                  </button>

                  <button
                    onClick={resetForm}
                    className="text-gray-500 hover:text-gray-700 underline text-sm sm:text-base md:text-lg font-semibold transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {/* Étape 3: Succès */}
            {step === 'success' && teacher && (
              <div className="bg-white/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 lg:p-12 border-2 sm:border-4 border-green-500">
                <div className="text-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-2xl animate-bounce">
                    <svg className="w-12 h-12 sm:w-14 sm:h-14 md:w-20 md:h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>

                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600 mb-6 sm:mb-8 flex items-center justify-center gap-2 sm:gap-3 flex-wrap animate-pulse">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>POINTAGE ENREGISTRÉ</span>
                  </h2>

                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-navy mb-4 sm:mb-6 break-words px-2">
                    {getGreetingMessage()}
                  </h3>

                  <div className="bg-gradient-to-r from-gold/20 to-gold/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
                    <p className="text-gray-600 text-base sm:text-lg md:text-xl mb-2">Heure d'arrivée</p>
                    <p className="text-5xl sm:text-6xl md:text-7xl font-bold text-gold font-mono">{pointageTime}</p>
                  </div>

                  <p className="text-xl sm:text-2xl md:text-3xl text-navy font-semibold">Bonne journée ! ☀️</p>
                </div>
              </div>
            )}

            {/* Erreur: Matricule incorrect */}
            {step === 'error' && (
              <div className="bg-white/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 lg:p-12 border-2 sm:border-4 border-red-500">
                <div className="text-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-2xl">
                    <svg className="w-12 h-12 sm:w-14 sm:h-14 md:w-20 md:h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>

                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-600 mb-3 sm:mb-4">Matricule incorrect</h2>
                  <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-6 sm:mb-8 md:mb-10">Veuillez réessayer.</p>

                  <button
                    onClick={resetForm}
                    className="w-full bg-gradient-to-r from-navy to-[#001848] text-white text-xl sm:text-2xl md:text-3xl py-4 sm:py-6 md:py-8 px-6 sm:px-8 rounded-xl sm:rounded-2xl font-bold hover:shadow-2xl hover:scale-105 transition-all transform shadow-xl border-2 border-gold active:scale-95"
                  >
                    RÉESSAYER
                  </button>
                </div>
              </div>
            )}

            {/* Déjà pointé */}
            {step === 'already-checked' && teacher && (
              <div className="bg-white/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 lg:p-12 border-2 sm:border-4 border-orange-500">
                <div className="text-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-2xl">
                    <svg className="w-12 h-12 sm:w-14 sm:h-14 md:w-20 md:h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>

                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-600 mb-6 sm:mb-8 px-2">
                    Vous avez déjà effectué votre pointage aujourd'hui
                  </h2>

                  <div className="bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
                    <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-2 sm:mb-3">Heure du pointage</p>
                    <p className="text-5xl sm:text-6xl md:text-7xl font-bold text-orange-600 font-mono">{pointageTime}</p>
                  </div>

                  <button
                    onClick={resetForm}
                    className="w-full bg-gradient-to-r from-navy to-[#001848] text-white text-xl sm:text-2xl md:text-3xl py-4 sm:py-6 md:py-8 px-6 sm:px-8 rounded-xl sm:rounded-2xl font-bold hover:shadow-2xl hover:scale-105 transition-all transform shadow-xl border-2 border-gold active:scale-95"
                  >
                    RETOUR
                  </button>
                </div>
              </div>
            )}
          </div>
          </div>
        </div>
      </div>

      {/* Footer - Responsive */}
      <div className="bg-white/10 backdrop-blur-sm border-t border-gold/30 py-3 sm:py-4 text-center text-white">
        <p className="text-xs sm:text-sm px-4">© 2026 École Al Badil Attarbaoui - Tous droits réservés</p>
      </div>
    </div>
  );
};

export default Pointage;
