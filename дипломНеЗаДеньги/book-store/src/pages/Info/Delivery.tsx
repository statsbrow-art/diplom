import React from 'react';
import { Truck, Clock, MapPin, Package } from 'lucide-react';
import './Info.css';

const Delivery: React.FC = () => {
  return (
    <div className="info-page">
      <div className="container">
        <h1>Доставка</h1>
        
        <div className="info-cards">
          <div className="info-card">
            <div className="info-card-icon">
              <Truck size={32} />
            </div>
            <h3>Курьерская доставка</h3>
            <p>Доставка курьером по Минску — 5 р.</p>
            <p>Бесплатно при заказе от 50 р.</p>
            <span className="info-tag">1-2 дня</span>
          </div>

          <div className="info-card">
            <div className="info-card-icon">
              <Package size={32} />
            </div>
            <h3>Почтовая доставка</h3>
            <p>Доставка Белпочтой по всей Беларуси</p>
            <p>Стоимость от 3 р.</p>
            <span className="info-tag">3-5 дней</span>
          </div>

          <div className="info-card">
            <div className="info-card-icon">
              <MapPin size={32} />
            </div>
            <h3>Самовывоз</h3>
            <p>Бесплатный самовывоз из наших магазинов</p>
            <p>8 пунктов выдачи в Минске</p>
            <span className="info-tag">Бесплатно</span>
          </div>

          <div className="info-card">
            <div className="info-card-icon">
              <Clock size={32} />
            </div>
            <h3>Экспресс-доставка</h3>
            <p>Срочная доставка по Минску</p>
            <p>Стоимость 15 р.</p>
            <span className="info-tag">В тот же день</span>
          </div>
        </div>

        <div className="info-section">
          <h2>Условия доставки</h2>
          <ul className="info-list">
            <li>Доставка осуществляется ежедневно с 9:00 до 21:00</li>
            <li>При получении заказа проверьте целостность упаковки</li>
            <li>Оплата возможна наличными или картой при получении</li>
            <li>Курьер свяжется с вами за час до доставки</li>
            <li>Возможна доставка в выходные и праздничные дни</li>
          </ul>
        </div>

        <div className="info-section">
          <h2>Зоны доставки по Минску</h2>
          <div className="info-table">
            <div className="info-table-row">
              <span>Центр города</span>
              <span>5 р. / бесплатно от 50 р.</span>
            </div>
            <div className="info-table-row">
              <span>Спальные районы</span>
              <span>5 р. / бесплатно от 50 р.</span>
            </div>
            <div className="info-table-row">
              <span>Пригород (до 10 км)</span>
              <span>10 р. / бесплатно от 100 р.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Delivery;

