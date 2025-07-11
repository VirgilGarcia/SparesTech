// App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { MarketplaceProvider } from './context/ThemeContext'
import { RegisterGuard } from './components/RegisterGuard'
import { PrivateRoute } from './components/PrivateRoute'
import { RequireAuth } from './components/RequireAuth'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Cart from './pages/Cart'
import Login from './pages/Login'
import Register from './pages/Register'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import AdminDashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/Products'
import AdminOrders from './pages/admin/Orders'
import OrderDetail from './pages/admin/OrderDetail'
import AddProduct from './pages/admin/AddProduct'
import EditProduct from './pages/admin/EditProduct'
import AdminSettings from './pages/admin/Settings'
import AdminUsers from './pages/admin/Users'
import Profile from './pages/Profile'
import Orders from './pages/Orders'
import './index.css'

function App() {
  return (
    <AuthProvider>
      <MarketplaceProvider>
        <CartProvider>
          <Router>
            <Routes>
              {/* Pages publiques (toujours accessibles) */}
              <Route path="/login" element={<Login />} />
              
              {/* Inscription conditionnelle */}
              <Route path="/register" element={
                <RegisterGuard>
                  <Register />
                </RegisterGuard>
              } />

              {/* Pages principales - protégées si marketplace privé */}
              <Route path="/" element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              } />
              
              <Route path="/catalog" element={
                <PrivateRoute>
                  <Catalog />
                </PrivateRoute>
              } />
              
              <Route path="/cart" element={
                <PrivateRoute>
                  <Cart />
                </PrivateRoute>
              } />
              
              <Route path="/checkout" element={
                <PrivateRoute>
                  <RequireAuth>
                    <Checkout />
                  </RequireAuth>
                </PrivateRoute>
              } />
              
              <Route path="/order-success" element={
                <PrivateRoute>
                  <RequireAuth>
                    <OrderSuccess />
                  </RequireAuth>
                </PrivateRoute>
              } />

              {/* Pages admin - toujours protégées par authentification */}
              <Route path="/admin" element={
                <RequireAuth>
                  <AdminDashboard />
                </RequireAuth>
              } />
              
              <Route path="/admin/products" element={
                <RequireAuth>
                  <AdminProducts />
                </RequireAuth>
              } />
              
              <Route path="/admin/products/add" element={
                <RequireAuth>
                  <AddProduct />
                </RequireAuth>
              } />
              
              <Route path="/admin/products/edit/:id" element={
                <RequireAuth>
                  <EditProduct />
                </RequireAuth>
              } />
              
              <Route path="/admin/orders" element={
                <RequireAuth>
                  <AdminOrders />
                </RequireAuth>
              } />
              
              <Route path="/admin/orders/:id" element={
                <RequireAuth>
                  <OrderDetail />
                </RequireAuth>
              } />
              
              <Route path="/admin/settings" element={
                <RequireAuth>
                  <AdminSettings />
                </RequireAuth>
              } />

              <Route path="/admin/users" element={
                <RequireAuth>
                  <AdminUsers />
                </RequireAuth>
              } />

              <Route path="/profile" element={
                <PrivateRoute>
                  <RequireAuth>
                    <Profile />
                  </RequireAuth>
                </PrivateRoute>
              } />

              <Route path="/orders" element={
                <PrivateRoute>
                  <RequireAuth>
                    <Orders />
                  </RequireAuth>
                </PrivateRoute>
              } />
            </Routes>
          </Router>
        </CartProvider>
      </MarketplaceProvider>
    </AuthProvider>
  )
}

export default App