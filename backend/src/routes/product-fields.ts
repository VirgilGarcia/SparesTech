import { Router } from 'express'
import { Request, Response } from 'express'

const router = Router()

// === ROUTES CHAMPS DE PRODUITS ===

/**
 * GET /product-fields - Récupérer tous les champs de produits
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { active } = req.query

    // TODO: Récupérer depuis la DB
    console.log('Récupération des champs de produits:', { active })
    
    // Mock data
    const mockFields = [
      {
        id: '1',
        name: 'couleur',
        label: 'Couleur',
        type: 'text',
        required: false,
        options: null,
        default_value: null,
        active: true,
        system: false,
        catalog_order: 1,
        product_order: 1,
        tenant_id: 'default',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'taille',
        label: 'Taille',
        type: 'select',
        required: false,
        options: ['S', 'M', 'L', 'XL'],
        default_value: 'M',
        active: true,
        system: false,
        catalog_order: 2,
        product_order: 2,
        tenant_id: 'default',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    const filteredFields = active === 'true' 
      ? mockFields.filter(f => f.active)
      : mockFields

    res.json({
      success: true,
      data: filteredFields
    })
  } catch (error: any) {
    console.error('Erreur récupération champs:', error)
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    })
  }
})

/**
 * GET /product-fields/:id - Récupérer un champ par ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // TODO: Récupérer depuis la DB
    console.log('Récupération champ:', id)
    
    // Mock data
    const mockField = {
      id,
      name: `champ_${id}`,
      label: `Champ ${id}`,
      type: 'text',
      required: false,
      options: null,
      default_value: null,
      active: true,
      system: false,
      catalog_order: 1,
      product_order: 1,
      tenant_id: 'default',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    res.json({
      success: true,
      data: mockField
    })
  } catch (error: any) {
    console.error('Erreur récupération champ:', error)
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    })
  }
})

/**
 * GET /product-fields/name/:name - Récupérer un champ par nom
 */
router.get('/name/:name', async (req: Request, res: Response) => {
  try {
    const { name } = req.params

    // TODO: Récupérer depuis la DB
    console.log('Récupération champ par nom:', name)
    
    // Mock data
    const mockField = {
      id: `field_${name}`,
      name: name || 'unknown',
      label: (name || 'Unknown').charAt(0).toUpperCase() + (name || 'unknown').slice(1),
      type: 'text',
      required: false,
      options: null,
      default_value: null,
      active: true,
      system: false,
      catalog_order: 1,
      product_order: 1,
      tenant_id: 'default',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    res.json({
      success: true,
      data: mockField
    })
  } catch (error: any) {
    console.error('Erreur récupération champ par nom:', error)
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    })
  }
})

/**
 * POST /product-fields - Créer un nouveau champ
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const fieldData = req.body

    // TODO: Valider et sauvegarder en DB
    console.log('Création champ:', fieldData)
    
    const newField = {
      id: Date.now().toString(),
      ...fieldData,
      active: fieldData.active !== false,
      system: false,
      tenant_id: 'default',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    res.status(201).json({
      success: true,
      data: newField
    })
  } catch (error: any) {
    console.error('Erreur création champ:', error)
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    })
  }
})

/**
 * PUT /product-fields/:id - Mettre à jour un champ
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updates = req.body

    // TODO: Mettre à jour en DB
    console.log('Mise à jour champ:', id, updates)
    
    const updatedField = {
      id,
      ...updates,
      updated_at: new Date().toISOString()
    }

    res.json({
      success: true,
      data: updatedField
    })
  } catch (error: any) {
    console.error('Erreur mise à jour champ:', error)
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    })
  }
})

/**
 * DELETE /product-fields/:id - Supprimer un champ
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // TODO: Supprimer de la DB
    console.log('Suppression champ:', id)

    res.json({
      success: true,
      message: 'Champ supprimé avec succès'
    })
  } catch (error: any) {
    console.error('Erreur suppression champ:', error)
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    })
  }
})

/**
 * GET /product-fields/system - Récupérer les champs système
 */
router.get('/system', async (req: Request, res: Response) => {
  try {
    // TODO: Récupérer depuis la DB
    console.log('Récupération champs système')
    
    // Mock data
    const systemFields = [
      {
        id: 'system_1',
        name: 'name',
        label: 'Nom',
        type: 'text',
        required: true,
        active: true,
        system: true,
        catalog_order: 0,
        product_order: 0
      }
    ]

    res.json({
      success: true,
      data: systemFields
    })
  } catch (error: any) {
    console.error('Erreur récupération champs système:', error)
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    })
  }
})

/**
 * GET /product-fields/custom - Récupérer les champs personnalisés
 */
router.get('/custom', async (req: Request, res: Response) => {
  try {
    // TODO: Récupérer depuis la DB
    console.log('Récupération champs personnalisés')
    
    // Mock data avec champs non-système
    const customFields = [
      {
        id: '1',
        name: 'couleur',
        label: 'Couleur',
        type: 'text',
        required: false,
        active: true,
        system: false,
        catalog_order: 1,
        product_order: 1
      }
    ]

    res.json({
      success: true,
      data: customFields
    })
  } catch (error: any) {
    console.error('Erreur récupération champs personnalisés:', error)
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    })
  }
})

export default router