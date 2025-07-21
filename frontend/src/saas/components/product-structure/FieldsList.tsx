import React from 'react'
import type { ProductField } from '../../services/productService'

interface FieldsListProps {
  fields: ProductField[]
  onEditField: (field: ProductField) => void
  onDeactivateField: (field: ProductField) => void
  onRestoreField: (id: string) => Promise<void>
}

const FieldsList: React.FC<FieldsListProps> = ({
  fields,
  onEditField,
  onDeactivateField,
  onRestoreField,
}) => {
  const activeFields = fields.filter(f => f.active)
  const inactiveFields = fields.filter(f => !f.active)

  const renderFieldRow = (field: ProductField) => (
    <tr key={field.id} className={field.active ? '' : 'bg-gray-50 text-gray-500'}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="text-sm font-medium text-gray-900">
            {field.label}
          </div>
          <div className="text-sm text-gray-500 ml-2">
            ({field.name})
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {field.type}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {field.required ? 'Oui' : 'Non'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {field.active ? 'Actif' : 'Inactif'}
      </td>
      {field.active && (
        <>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            <button
              onClick={() => onEditField(field)}
              className="text-blue-600 hover:text-blue-900"
            >
              Modifier
            </button>
            {!field.system && (
              <button
                onClick={() => onDeactivateField(field)}
                className="text-red-600 hover:text-red-900"
              >
                Désactiver
              </button>
            )}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {field.catalog_order || '-'}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {field.product_order || '-'}
          </td>
        </>
      )}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          {field.active ? (
            <button
              onClick={() => onRestoreField(field.id)}
              className="text-green-600 hover:text-green-900"
            >
              Restaurer
            </button>
          ) : (
            <button
              onClick={() => onRestoreField(field.id)}
              className="text-green-600 hover:text-green-900"
            >
              Restaurer
            </button>
          )}
        </div>
      </td>
    </tr>
  )

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold">Structure des produits</h3>
        <p className="text-sm text-gray-600 mt-1">
          Gérez les champs de vos produits et leur affichage
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Champ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Obligatoire
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ordre Cat.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ordre Prod.
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {activeFields.map(field => renderFieldRow(field))}
            {inactiveFields.map(field => renderFieldRow(field))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default FieldsList