import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productService } from '../../services/productService'
import { useAuth } from '../../../shared/context/AuthContext'
import { useMarketplaceTheme } from '../../hooks/useMarketplaceTheme'
import { Navigate } from 'react-router-dom'
import Header from '../../components/layout/Header'
import { ProductEditForm, ProductPreview } from '../../components/product'
import { supabase } from '../../../lib/supabase'
import { productStructureService } from '../../services/productStructureService'

function EditProduct() {
  const { user, loading: authLoading } = useAuth()
  const { theme } = useMarketplaceTheme()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [roleLoading, setRoleLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    reference: '',
    prix: '',
    stock: '',
    photo_url: '',
    visible: true,
    vendable: true,
    category_ids: [] as number[]
  })

  // État pour les champs personnalisés
  const [customFields, setCustomFields] = useState<Record<string, string>>({})
  
  const [loadingProduct, setLoadingProduct] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})
  const [submitting, setSubmitting] = useState(false)

  // Charger le rôle utilisateur
  useEffect(() => {
    if (user) {
      loadUserRole()
    }
  }, [user])

  // Charger le produit
  useEffect(() => {
    if (userRole === 'admin' && id) {
      loadProduct()
    }
  }, [userRole, id])

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

  const loadProduct = async () => {
    if (!id) return
    
    try {
      setLoadingProduct(true)
      const product = await productService.getProduct(id)
      
      if (!product) {
        setError('Produit non trouvé')
        return
      }

      // Charger les informations du produit
      setFormData({
        name: product.name,
        reference: product.reference,
        prix: product.prix?.toString() || '',
        stock: product.stock?.toString() || '',
        photo_url: product.photo_url || '',
        visible: product.visible,
        vendable: product.vendable,
        category_ids: product.product_categories?.map(pc => pc.categories?.id).filter(Boolean) || []
      })

      // Charger les champs personnalisés
      const customFieldsData: Record<string, string> = {}
      if (product.custom_fields) {
        Object.entries(product.custom_fields).forEach(([key, value]) => {
          customFieldsData[key] = value as string
        })
      }
      setCustomFields(customFieldsData)

    } catch (error) {
      console.error('Erreur lors du chargement du produit:', error)
      setError('Erreur lors du chargement du produit')
    } finally {
      setLoadingProduct(false)
    }
  }

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCustomFieldChange = (field: string, value: string) => {
    setCustomFields(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return

    try {
      setSubmitting(true)
      setValidationErrors({})

      // Récupérer les IDs des champs personnalisés
      const customFieldValues = []
      if (Object.keys(customFields).length > 0) {
        const allFields = await productStructureService.getAllFields()
        for (const [fieldName, value] of Object.entries(customFields)) {
          const field = allFields.find(f => f.name === fieldName)
          if (field && value) {
            customFieldValues.push({
              field_id: field.id,
              value: value
            })
          }
        }
      }

      await productService.updateProduct(id, {
        ...formData,
        prix: parseFloat(formData.prix),
        stock: parseInt(formData.stock),
        custom_field_values: customFieldValues
      })

      setSuccess('Produit mis à jour avec succès')
      setTimeout(() => {
        navigate('/admin/products')
      }, 1500)
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error)
      
      if (error.validationErrors) {
        setValidationErrors(error.validationErrors)
      } else {
        setError(error.message || 'Erreur lors de la mise à jour du produit')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/admin/products')
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

  if (loadingProduct) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="w-full px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-gray-600 font-medium">Chargement du produit...</p>
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
          <h1 className="text-3xl font-light text-gray-900 mb-2">Modifier le produit</h1>
          <p className="text-gray-600">Modifiez les informations du produit</p>
        </div>

        {/* Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-700 font-medium">{success}</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire */}
          <div className="lg:col-span-2">
            <ProductEditForm
              formData={formData}
              customFields={customFields}
              onFormChange={handleFormChange}
              onCustomFieldChange={handleCustomFieldChange}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              submitting={submitting}
              validationErrors={validationErrors}
              theme={theme}
            />
          </div>

          {/* Prévisualisation */}
          <div className="lg:col-span-1">
            <ProductPreview
              formData={formData}
              customFields={customFields}
              theme={theme}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditProduct