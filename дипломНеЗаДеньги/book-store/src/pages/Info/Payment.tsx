import React from 'react';
import { CreditCard, Banknote, Smartphone, Building } from 'lucide-react';
import './Info.css';

const Payment: React.FC = () => {
  return (
    <div className="info-page">
      <div className="container">
        <h1>Оплата</h1>
        
        <div className="info-cards">
          <div className="info-card">
            <div className="info-card-icon">
              <CreditCard size={32} />
            </div>
            <h3>Банковской картой онлайн</h3>
            <p>Visa, MasterCard, Белкарт</p>
            <p>Безопасная оплата через платёжный шлюз</p>
          </div>

          <div className="info-card">
            <div className="info-card-icon">
              <Banknote size={32} />
            </div>
            <h3>Наличными при получении</h3>
            <p>Оплата курьеру или в пункте выдачи</p>
            <p>Без комиссии</p>
          </div>

          <div className="info-card">
            <div className="info-card-icon">
              <Smartphone size={32} />
            </div>
            <h3>ЕРИП</h3>
            <p>Оплата через систему "Расчёт" (ЕРИП)</p>
            <p>Интернет-банкинг, инфокиоск, банкомат</p>
          </div>

          <div className="info-card">
            <div className="info-card-icon">
              <Building size={32} />
            </div>
            <h3>Безналичный расчёт</h3>
            <p>Для юридических лиц</p>
            <p>Оплата по счёту</p>
          </div>
        </div>

        <div className="info-section">
          <h2>Безопасность платежей</h2>
          <p className="info-text">
            Все платежи на сайте защищены протоколом SSL. Данные вашей карты 
            не сохраняются на нашем сервере и передаются напрямую в банк через 
            защищённое соединение. Мы используем сертифицированные платёжные 
            системы, соответствующие стандарту PCI DSS.
          </p>
        </div>

        <div className="info-section">
          <h2>Инструкция по оплате через ЕРИП</h2>
          <ol className="info-list numbered">
            <li>Выберите пункт "Система Расчёт" (ЕРИП)</li>
            <li>Выберите раздел "Интернет-магазины/сервисы"</li>
            <li>Найдите BookStore в списке</li>
            <li>Введите номер заказа</li>
            <li>Проверьте данные и подтвердите оплату</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Payment;

