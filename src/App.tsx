import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Cart from './pages/Cart'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/Products'
import AddProduct from './pages/admin/AddProduct'
import EditProduct from './pages/admin/EditProduct'
import AdminOrders from './pages/admin/Orders'
import OrderDetail from './pages/admin/OrderDetail'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import './index.css'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/products/add" element={<AddProduct />} />
            <Route path="/admin/products/edit/:id" element={<EditProduct />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/orders/:id" element={<OrderDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success" element={<OrderSuccess />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}

export default App