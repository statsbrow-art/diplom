import React from 'react';
import { RotateCcw, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import './Info.css';

const Return: React.FC = () => {
  return (
    <div className="info-page">
      <div className="container">
        <h1>Возврат товара</h1>
        
        <div className="info-highlight">
          <RotateCcw size={40} />
          <div>
            <h3>14 дней на возврат</h3>
            <p>Вы можете вернуть товар надлежащего качества в течение 14 дней с момента покупки</p>
          </div>
        </div>

        <div className="info-section">
          <h2>Условия возврата</h2>
          <div className="info-conditions">
            <div className="condition success">
              <CheckCircle size={24} />
              <div>
                <h4>Товар можно вернуть, если:</h4>
                <ul>
                  <li>Сохранён товарный вид и упаковка</li>
                  <li>Есть чек или документ, подтверждающий покупку</li>
                  <li>Не истёк 14-дневный срок возврата</li>
                  <li>Товар не был в употреблении</li>
                </ul>
              </div>
            </div>

            <div className="condition error">
              <XCircle size={24} />
              <div>
                <h4>Товар нельзя вернуть, если:</h4>
                <ul>
                  <li>Повреждена упаковка или сам товар</li>
                  <li>Отсутствуют документы о покупке</li>
                  <li>Прошло более 14 дней с момента покупки</li>
                  <li>Книга относится к букинистическим изданиям</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h2>Как оформить возврат</h2>
          <ol className="info-list numbered">
            <li>Свяжитесь с нашей службой поддержки по телефону +375 (29) 123-45-67</li>
            <li>Сообщите номер заказа и причину возврата</li>
            <li>Получите инструкции по возврату товара</li>
            <li>Отправьте товар или привезите в ближайший магазин</li>
            <li>Получите денежные средства в течение 7 рабочих дней</li>
          </ol>
        </div>

        <div className="info-section">
          <div className="info-notice">
            <AlertCircle size={24} />
            <p>
              При возврате товара надлежащего качества стоимость доставки не возвращается. 
              При возврате товара ненадлежащего качества мы компенсируем все расходы.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Return;

