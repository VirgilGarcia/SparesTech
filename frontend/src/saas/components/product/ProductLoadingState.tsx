import React from 'react'

interface ProductLoadingStateProps {
  message: string
  theme: any
}

const ProductLoadingState: React.FC<ProductLoadingStateProps> = ({ message, theme }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-3 rounded-full animate-spin mx-auto mb-4"
             style={{ 
               borderColor: `${theme.primaryColor}20`,
               borderTopColor: theme.primaryColor 
             }}></div>
        <div className="text-gray-600">{message}</div>
      </div>
    </div>
  )
}

export default ProductLoadingState