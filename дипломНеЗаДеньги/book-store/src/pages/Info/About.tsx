import React from 'react';
import { BookOpen, Users, Award, Heart } from 'lucide-react';
import './Info.css';

const About: React.FC = () => {
  return (
    <div className="info-page">
      <div className="container">
        <h1>О нас</h1>
        
        <div className="about-hero">
          <div className="about-hero-content">
            <h2>BookStore — ваш надёжный книжный магазин</h2>
            <p>
              Мы работаем с 2010 года и за это время стали одним из крупнейших 
              книжных магазинов Беларуси. Наша миссия — делать книги доступными 
              для каждого и прививать любовь к чтению.
            </p>
          </div>
        </div>

        <div className="about-stats">
          <div className="stat-item">
            <span className="stat-number">100 000+</span>
            <span className="stat-label">наименований книг</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">500 000+</span>
            <span className="stat-label">довольных покупателей</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">8</span>
            <span className="stat-label">магазинов в Минске</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">14</span>
            <span className="stat-label">лет на рынке</span>
          </div>
        </div>

        <div className="about-values">
          <h2>Наши ценности</h2>
          <div className="values-grid">
            <div className="value-item">
              <BookOpen size={40} />
              <h3>Качество</h3>
              <p>Мы работаем только с проверенными издательствами и гарантируем подлинность каждой книги</p>
            </div>
            <div className="value-item">
              <Users size={40} />
              <h3>Клиентоориентированность</h3>
              <p>Каждый покупатель для нас особенный. Мы всегда готовы помочь с выбором книги</p>
            </div>
            <div className="value-item">
              <Award size={40} />
              <h3>Профессионализм</h3>
              <p>Наши консультанты — настоящие книголюбы, которые знают всё о литературе</p>
            </div>
            <div className="value-item">
              <Heart size={40} />
              <h3>Любовь к книгам</h3>
              <p>Мы верим, что книги меняют жизни, и хотим делиться этой страстью с вами</p>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h2>Наша история</h2>
          <div className="timeline">
            <div className="timeline-item">
              <span className="timeline-year">2010</span>
              <div className="timeline-content">
                <h4>Открытие первого магазина</h4>
                <p>Мы открыли первый магазин BookStore в центре Минска</p>
              </div>
            </div>
            <div className="timeline-item">
              <span className="timeline-year">2015</span>
              <div className="timeline-content">
                <h4>Запуск интернет-магазина</h4>
                <p>Начали продавать книги онлайн с доставкой по всей Беларуси</p>
              </div>
            </div>
            <div className="timeline-item">
              <span className="timeline-year">2020</span>
              <div className="timeline-content">
                <h4>Расширение сети</h4>
                <p>Открыли 8 магазинов в крупнейших ТЦ Минска</p>
              </div>
            </div>
            <div className="timeline-item">
              <span className="timeline-year">2024</span>
              <div className="timeline-content">
                <h4>Новые возможности</h4>
                <p>Запустили мобильное приложение и обновили сайт</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

