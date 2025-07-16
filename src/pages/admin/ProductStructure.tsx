import React, { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useMarketplaceTheme } from '../../context/ThemeContext'
import { supabase } from '../../lib/supabase'
import Header from '../../components/Header'
import DraggableFieldList from '../../components/DraggableFieldList'
import { productStructureService } from '../../services/productStructureService'
import type { ProductField, ProductFieldDisplay } from '../../services/productService'

const ProductStructure: React.FC = () => {
  const { user, loading: authLoading } = useAuth()
  const { theme } = useMarketplaceTheme()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [roleLoading, setRoleLoading] = useState(false)
  const [fields, setFields] = useState<ProductField[]>([])
  const [fieldDisplay, setFieldDisplay] = useState<ProductFieldDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // États pour les formulaires
  const [showAddField, setShowAddField] = useState(false)
  const [editingField, setEditingField] = useState<ProductField | null>(null)
  const [fieldToDeactivate, setFieldToDeactivate] = useState<ProductField | null>(null)
  const [showDeactivateModal, setShowDeactivateModal] = useState(false)
  
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

  // Charger le rôle utilisateur
  useEffect(() => {
    if (user) {
      loadUserRole()
    }
  }, [user])

  useEffect(() => {
    if (user && userRole === 'admin') {
      loadData()
    }
  }, [user, userRole])

  const loadUserRole = async () => {
    if (!user) return
    
    try {
      setRoleLoading(true)
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setUserRole(data.role)
    } catch (error) {
      console.error('Erreur lors du chargement du rôle:', error)
      setUserRole('client')
    } finally {
      setRoleLoading(false)
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Initialiser les champs système si nécessaire
      await productStructureService.initializeSystemFields()
      
      // Corriger les valeurs d'ordre seulement si pas encore fait
      const migrationKey = 'fieldOrderMigrationDone_v1'
      const migrationDone = localStorage.getItem(migrationKey)
      if (!migrationDone) {
        console.log('🔧 Première migration des ordres de champs...')
        await productStructureService.fixOrderValues()
        localStorage.setItem(migrationKey, 'true')
      }
      
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

  const handleDeactivateField = (field: ProductField) => {
    setFieldToDeactivate(field)
    setShowDeactivateModal(true)
  }

  const confirmDeactivateField = async () => {
    if (!fieldToDeactivate) return
    
    try {
      await productStructureService.updateField(fieldToDeactivate.id, { active: false })
      setSuccessMessage('Champ désactivé avec succès')
      setTimeout(() => setSuccessMessage(null), 3000)
      loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la désactivation')
      setTimeout(() => setError(null), 5000)
    } finally {
      setShowDeactivateModal(false)
      setFieldToDeactivate(null)
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
      console.log('🎯 handleReorder appelé avec:', updates)
      
      // Mettre à jour l'état local immédiatement pour une UX fluide
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
      
      // Sauvegarder en arrière-plan
      await productStructureService.reorderFields(updates)
      
      setSuccessMessage('Ordre mis à jour avec succès')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error('❌ Erreur lors de la réorganisation:', err)
      
      // En cas d'erreur, recharger seulement les données d'affichage sans tout reloader
      try {
        const displayData = await productStructureService.getAllFieldDisplay()
        setFieldDisplay(displayData)
      } catch (reloadErr) {
        console.error('Erreur lors du rechargement des données:', reloadErr)
      }
      
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
              style={{ 
              }}
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
              style={{ 
              }}
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
              style={{ 
              }}
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
              style={{ 
              }}
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
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: `${theme.primaryColor}20` }}>
              <svg className="w-5 h-5" style={{ color: theme.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Champs personnalisés</h3>
              <p className="text-gray-600">
                Créez et gérez vos champs personnalisés pour les produits
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {fields.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
               style={{ backgroundColor: `${theme.primaryColor}20` }}>
            <svg className="w-10 h-10" style={{ color: theme.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h4 className="text-2xl font-bold text-gray-900 mb-3">Aucun champ personnalisé</h4>
          <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
            Commencez par créer votre premier champ personnalisé pour enrichir vos fiches produits avec des informations spécifiques à votre métier.
          </p>
          <button
            onClick={() => setShowAddField(true)}
            className="px-8 py-4 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            style={{ backgroundColor: theme.primaryColor }}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Créer votre premier champ
            </div>
          </button>
        </div>
      ) : (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fields.map((field) => (
              <div key={field.id} className={`bg-white border-2 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                field.active ? 'border-gray-200 hover:border-gray-300' : 'border-gray-100 bg-gray-50'
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      field.type === 'text' ? 'bg-blue-100' :
                      field.type === 'number' ? 'bg-green-100' :
                      field.type === 'boolean' ? 'bg-purple-100' :
                      field.type === 'select' ? 'bg-yellow-100' :
                      field.type === 'textarea' ? 'bg-indigo-100' :
                      field.type === 'date' ? 'bg-pink-100' :
                      'bg-gray-100'
                    }`}>
                      <svg className={`w-6 h-6 ${
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
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{field.label}</h4>
                      <p className="text-sm text-gray-500 font-mono">{field.name}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
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
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  {field.active ? (
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={() => handleEditField(field)}
                        className="flex-1 px-3 py-2 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all duration-200"
                        style={{ color: theme.primaryColor }}
                      >
                        <div className="flex items-center gap-2 justify-center">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Modifier
                        </div>
                      </button>
                      <button
                        onClick={() => handleDeactivateField(field)}
                        className="flex-1 px-3 py-2 text-sm font-medium text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg transition-all duration-200"
                      >
                        <div className="flex items-center gap-2 justify-center">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                          </svg>
                          Désactiver
                        </div>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRestoreField(field.id)}
                      className="w-full px-3 py-2 text-sm font-medium text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200"
                    >
                      <div className="flex items-center gap-2 justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Restaurer
                      </div>
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
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: `${theme.primaryColor}20` }}>
              <svg className="w-5 h-5" style={{ color: theme.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Configuration de l'affichage</h3>
              <p className="text-gray-600">
                Glissez-déposez pour réorganiser et configurez la visibilité des champs
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Configuration du catalogue */}
            <div>
              <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-blue-800 mb-2">Configuration du Catalogue</h4>
                    <p className="text-blue-700 leading-relaxed">
                      Seuls les champs système peuvent être affichés dans le catalogue. 
                      Les champs personnalisés ne sont pas disponibles ici pour maintenir un design cohérent.
                    </p>
                  </div>
                </div>
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
              <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3H5a2 2 0 00-2 2v12a4 4 0 004 4h2M9 3h10a2 2 0 012 2v12a4 4 0 01-4 4H9" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-green-800 mb-2">Configuration de la Page Produit</h4>
                    <p className="text-green-700 leading-relaxed">
                      Tous les champs (système et personnalisés) peuvent être affichés ici. 
                      Les champs personnalisés utilisent des composants de design spécifiques selon leur type.
                    </p>
                  </div>
                </div>
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

  // Chargements et accès
  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 rounded-full animate-spin mx-auto mb-4"
               style={{ 
                 borderColor: `${theme.primaryColor}20`,
                 borderTopColor: theme.primaryColor 
               }}></div>
          <div className="text-gray-600">
            {roleLoading ? 'Vérification des permissions...' : 'Chargement...'}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès Refusé</h1>
            <p className="text-gray-600 mb-6 leading-relaxed">Vous devez être administrateur pour accéder à cette page.</p>
            <div className="space-y-3">
              <Link 
                to="/admin"
                className="block w-full text-white px-6 py-3 rounded-xl hover:opacity-90 transition-colors text-center font-medium"
                style={{ backgroundColor: theme.primaryColor }}
              >
                Retour au dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="w-full max-w-none px-4 py-6">
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-3 rounded-full animate-spin mx-auto mb-4"
                 style={{ 
                   borderColor: `${theme.primaryColor}20`,
                   borderTopColor: theme.primaryColor 
                 }}></div>
            <div className="text-gray-600">Chargement de la structure...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="w-full max-w-none px-4 py-6">
        {/* En-tête avec navigation */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              to="/admin/settings" 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Retour aux paramètres</span>
            </Link>
          </div>
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-light text-gray-900 mb-2">Structure des produits</h1>
                <p className="text-gray-600">Gérez les champs personnalisés et l'affichage des produits</p>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowAddField(!showAddField)}
                className="px-6 py-3 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                style={{ backgroundColor: theme.primaryColor }}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showAddField ? "M6 18L18 6M6 6l12 12" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} />
                  </svg>
                  {showAddField ? 'Annuler' : 'Ajouter un champ'}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Messages de statut */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-700 font-medium">{successMessage}</p>
            </div>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {(showAddField || editingField) && renderFieldForm()}

        {renderFieldsList()}
        {renderDisplaySettings()}
      </div>

      {/* Modal de confirmation de désactivation */}
      {showDeactivateModal && fieldToDeactivate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Désactiver le champ</h3>
                  <p className="text-gray-600">Cette action peut être annulée</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  Êtes-vous sûr de vouloir désactiver le champ <strong>"{fieldToDeactivate.label}"</strong> ?
                </p>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-orange-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-orange-800">
                      <p className="font-medium mb-1">Le champ sera masqué mais conservé</p>
                      <ul className="list-disc list-inside space-y-1 text-orange-700">
                        <li>Les données existantes sont préservées</li>
                        <li>Le champ n'apparaîtra plus dans les formulaires</li>
                        <li>Vous pourrez le réactiver à tout moment</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeactivateModal(false)
                    setFieldToDeactivate(null)
                  }}
                  className="flex-1 px-4 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDeactivateField}
                  className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-medium transition-colors"
                >
                  Désactiver
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductStructure 