import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useMarketplaceTheme } from '../../context/ThemeContext'
import { Navigate } from 'react-router-dom'
import Header from '../../components/Header'
import DraggableFieldList from '../../components/DraggableFieldList'
import { productStructureService } from '../../services/productStructureService'
import type { ProductField, ProductFieldDisplay } from '../../services/productService'

const ProductStructure: React.FC = () => {
  const { user, loading: authLoading } = useAuth()
  const { theme } = useMarketplaceTheme()
  const [fields, setFields] = useState<ProductField[]>([])
  const [fieldDisplay, setFieldDisplay] = useState<ProductFieldDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // États pour les formulaires
  const [showAddField, setShowAddField] = useState(false)
  const [editingField, setEditingField] = useState<ProductField | null>(null)
  const [editingDisplay, setEditingDisplay] = useState<ProductFieldDisplay | null>(null)
  
  // Formulaire nouveau champ
  const [newField, setNewField] = useState({
    name: '',
    label: '',
    type: 'text' as ProductField['type'],
    required: false,
    options: [] as string[],
    default_value: ''
  })

  // Formulaire édition champ
  const [editField, setEditField] = useState({
    name: '',
    label: '',
    type: 'text' as ProductField['type'],
    required: false,
    options: [] as string[],
    default_value: ''
  })

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Initialiser les champs système si nécessaire
      await productStructureService.initializeSystemFields()
      
      const [fieldsData, displayData] = await Promise.all([
        productStructureService.getAllFields(),
        productStructureService.getAllFieldDisplay()
      ])
      setFields(fieldsData)
      setFieldDisplay(displayData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!productStructureService.validateFieldName(newField.name)) {
        setError('Le nom du champ doit être en minuscules, sans espaces, et commencer par une lettre')
        return
      }

      if (!productStructureService.validateFieldLabel(newField.label)) {
        setError('Le label du champ est invalide')
        return
      }

      await productStructureService.addField(newField)
      setNewField({
        name: '',
        label: '',
        type: 'text',
        required: false,
        options: [],
        default_value: ''
      })
      setShowAddField(false)
      loadData()
      setSuccessMessage('Champ ajouté avec succès')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout du champ')
    }
  }

  const handleUpdateField = async (id: string, updates: Partial<ProductField>) => {
    try {
      await productStructureService.updateField(id, updates)
      loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la modification')
    }
  }

  const handleEditField = (field: ProductField) => {
    setEditField({
      name: field.name,
      label: field.label,
      type: field.type,
      required: field.required,
      options: field.options || [],
      default_value: field.default_value || ''
    })
    setEditingField(field)
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingField) return

    try {
      if (!productStructureService.validateFieldLabel(editField.label)) {
        setError('Le label du champ est invalide')
        return
      }

      await productStructureService.updateField(editingField.id, {
        label: editField.label,
        type: editField.type,
        required: editField.required,
        options: editField.options,
        default_value: editField.default_value
      })

      // Mettre à jour aussi l'affichage du champ
      const fieldDisplay = await productStructureService.getAllFieldDisplay()
      const displayToUpdate = fieldDisplay.find(d => d.field_name === editingField.name)
      if (displayToUpdate) {
        await productStructureService.updateFieldDisplay(displayToUpdate.id, {
          display_name: editField.label
        })
      }
      
      setEditingField(null)
      setEditField({
        name: '',
        label: '',
        type: 'text',
        required: false,
        options: [],
        default_value: ''
      })
      loadData()
      setSuccessMessage('Champ mis à jour avec succès')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la modification du champ')
    }
  }

  const handleCancelEdit = () => {
    setEditingField(null)
    setEditField({
      name: '',
      label: '',
      type: 'text',
      required: false,
      options: [],
      default_value: ''
    })
  }

  const handleDeleteField = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce champ ?')) {
      try {
        await productStructureService.deleteField(id)
        loadData()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors de la suppression')
      }
    }
  }

  const handleRestoreField = async (id: string) => {
    try {
      await productStructureService.restoreField(id)
      loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la restauration')
    }
  }







  const handleToggleVisibility = async (id: string, type: 'catalog' | 'product') => {
    try {
      // Trouver le champ à modifier
      const fieldToToggle = fieldDisplay.find(f => f.id === id)
      if (!fieldToToggle) return

      // Empêcher de masquer les champs photo et référence
      if (fieldToToggle.field_name === 'photo_url' || fieldToToggle.field_name === 'reference') {
        const currentVisibility = type === 'catalog' ? fieldToToggle.show_in_catalog : fieldToToggle.show_in_product
        if (currentVisibility) {
          setError('Les champs photo et référence ne peuvent pas être masqués')
          return
        }
      }

      // Mettre à jour l'état local immédiatement pour une meilleure UX
      setFieldDisplay(prev => prev.map(field => {
        if (field.id === id) {
          return {
            ...field,
            [type === 'catalog' ? 'show_in_catalog' : 'show_in_product']: !field[type === 'catalog' ? 'show_in_catalog' : 'show_in_product']
          }
        }
        return field
      }))

      // Appeler l'API en arrière-plan
      await productStructureService.toggleFieldVisibility(id, type)
      setSuccessMessage('Visibilité mise à jour avec succès')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      // En cas d'erreur, recharger les données pour revenir à l'état correct
      loadData()
      setError(err instanceof Error ? err.message : 'Erreur lors de la modification de la visibilité')
      setTimeout(() => setError(null), 5000)
    }
  }

  const handleReorder = async (updates: { id: string, catalog_order?: number, product_order?: number }[]) => {
    try {
      // Mettre à jour l'état local immédiatement pour une meilleure UX
      setFieldDisplay(prev => prev.map(field => {
        const update = updates.find(u => u.id === field.id)
        if (update) {
          return {
            ...field,
            ...(update.catalog_order !== undefined && { catalog_order: update.catalog_order }),
            ...(update.product_order !== undefined && { product_order: update.product_order })
          }
        }
        return field
      }))

      // Appeler l'API en arrière-plan
      await productStructureService.reorderFields(updates)
      setSuccessMessage('Ordre mis à jour avec succès')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      // En cas d'erreur, recharger les données pour revenir à l'état correct
      console.error('Erreur lors de la réorganisation:', err)
      loadData()
      setError(err instanceof Error ? err.message : 'Erreur lors de la réorganisation')
      setTimeout(() => setError(null), 5000)
    }
  }

  const renderFieldForm = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {editingField ? 'Modifier le champ' : 'Nouveau champ personnalisé'}
            </h2>
            <p className="text-sm text-gray-600">
              Configurez les propriétés du champ personnalisé
            </p>
          </div>
        </div>
      </div>
      
      <form onSubmit={editingField ? handleSaveEdit : handleAddField} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Nom du champ *
            </label>
            <input
              type="text"
              value={editingField ? editField.name : newField.name}
              onChange={(e) => editingField 
                ? setEditField({ ...editField, name: e.target.value })
                : setNewField({ ...newField, name: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="ex: marque, dimensions, couleur"
              required
              disabled={!!editingField}
            />
            <p className="text-xs text-gray-500">
              {editingField ? 'Le nom ne peut pas être modifié' : 'En minuscules, sans espaces, lettres, chiffres et underscores uniquement'}
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Label d'affichage *
            </label>
            <input
              type="text"
              value={editingField ? editField.label : newField.label}
              onChange={(e) => editingField 
                ? setEditField({ ...editField, label: e.target.value })
                : setNewField({ ...newField, label: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="ex: Marque, Dimensions, Couleur"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Type de champ *
            </label>
            <select
              value={editingField ? editField.type : newField.type}
              onChange={(e) => editingField 
                ? setEditField({ ...editField, type: e.target.value as ProductField['type'] })
                : setNewField({ ...newField, type: e.target.value as ProductField['type'] })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="text">Texte</option>
              <option value="number">Nombre</option>
              <option value="textarea">Zone de texte</option>
              <option value="date">Date</option>
              <option value="url">URL</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Valeur par défaut
            </label>
            <input
              type="text"
              value={editingField ? editField.default_value : newField.default_value}
              onChange={(e) => editingField 
                ? setEditField({ ...editField, default_value: e.target.value })
                : setNewField({ ...newField, default_value: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Valeur par défaut"
            />
          </div>
        </div>



        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="required"
            checked={editingField ? editField.required : newField.required}
            onChange={(e) => editingField 
              ? setEditField({ ...editField, required: e.target.checked })
              : setNewField({ ...newField, required: e.target.checked })
            }
            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="required" className="block text-sm font-medium text-gray-900">
            Champ obligatoire
          </label>
        </div>

        <div className="flex gap-3 pt-6 border-t border-gray-100">
          <button
            type="submit"
            className="flex items-center px-6 py-3 text-white rounded-lg hover:opacity-90 transition-colors font-medium"
            style={{ backgroundColor: theme.primaryColor }}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {editingField ? 'Mettre à jour' : 'Créer le champ'}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowAddField(false)
              handleCancelEdit()
            }}
            className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Annuler
          </button>
        </div>
      </form>
    </div>
  )

  const renderFieldsList = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Champs personnalisés</h3>
            <p className="text-sm text-gray-600 mt-1">
              Créez et gérez vos champs personnalisés pour les produits
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowAddField(true)}
              className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              + Ajouter un champ
            </button>
          </div>
        </div>
      </div>
      
      {fields.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">Aucun champ personnalisé</h4>
          <p className="text-gray-500 text-sm mb-6">Commencez par créer votre premier champ personnalisé</p>
          <button
            onClick={() => setShowAddField(true)}
            className="text-white px-6 py-3 rounded-lg hover:opacity-90 transition-colors font-medium"
            style={{ backgroundColor: theme.primaryColor }}
          >
            Créer un champ
          </button>
        </div>
      ) : (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fields.map((field) => (
              <div key={field.id} className={`bg-white border rounded-lg p-4 hover:shadow-md transition-all duration-200 ${
                field.active ? 'border-gray-200' : 'border-gray-100 bg-gray-50'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      field.type === 'text' ? 'bg-blue-100' :
                      field.type === 'number' ? 'bg-green-100' :
                      field.type === 'boolean' ? 'bg-purple-100' :
                      field.type === 'select' ? 'bg-yellow-100' :
                      field.type === 'textarea' ? 'bg-indigo-100' :
                      field.type === 'date' ? 'bg-pink-100' :
                      'bg-gray-100'
                    }`}>
                      <svg className={`w-5 h-5 ${
                        field.type === 'text' ? 'text-blue-600' :
                        field.type === 'number' ? 'text-green-600' :
                        field.type === 'boolean' ? 'text-purple-600' :
                        field.type === 'select' ? 'text-yellow-600' :
                        field.type === 'textarea' ? 'text-indigo-600' :
                        field.type === 'date' ? 'text-pink-600' :
                        'text-gray-600'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{field.label}</h4>
                      <p className="text-xs text-gray-500">Nom: {field.name}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    field.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {field.active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Type:</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      field.type === 'text' ? 'bg-blue-100 text-blue-800' :
                      field.type === 'number' ? 'bg-green-100 text-green-800' :
                      field.type === 'boolean' ? 'bg-purple-100 text-purple-800' :
                      field.type === 'select' ? 'bg-yellow-100 text-yellow-800' :
                      field.type === 'textarea' ? 'bg-indigo-100 text-indigo-800' :
                      field.type === 'date' ? 'bg-pink-100 text-pink-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {field.type}
                    </span>
                  </div>
                  {field.required && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Obligatoire:</span>
                      <span className="text-xs font-medium text-red-600">Oui</span>
                    </div>
                  )}
                  {field.default_value && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Valeur par défaut:</span>
                      <span className="text-xs text-gray-900 font-medium">{field.default_value}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  {field.active ? (
                    <>
                      <button
                        onClick={() => handleEditField(field)}
                        className="text-sm font-medium hover:opacity-80 transition-opacity"
                        style={{ color: theme.primaryColor }}
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteField(field.id)}
                        className="text-sm text-red-600 hover:text-red-800 transition-colors"
                      >
                        Supprimer
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleRestoreField(field.id)}
                      className="text-sm text-green-600 hover:text-green-800 transition-colors"
                    >
                      Restaurer
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

    const renderDisplaySettings = () => {
    const allFields = fieldDisplay.filter(display => 
      display.field_name !== 'visible' && 
      display.field_name !== 'vendable' && 
      display.field_name !== 'photo_url'
    )

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mt-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Configuration de l'affichage</h3>
          <p className="text-sm text-gray-600 mt-1">
            Glissez-déposez pour réorganiser et configurez la visibilité des champs
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Configuration du catalogue */}
            <div>
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">📋 Configuration du Catalogue</h4>
                <p className="text-xs text-blue-700">
                  Seuls les champs système peuvent être affichés dans le catalogue. 
                  Les champs personnalisés ne sont pas disponibles ici pour maintenir un design cohérent.
                </p>
              </div>
              <DraggableFieldList
                fields={allFields.filter(f => f.field_type === 'system')}
                type="catalog"
                onReorder={handleReorder}
                onToggleVisibility={handleToggleVisibility}
              />
            </div>

            {/* Configuration de la page produit */}
            <div>
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="text-sm font-semibold text-green-800 mb-2">🎨 Configuration de la Page Produit</h4>
                <p className="text-xs text-green-700">
                  Tous les champs (système et personnalisés) peuvent être affichés ici. 
                  Les champs personnalisés utilisent des composants de design spécifiques selon leur type.
                </p>
              </div>
              <DraggableFieldList
                fields={allFields}
                type="product"
                onReorder={handleReorder}
                onToggleVisibility={handleToggleVisibility}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Chargement auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Chargement de l'authentification...</div>
      </div>
    )
  }

  // Redirection si pas connecté
  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="w-full max-w-none px-4 py-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Chargement...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="w-full max-w-none px-4 py-6">
        {/* Titre et actions */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Structure des produits</h1>
            <p className="text-sm text-gray-600">Gérez les champs personnalisés et l'affichage des produits</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddField(!showAddField)}
              className="text-white px-4 py-2 rounded-lg hover:opacity-90 transition-colors font-medium text-sm"
              style={{ backgroundColor: theme.primaryColor }}
            >
              {showAddField ? 'Annuler' : 'Ajouter un champ'}
            </button>


          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {successMessage}
          </div>
        )}

        {(showAddField || editingField) && renderFieldForm()}

        {renderFieldsList()}
        {renderDisplaySettings()}
      </div>
    </div>
  )
}

export default ProductStructure 