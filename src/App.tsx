import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Footer from './components/layout/Footer';
import Navbar from './components/layout/Navbar';
import { CartProvider } from './context/CartContext';
import About from './pages/About';
import AdminPage from './pages/Admin';
import Contact from './pages/Contact';
import Gallery from './pages/Gallery';
import Home from './pages/Home';
import Menu from './pages/Menu';
import OrderPage from './pages/Order';

const PublicLayout = () => (
  <>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/o-mne" element={<About />} />
      <Route path="/ponuka" element={<Menu />} />
      <Route path="/galeria" element={<Gallery />} />
      <Route path="/objednavka" element={<OrderPage />} />
      <Route path="/kontakt" element={<Contact />} />
      <Route path="*" element={<Home />} />
    </Routes>
    <Footer />
  </>
);

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <CartProvider>
        <div className="min-h-screen bg-cream-50 text-cocoa-900">
          <Routes>
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/*" element={<PublicLayout />} />
          </Routes>
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;
