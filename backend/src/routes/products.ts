import { Router } from 'express'
import { Request, Response } from 'express'

const router = Router()

// Interface pour la réponse standardisée
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// === ROUTES PRODUITS ===

/**
 * GET /products - Récupérer tous les produits avec filtres
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search, category_id, sort_by = 'name', sort_order = 'asc' } = req.query

    // TODO: Implémenter la logique de récupération des produits depuis la DB
    console.log('Récupération des produits:', { page, limit, search, category_id, sort_by, sort_order })
    
    // Mock data pour test
    const mockProducts = [
      {
        id: '1',
        name: 'Produit Test 1',
        reference: 'TEST001',
        prix: 29.99,
        stock: 100,
        visible: true,
        vendable: true,
        tenant_id: 'default',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    const response: ApiResponse = {
      success: true,
      data: {
        products: mockProducts,
        total: 1
      }
    }

    res.json(response)
  } catch (error: any) {
    console.error('Erreur récupération produits:', error)
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération des produits'
    })
  }
})

/**
 * GET /products/:id - Récupérer un produit par ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // TODO: Implémenter la récupération depuis la DB
    console.log('Récupération produit:', id)
    
    // Mock data
    const mockProduct = {
      id: id || '1',
      name: `Produit ${id || '1'}`,
      reference: `TEST${(id || '1').padStart(3, '0')}`,
      prix: 29.99,
      stock: 100,
      visible: true,
      vendable: true,
      tenant_id: 'default',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    res.json({
      success: true,
      data: mockProduct
    })
  } catch (error: any) {
    console.error('Erreur récupération produit:', error)
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    })
  }
})

/**
 * POST /products - Créer un nouveau produit
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const productData = req.body

    // TODO: Valider et sauvegarder en DB
    console.log('Création produit:', productData)
    
    const newProduct = {
      id: Date.now().toString(),
      ...productData,
      tenant_id: 'default', // À récupérer depuis l'auth
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    res.status(201).json({
      success: true,
      data: newProduct
    })
  } catch (error: any) {
    console.error('Erreur création produit:', error)
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    })
  }
})

/**
 * PUT /products/:id - Mettre à jour un produit
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updates = req.body

    // TODO: Mettre à jour en DB
    console.log('Mise à jour produit:', id, updates)
    
    const updatedProduct = {
      id,
      ...updates,
      updated_at: new Date().toISOString()
    }

    res.json({
      success: true,
      data: updatedProduct
    })
  } catch (error: any) {
    console.error('Erreur mise à jour produit:', error)
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    })
  }
})

/**
 * DELETE /products/:id - Supprimer un produit
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // TODO: Supprimer de la DB
    console.log('Suppression produit:', id)

    res.json({
      success: true,
      message: 'Produit supprimé avec succès'
    })
  } catch (error: any) {
    console.error('Erreur suppression produit:', error)
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    })
  }
})

/**
 * GET /products/:id/field-values - Récupérer les valeurs des champs personnalisés d'un produit
 */
router.get('/:id/field-values', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // TODO: Récupérer depuis la DB
    console.log('Récupération valeurs champs produit:', id)
    
    // Mock data
    const mockFieldValues = [
      {
        id: '1',
        product_id: id,
        product_field_id: '1',
        value: 'Valeur test',
        product_fields: {
          id: '1',
          name: 'test_field',
          label: 'Champ Test',
          type: 'text'
        }
      }
    ]

    res.json({
      success: true,
      data: mockFieldValues
    })
  } catch (error: any) {
    console.error('Erreur récupération valeurs champs:', error)
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    })
  }
})

/**
 * POST /products/:id/field-values - Mettre à jour les valeurs des champs personnalisés
 */
router.post('/:id/field-values', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { product_field_id, value } = req.body

    // TODO: Sauvegarder en DB
    console.log('Mise à jour valeur champ:', id, product_field_id, value)

    res.json({
      success: true,
      message: 'Valeur du champ mise à jour'
    })
  } catch (error: any) {
    console.error('Erreur mise à jour valeur champ:', error)
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    })
  }
})

export default router