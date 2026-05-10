import React from 'react';
import { Briefcase, MapPin, Clock, ChevronRight } from 'lucide-react';
import './Info.css';

interface Vacancy {
  id: number;
  title: string;
  location: string;
  type: string;
  salary: string;
  description: string;
}

const vacancies: Vacancy[] = [
  {
    id: 1,
    title: 'Продавец-консультант',
    location: 'ТЦ Галерея, Минск',
    type: 'Полная занятость',
    salary: 'от 1000 р.',
    description: 'Консультирование покупателей, работа с кассой, выкладка товара'
  },
  {
    id: 2,
    title: 'Продавец-консультант',
    location: 'ТЦ Дана Молл, Минск',
    type: 'Полная занятость',
    salary: 'от 1000 р.',
    description: 'Консультирование покупателей, работа с кассой, выкладка товара'
  },
  {
    id: 3,
    title: 'Курьер',
    location: 'Минск',
    type: 'Гибкий график',
    salary: 'от 1200 р.',
    description: 'Доставка заказов по Минску, наличие автомобиля обязательно'
  },
  {
    id: 4,
    title: 'Менеджер интернет-магазина',
    location: 'Офис, Минск',
    type: 'Полная занятость',
    salary: 'от 1500 р.',
    description: 'Обработка заказов, консультирование клиентов, работа с претензиями'
  },
  {
    id: 5,
    title: 'SMM-менеджер',
    location: 'Удалённо',
    type: 'Полная занятость',
    salary: 'от 1300 р.',
    description: 'Ведение социальных сетей, создание контента, работа с блогерами'
  }
];

const Vacancies: React.FC = () => {
  return (
    <div className="info-page">
      <div className="container">
        <h1>Вакансии</h1>
        <p className="info-subtitle">Присоединяйтесь к нашей команде книголюбов!</p>
        
        <div className="vacancies-list">
          {vacancies.map(vacancy => (
            <div key={vacancy.id} className="vacancy-card">
              <div className="vacancy-header">
                <h3>{vacancy.title}</h3>
                <span className="vacancy-salary">{vacancy.salary}</span>
              </div>
              <p className="vacancy-description">{vacancy.description}</p>
              <div className="vacancy-meta">
                <span className="vacancy-tag">
                  <MapPin size={16} />
                  {vacancy.location}
                </span>
                <span className="vacancy-tag">
                  <Clock size={16} />
                  {vacancy.type}
                </span>
              </div>
              <button className="vacancy-apply">
                Откликнуться
                <ChevronRight size={18} />
              </button>
            </div>
          ))}
        </div>

        <div className="info-section">
          <div className="info-contact-box">
            <Briefcase size={40} />
            <h3>Не нашли подходящую вакансию?</h3>
            <p>Отправьте своё резюме, и мы свяжемся с вами, когда появится подходящая позиция</p>
            <a href="mailto:hr@bookstore.by" className="btn btn-primary">
              Отправить резюме
            </a>
          </div>
        </div>

        <div className="info-section">
          <h2>Почему работать у нас?</h2>
          <div className="benefits-grid">
            <div className="benefit-item">
              <span className="benefit-icon">💰</span>
              <h4>Стабильная зарплата</h4>
              <p>Выплаты два раза в месяц без задержек</p>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">📚</span>
              <h4>Скидки на книги</h4>
              <p>30% скидка на весь ассортимент для сотрудников</p>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">📈</span>
              <h4>Карьерный рост</h4>
              <p>Возможность роста до руководящих должностей</p>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">🎓</span>
              <h4>Обучение</h4>
              <p>Бесплатные тренинги и курсы повышения квалификации</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vacancies;

