import React, { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../../shared/context/AuthContext'
import { useMarketplaceTheme } from '../../hooks/useMarketplaceTheme'
import { supabase } from '../../../lib/supabase'
import Header from '../../components/layout/Header'
import { FieldForm, FieldsList, ConfirmModal, DragAndDrop } from '../../components/product-structure'
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

  // Fonction pour gérer la désactivation d'un champ
  const handleDeactivateField = (field: ProductField) => {
    setFieldToDeactivate(field)
    setShowDeactivateModal(true)
  }

  const handleConfirmDeactivate = async () => {
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

  const handleReorder = async (updates: { id: string, catalog_order?: number, product_order?: number }[]) => {
    try {
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

      await productStructureService.reorderFields(updates)
      setSuccessMessage('Ordre des champs mis à jour avec succès')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      loadData()
      setError(err instanceof Error ? err.message : 'Erreur lors du changement d\'ordre')
      setTimeout(() => setError(null), 5000)
    }
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
          <div className="text-gray-600">Chargement...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (userRole !== 'admin') {
    return <Navigate to="/admin" replace />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="w-full px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-gray-600 font-medium">Chargement de la structure des produits...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="w-full px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-gray-900 mb-2">Structure des produits</h1>
          <p className="text-gray-600">Gérez les champs personnalisés et leur affichage</p>
        </div>

        {/* Messages */}
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

        {/* Formulaire d'ajout/édition */}
        {(showAddField || editingField) && (
          <FieldForm
            field={editingField ? editField : newField}
            onFieldChange={editingField ? setEditField : setNewField}
            onSubmit={editingField ? handleSaveEdit : handleAddField}
            onCancel={editingField ? handleCancelEdit : () => setShowAddField(false)}
            submitLabel={editingField ? "Sauvegarder" : "Ajouter"}
            isEditing={!!editingField}
          />
        )}

        {/* Liste des champs */}
        {!showAddField && !editingField && (
          <div className="space-y-6">
            <FieldsList
              fields={fields}
              onEditField={handleEditField}
              onDeactivateField={handleDeactivateField}
              onRestoreField={handleRestoreField}
            />
            
            <DragAndDrop
              fieldDisplay={fieldDisplay}
              onReorder={handleReorder}
            />
          </div>
        )}

        {/* Modal de confirmation */}
        <ConfirmModal
          isOpen={showDeactivateModal}
          onConfirm={handleConfirmDeactivate}
          onClose={() => {
            setShowDeactivateModal(false)
            setFieldToDeactivate(null)
          }}
          title="Désactiver le champ"
          message={fieldToDeactivate ? `Êtes-vous sûr de vouloir désactiver le champ "${fieldToDeactivate.label}" ?` : ''}
          type="warning"
        />
      </div>
    </div>
  )
}

export default ProductStructure