import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Homepage from '../pages/Homepage'
import SubscriptionPlans from '../pages/SubscriptionPlans'
import MarketplaceCheckout from '../pages/MarketplaceCheckout'

const StartupRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/plans" element={<SubscriptionPlans />} />
      <Route path="/checkout" element={<MarketplaceCheckout />} />
    </Routes>
  )
}

export default StartupRouter