import React from 'react'
import DraggableFieldList from '../ui/DraggableFieldList'
import type { ProductFieldDisplay } from '../../services/productService'

interface DragAndDropProps {
  fieldDisplay: ProductFieldDisplay[]
  onReorder: (updates: { id: string; catalog_order?: number; product_order?: number }[]) => Promise<void>
}

const DragAndDrop: React.FC<DragAndDropProps> = ({
  fieldDisplay,
  onReorder
}) => {
  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">
        Ordre d'affichage des champs
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        Glissez-déposez les champs pour modifier leur ordre d'affichage dans le catalogue et sur les pages produit
      </p>
      
      <DraggableFieldList
        fields={fieldDisplay}
        onReorder={onReorder}
      />
    </div>
  )
}

export default DragAndDrop