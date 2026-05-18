import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Phone, ExternalLink } from 'lucide-react';
import { api } from '../../services/api';
import './Stores.css';

interface Store {
  id: number;
  name: string;
  address: string;
  city: string;
  phone: string;
  working_hours: string;
  latitude: number;
  longitude: number;
}

const Stores: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const data = await api.getStores();
        setStores(data);
        if (data.length > 0) {
          setSelectedStore(data[0]);
        }
      } catch (error) {
        console.error('Error fetching stores:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  const handleStoreClick = (store: Store) => {
    setSelectedStore(store);
  };

  const getYandexMapUrl = (store: Store) => {
    return `https://yandex.ru/maps/?pt=${store.longitude},${store.latitude}&z=16&l=map`;
  };

  const getYandexEmbedUrl = (store: Store) => {
    return `https://yandex.ru/map-widget/v1/?ll=${store.longitude},${store.latitude}&z=16&pt=${store.longitude},${store.latitude},pm2rdl`;
  };

  if (loading) {
    return (
      <div className="stores-page">
        <div className="container">
          <div className="loading">Загрузка...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="stores-page">
      <div className="container">
        <h1>Наши магазины</h1>
        <p className="stores-subtitle">Посетите ближайший магазин BookStore</p>

        <div className="stores-layout">
          <div className="stores-list">
            {stores.map(store => (
              <div
                key={store.id}
                className={`store-card ${selectedStore?.id === store.id ? 'active' : ''}`}
                onClick={() => handleStoreClick(store)}
              >
                <h3>{store.name}</h3>
                <div className="store-info">
                  <div className="store-info-item">
                    <MapPin size={16} />
                    <span>{store.city}, {store.address}</span>
                  </div>
                  <div className="store-info-item">
                    <Clock size={16} />
                    <span>{store.working_hours}</span>
                  </div>
                  <div className="store-info-item">
                    <Phone size={16} />
                    <span>{store.phone}</span>
                  </div>
                </div>
                {selectedStore?.id === store.id && (
                  <a 
                    href={getYandexMapUrl(store)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="open-map-link"
                  >
                    <ExternalLink size={14} />
                    Открыть в Яндекс.Картах
                  </a>
                )}
              </div>
            ))}
          </div>

          <div className="stores-map">
            {selectedStore && (
              <iframe
                src={getYandexEmbedUrl(selectedStore)}
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
                title="Карта магазина"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stores;
