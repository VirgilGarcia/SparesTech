import React from 'react'
import { Link } from 'react-router-dom'
import { Plus, Download, Upload } from 'lucide-react'

interface Theme {
  primaryColor: string
  companyName: string
  logoUrl: string | null
}

interface ProductActionsProps {
  theme: Theme
  onExport?: () => void
  onImport?: () => void
}

const ProductActions: React.FC<ProductActionsProps> = ({
  theme,
  onExport,
  onImport
}) => {
  return (
    <div className="flex items-center gap-3">
      <Link
        to="/admin/products/add"
        className="inline-flex items-center px-4 py-2 text-white rounded-md hover:opacity-90 transition-colors"
        style={{ backgroundColor: theme.primaryColor }}
      >
        <Plus className="w-4 h-4 mr-2" />
        Ajouter un produit
      </Link>
      
      {onExport && (
        <button
          onClick={onExport}
          className="inline-flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          Exporter
        </button>
      )}
      
      {onImport && (
        <button
          onClick={onImport}
          className="inline-flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          <Upload className="w-4 h-4 mr-2" />
          Importer
        </button>
      )}
    </div>
  )
}

export default ProductActions