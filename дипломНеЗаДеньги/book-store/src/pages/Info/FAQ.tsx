import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import './Info.css';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'Как оформить заказ?',
    answer: 'Выберите понравившиеся книги, добавьте их в корзину и перейдите к оформлению заказа. Заполните данные для доставки, выберите способ оплаты и подтвердите заказ.'
  },
  {
    question: 'Какие способы оплаты доступны?',
    answer: 'Мы принимаем оплату банковскими картами Visa, MasterCard, Белкарт, наличными при получении, через ЕРИП, а также безналичный расчёт для юридических лиц.'
  },
  {
    question: 'Сколько стоит доставка?',
    answer: 'Курьерская доставка по Минску — 5 р. При заказе от 50 р. доставка бесплатная. Самовывоз из наших магазинов всегда бесплатный.'
  },
  {
    question: 'Как узнать статус заказа?',
    answer: 'Вы можете отслеживать статус заказа в личном кабинете в разделе "Мои заказы". Также мы отправляем SMS-уведомления на каждом этапе обработки заказа.'
  },
  {
    question: 'Можно ли вернуть книгу?',
    answer: 'Да, вы можете вернуть товар надлежащего качества в течение 14 дней с момента покупки при сохранении товарного вида и чека.'
  },
  {
    question: 'Как получить скидку?',
    answer: 'Зарегистрируйтесь на сайте и получайте бонусы за каждую покупку. Следите за акциями в разделе "Акции и скидки". Подпишитесь на рассылку для получения персональных предложений.'
  },
  {
    question: 'Есть ли бонусная программа?',
    answer: 'Да! При регистрации вы становитесь участником бонусной программы. За каждую покупку начисляется 5% бонусов, которыми можно оплатить до 30% следующего заказа.'
  },
  {
    question: 'Как связаться со службой поддержки?',
    answer: 'Вы можете позвонить по телефону +375 (29) 123-45-67, написать на email info@bookstore.by или воспользоваться формой обратной связи на сайте.'
  }
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="info-page">
      <div className="container">
        <h1>Вопросы и ответы</h1>
        <p className="info-subtitle">Ответы на часто задаваемые вопросы</p>
        
        <div className="faq-list">
          {faqData.map((item, index) => (
            <div 
              key={index} 
              className={`faq-item ${openIndex === index ? 'open' : ''}`}
            >
              <button 
                className="faq-question"
                onClick={() => toggleQuestion(index)}
              >
                <span>{item.question}</span>
                <ChevronDown size={20} />
              </button>
              <div className="faq-answer">
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="info-section">
          <div className="info-contact-box">
            <h3>Не нашли ответ на свой вопрос?</h3>
            <p>Свяжитесь с нами, и мы с радостью поможем!</p>
            <div className="contact-buttons">
              <a href="tel:+375291234567" className="btn btn-primary">
                Позвонить
              </a>
              <a href="mailto:info@bookstore.by" className="btn btn-outline">
                Написать
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;

