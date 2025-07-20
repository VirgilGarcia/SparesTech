import React from 'react'
import { Search, Archive, Users, CheckCircle } from 'lucide-react'

interface UserFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  showArchived: boolean
  onToggleArchived: () => void
  userCount: number
  activeCount: number
  archivedCount: number
}

const UserFilters: React.FC<UserFiltersProps> = ({
  searchQuery,
  onSearchChange,
  showArchived,
  onToggleArchived,
  userCount,
  activeCount,
  archivedCount
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>Total: {userCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Actifs: {activeCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Archive className="w-4 h-4 text-gray-500" />
              <span>Archivés: {archivedCount}</span>
            </div>
          </div>
          
          <button
            onClick={onToggleArchived}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              showArchived
                ? 'bg-gray-100 border-gray-300 text-gray-700'
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {showArchived ? 'Masquer archivés' : 'Voir archivés'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserFilters