import './App.css';
import { Route, Routes } from 'react-router-dom';
import Home from './view/home/Home';
import NotFound from './view/notFound/NotFound';
import User from './view/user/User';
import ProductDetail from './view/product/ProductDetail';
import Cart from './view/cart/Cart';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/user" element={<User />} />
        <Route path="/catalog" element={<Home />} />
        <Route path="/*" element={<NotFound />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>
    </>
  );
}

export default App;
