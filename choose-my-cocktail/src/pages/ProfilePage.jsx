import React, { useState, useEffect } from 'react';
// Profile page component
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { HeartIcon, StarIcon, ClockIcon } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline, StarIcon as StarOutline } from '@heroicons/react/24/outline';

const ProfilePage = () => {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const { favoriteItems, ratedItems, loadingData } = useUser();
  const navigate = useNavigate();
  const isKitty = theme === 'kitty';

  const [activeTab, setActiveTab] = useState('favorites');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth/login'); // Or wherever your login page is, maybe just show a message
    }
  }, [user, loading, navigate]);

  if (loading) return <div className="p-10 text-center">Chargement...</div>;
  if (!user) return <div className="p-10 text-center">Veuillez vous connecter.</div>;

  const styles = {
    container: isKitty
      ? "min-h-screen bg-hk-pink-pale text-hk-red-dark p-4 md:p-8 font-display bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMjAnIGhlaWdodD0nMTIwJyB2aWV3Qm94PScwIDAgMTIwIDEyMCc+PHRleHQgeD0nMzAnIHk9JzMwJyBmb250LXNpemU9JzMwJyB0ZXh0LWFuY2hvcj0nbWlkZGxlJyBkeT0nLjM1ZW0nPvCfjoA8L3RleHQ+PHRleHQgeD0nOTAnIHk9JzkwJyBmb250LXNpemU9JzMwJyB0ZXh0LWFuY2hvcj0nbWlkZGxlJyBkeT0nLjM1ZW0nPvCfjoA8L3RleHQ+PC9zdmc+')]"
      : "min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8",
    card: isKitty
      ? "max-w-5xl mx-auto bg-white/90 backdrop-blur-sm border-4 border-hk-pink-light rounded-[2.5rem] shadow-[0_10px_40px_rgba(255,105,180,0.4)] overflow-hidden p-8"
      : "max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden p-8",
    tabBtn: (active) => isKitty
      ? `px-6 py-3 rounded-full font-bold transition-all ${active ? 'bg-hk-pink-hot text-white shadow-lg transform scale-105' : 'bg-white text-hk-pink-hot border-2 border-hk-pink-light hover:bg-hk-pink-pale'}`
      : `px-6 py-3 rounded-lg font-medium transition-all ${active ? 'bg-indigo-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`,
    grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8",
    itemCard: isKitty
      ? "bg-white border-2 border-hk-pink-light rounded-2xl overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 group"
      : "bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 group",
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl ${isKitty ? 'bg-hk-pink-pale border-4 border-hk-pink-hot text-hk-pink-hot' : 'bg-indigo-100 text-indigo-600'}`}>
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${isKitty ? 'text-hk-red-dark' : 'text-gray-900'}`}>
              Bonjour, {user.name} ! {isKitty && '💖'}
            </h1>
            <p className="opacity-70">{user.email}</p>
          </div>
        </div>

        <div className="flex gap-4 justify-center md:justify-start border-b pb-6 border-gray-100">
          <button onClick={() => setActiveTab('favorites')} className={styles.tabBtn(activeTab === 'favorites')}>
            {isKitty ? '💖 Mes Favoris' : 'Favoris'}
          </button>
          <button onClick={() => setActiveTab('ratings')} className={styles.tabBtn(activeTab === 'ratings')}>
            {isKitty ? '⭐ Mes Notes' : 'Notes'}
          </button>
        </div>

        {loadingData ? (
          <div className="text-center py-20 opacity-50">Chargement de vos trésors...</div>
        ) : (
          <div className={styles.grid}>
            {(activeTab === 'favorites' ? favoriteItems : ratedItems).length === 0 && (
              <div className="col-span-full text-center py-20 opacity-50">
                {activeTab === 'favorites'
                  ? (isKitty ? "Vous n'avez pas encore de coups de cœur ! 💔" : "Aucun favori pour le moment.")
                  : (isKitty ? "Vous n'avez pas encore donné votre avis ! 🤐" : "Aucune note pour le moment.")}
              </div>
            )}

            {(activeTab === 'favorites' ? favoriteItems : ratedItems).map((item) => (
              <Link to={item.kind === 'food' ? `/food/${item.id}` : `/cocktail/${item.id}`} key={item.id} className={styles.itemCard}>
                <div className="h-48 overflow-hidden relative">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${isKitty ? 'bg-hk-pink-pale text-hk-pink-hot' : 'bg-gray-100 text-gray-400'}`}>
                      <span className="text-4xl">📷</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs font-bold shadow-sm">
                    {item.kind === 'food' ? '🍽️ Plat' : '🍸 Cocktail'}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1 truncate">{item.title}</h3>

                  {activeTab === 'ratings' && (
                    <div className="flex items-center gap-1 mb-2 text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} className={`w-4 h-4 ${i < item.userRating ? 'text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                      <span className="text-xs text-gray-500 ml-2">({item.userRating}/5)</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm opacity-70 mt-2">
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      {item.total_time || item.preparation_time || '?'} min
                    </span>
                    {activeTab === 'favorites' && (
                        <HeartIcon className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
