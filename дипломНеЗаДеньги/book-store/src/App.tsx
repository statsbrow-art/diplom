import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { OrderProvider } from './context/OrderContext';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import Catalog from './pages/Catalog/Catalog';
import Cart from './pages/Cart/Cart';
import BookDetails from './pages/BookDetails/BookDetails';
import Auth from './pages/Auth/Auth';
import Profile from './pages/Profile/Profile';
import Favorites from './pages/Favorites/Favorites';
import Stores from './pages/Stores/Stores';
import Checkout from './pages/Checkout/Checkout';
import Admin from './pages/Admin/Admin';
import { Delivery, Payment, Return, FAQ, About, Contacts, Vacancies } from './pages/Info';
import './App.css';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
          <OrderProvider>
            <Router>
            <ScrollToTop />
            <div className="app">
              <Header />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/catalog" element={<Catalog />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/book/:id" element={<BookDetails />} />
                  <Route path="/sale" element={<Catalog />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/stores" element={<Stores />} />
                  <Route path="/delivery" element={<Delivery />} />
                  <Route path="/payment" element={<Payment />} />
                  <Route path="/return" element={<Return />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contacts" element={<Contacts />} />
                  <Route path="/vacancies" element={<Vacancies />} />
                  <Route path="/admin" element={<Admin />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
          </OrderProvider>
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
