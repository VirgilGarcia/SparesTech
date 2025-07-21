import React from 'react'

interface SettingsNavProps {
  activeTab: 'general' | 'logo'
  onTabChange: (tab: 'general' | 'logo') => void
}

const SettingsNav: React.FC<SettingsNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="bg-white border-b border-gray-200">
      <nav className="flex space-x-8 px-6" aria-label="Tabs">
        <button
          onClick={() => onTabChange('general')}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'general'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Général
        </button>
        <button
          onClick={() => onTabChange('logo')}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'logo'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Logo
        </button>
      </nav>
    </div>
  )
}

export default SettingsNav