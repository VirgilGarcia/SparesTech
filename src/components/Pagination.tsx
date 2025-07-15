import React from 'react'
import { useMarketplaceTheme } from '../context/ThemeContext'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
  showInfo?: boolean
  totalItems?: number
  itemsPerPage?: number
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
  showInfo = true,
  totalItems,
  itemsPerPage
}) => {
  const { theme } = useMarketplaceTheme()

  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page)
    }
  }

  if (totalPages <= 1) return null

  const visiblePages = getVisiblePages()
  const startItem = (currentPage - 1) * (itemsPerPage || 0) + 1
  const endItem = Math.min(currentPage * (itemsPerPage || 0), totalItems || 0)

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {showInfo && totalItems && itemsPerPage && (
        <div className="text-sm text-gray-600">
          Affichage de {startItem} à {endItem} sur {totalItems} résultats
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        {/* Bouton précédent */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Précédent
        </button>

        {/* Pages */}
        {visiblePages.map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 text-sm text-gray-500">...</span>
            ) : (
              <button
                onClick={() => handlePageChange(page as number)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  currentPage === page
                    ? 'text-white'
                    : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50'
                }`}
                style={currentPage === page ? { backgroundColor: theme.primaryColor } : {}}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        {/* Bouton suivant */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Suivant
        </button>
      </div>
    </div>
  )
} 