import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';
import CustomSelect from '../../components/CustomSelect/CustomSelect';
import './Info.css';

const Contacts: React.FC = () => {
  const [topic, setTopic] = useState('order');
  return (
    <div className="info-page">
      <div className="container">
        <h1>Контакты</h1>
        
        <div className="contacts-grid">
          <div className="contact-card main">
            <h2>Служба поддержки</h2>
            <div className="contact-items">
              <div className="contact-item">
                <Phone size={24} />
                <div>
                  <span className="contact-label">Телефон</span>
                  <a href="tel:+375291234567">+375 (29) 123-45-67</a>
                </div>
              </div>
              <div className="contact-item">
                <Mail size={24} />
                <div>
                  <span className="contact-label">Email</span>
                  <a href="mailto:info@bookstore.by">info@bookstore.by</a>
                </div>
              </div>
              <div className="contact-item">
                <MessageCircle size={24} />
                <div>
                  <span className="contact-label">Viber / Telegram</span>
                  <a href="tel:+375291234567">+375 (29) 123-45-67</a>
                </div>
              </div>
              <div className="contact-item">
                <Clock size={24} />
                <div>
                  <span className="contact-label">Время работы</span>
                  <span>Пн-Вс: 9:00 - 21:00</span>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-card">
            <h3>Офис компании</h3>
            <div className="contact-item">
              <MapPin size={20} />
              <div>
                <span>г. Минск, пр-т Независимости, 58</span>
                <span className="contact-note">офис 301, 3 этаж</span>
              </div>
            </div>
          </div>

          <div className="contact-card">
            <h3>Для партнёров</h3>
            <div className="contact-item">
              <Mail size={20} />
              <div>
                <a href="mailto:partners@bookstore.by">partners@bookstore.by</a>
                <span className="contact-note">Сотрудничество и опт</span>
              </div>
            </div>
          </div>

          <div className="contact-card">
            <h3>Пресс-служба</h3>
            <div className="contact-item">
              <Mail size={20} />
              <div>
                <a href="mailto:press@bookstore.by">press@bookstore.by</a>
                <span className="contact-note">Для СМИ</span>
              </div>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h2>Реквизиты</h2>
          <div className="requisites">
            <p><strong>ООО "БукСтор"</strong></p>
            <p>УНП: 123456789</p>
            <p>ОКПО: 12345678</p>
            <p>Юридический адрес: 220030, г. Минск, пр-т Независимости, 58, оф. 301</p>
            <p>Р/с: BY00 ALFA 0000 0000 0000 0000 0000</p>
            <p>ЗАО "Альфа-Банк", БИК: ALFABY2X</p>
          </div>
        </div>

        <div className="info-section">
          <h2>Напишите нам</h2>
          <form className="contact-form">
            <div className="form-row">
              <div className="form-group">
                <label>Ваше имя</label>
                <input type="text" placeholder="Иван Иванов" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="example@mail.com" />
              </div>
            </div>
            <div className="form-group">
              <CustomSelect
                label="Тема обращения"
                value={topic}
                onChange={setTopic}
                options={[
                  { value: 'order', label: 'Вопрос по заказу' },
                  { value: 'return', label: 'Возврат товара' },
                  { value: 'partner', label: 'Предложение о сотрудничестве' },
                  { value: 'other', label: 'Другое' },
                ]}
              />
            </div>
            <div className="form-group">
              <label>Сообщение</label>
              <textarea rows={5} placeholder="Ваше сообщение..."></textarea>
            </div>
            <button type="submit" className="btn btn-primary">Отправить</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contacts;

