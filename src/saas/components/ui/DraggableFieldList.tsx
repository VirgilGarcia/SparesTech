import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Package } from 'lucide-react'
import type { ProductFieldDisplay } from '../../services/productService'

export interface DraggableFieldListProps {
  fields: ProductFieldDisplay[]
  onReorder: (updates: { id: string; catalog_order?: number; product_order?: number }[]) => void
}

const DraggableFieldItem: React.FC<{ field: ProductFieldDisplay }> = ({ field }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="mb-3">
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3 hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
              <GripVertical className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-gray-900">{field.display_name}</span>
              <span className="text-sm text-gray-500">({field.field_name})</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs rounded-full ${
              field.field_type === 'system' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {field.field_type === 'system' ? 'Système' : 'Personnalisé'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

const DraggableFieldList: React.FC<DraggableFieldListProps> = ({ fields }) => {
  return (
    <div className="space-y-2">
      {fields.map((field) => (
        <DraggableFieldItem
          key={field.id}
          field={field}
        />
      ))}
    </div>
  )
}

export default DraggableFieldList 