import { Router } from 'express'
import { Request, Response } from 'express'

const router = Router()

// === ROUTES CATÉGORIES ===

/**
 * GET /categories - Récupérer toutes les catégories
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // TODO: Récupérer depuis la DB
    console.log('Récupération des catégories')
    
    // Mock data
    const mockCategories = [
      {
        id: 1,
        name: 'Électronique',
        description: 'Appareils électroniques',
        parent_id: null,
        level: 0,
        path: 'electronique',
        order_index: 1,
        is_active: true,
        tenant_id: 'default',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Ordinateurs',
        description: 'Ordinateurs et accessoires',
        parent_id: 1,
        level: 1,
        path: 'electronique/ordinateurs',
        order_index: 1,
        is_active: true,
        tenant_id: 'default',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    res.json({
      success: true,
      data: mockCategories
    })
  } catch (error: any) {
    console.error('Erreur récupération catégories:', error)
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    })
  }
})

/**
 * GET /categories/:id - Récupérer une catégorie par ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // TODO: Récupérer depuis la DB
    console.log('Récupération catégorie:', id)
    
    // Mock data
    const mockCategory = {
      id: parseInt(id || '1'),
      name: `Catégorie ${id}`,
      description: `Description de la catégorie ${id}`,
      parent_id: null,
      level: 0,
      path: `categorie-${id}`,
      order_index: 1,
      is_active: true,
      tenant_id: 'default',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    res.json({
      success: true,
      data: mockCategory
    })
  } catch (error: any) {
    console.error('Erreur récupération catégorie:', error)
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    })
  }
})

/**
 * POST /categories - Créer une nouvelle catégorie
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const categoryData = req.body

    // TODO: Valider et sauvegarder en DB
    console.log('Création catégorie:', categoryData)
    
    const newCategory = {
      id: Date.now(),
      ...categoryData,
      level: categoryData.parent_id ? 1 : 0, // Simplification
      path: categoryData.name.toLowerCase().replace(/\s+/g, '-'),
      is_active: true,
      tenant_id: 'default',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    res.status(201).json({
      success: true,
      data: newCategory
    })
  } catch (error: any) {
    console.error('Erreur création catégorie:', error)
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    })
  }
})

/**
 * PUT /categories/:id - Mettre à jour une catégorie
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updates = req.body

    // TODO: Mettre à jour en DB
    console.log('Mise à jour catégorie:', id, updates)
    
    const updatedCategory = {
      id: parseInt(id || '1'),
      ...updates,
      updated_at: new Date().toISOString()
    }

    res.json({
      success: true,
      data: updatedCategory
    })
  } catch (error: any) {
    console.error('Erreur mise à jour catégorie:', error)
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    })
  }
})

/**
 * DELETE /categories/:id - Supprimer une catégorie
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // TODO: Supprimer de la DB
    console.log('Suppression catégorie:', id)

    res.json({
      success: true,
      message: 'Catégorie supprimée avec succès'
    })
  } catch (error: any) {
    console.error('Erreur suppression catégorie:', error)
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    })
  }
})

export default router