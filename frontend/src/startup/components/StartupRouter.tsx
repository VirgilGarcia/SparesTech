import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Homepage from '../pages/Homepage'
import MarketplaceCheckout from '../pages/MarketplaceCheckout'
import Pricing from '../pages/Pricing'
import Demo from '../pages/Demo'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Profile from '../pages/Profile'
import FAQ from '../pages/FAQ'
import { RequireAuthStartup } from '../../shared/components/routing/RequireAuthStartup'

const StartupRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/demo" element={<Demo />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/checkout" element={<Navigate to="/marketplace-checkout" replace />} />
      <Route path="/marketplace-checkout" element={
        <RequireAuthStartup>
          <MarketplaceCheckout />
        </RequireAuthStartup>
      } />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={
        <RequireAuthStartup>
          <Profile />
        </RequireAuthStartup>
      } />
      <Route path="/plans" element={<Navigate to="/pricing" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default StartupRouter