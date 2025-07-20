import { supabase } from '../../lib/supabase'
import type { StartupUser, CreateStartupUser, UpdateStartupUser } from '../../shared/types/user'

/**
 * Récupère le profil utilisateur depuis la table startup_users
 */
export const getStartupUserProfile = async (userId: string): Promise<StartupUser | null> => {
  const { data, error } = await supabase
    .from('startup_users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // Aucun profil trouvé
      return null
    }
    console.error('Erreur lors de la récupération du profil utilisateur startup:', error)
    throw new Error('Impossible de récupérer le profil utilisateur')
  }

  return data
}

/**
 * Crée un nouveau profil utilisateur startup
 */
export const createStartupUserProfile = async (
  userId: string,
  profileData: CreateStartupUser
): Promise<StartupUser> => {
  const newProfile = {
    id: userId,
    email: profileData.email,
    first_name: profileData.first_name || null,
    last_name: profileData.last_name || null,
    company_name: profileData.company_name || null,
    phone: profileData.phone || null,
    address: profileData.address || null,
    city: profileData.city || null,
    postal_code: profileData.postal_code || null,
    country: profileData.country || 'France',
    is_active: true
  }

  const { data, error } = await supabase
    .from('startup_users')
    .insert(newProfile)
    .select()
    .single()

  if (error) {
    console.error('Erreur lors de la création du profil utilisateur startup:', error)
    throw new Error('Impossible de créer le profil utilisateur')
  }

  return data
}

/**
 * Met à jour le profil utilisateur startup
 */
export const updateStartupUserProfile = async (
  userId: string,
  profileData: UpdateStartupUser
): Promise<StartupUser> => {
  const { data, error } = await supabase
    .from('startup_users')
    .update(profileData)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Erreur lors de la mise à jour du profil utilisateur startup:', error)
    throw new Error('Impossible de mettre à jour le profil utilisateur')
  }

  return data
}

/**
 * Met à jour l'email dans le profil utilisateur startup et dans auth
 */
export const updateStartupUserEmail = async (
  userId: string,
  newEmail: string
): Promise<void> => {
  // Mettre à jour l'email dans auth.users
  const { error: authError } = await supabase.auth.updateUser({
    email: newEmail
  })

  if (authError) {
    console.error('Erreur lors de la mise à jour de l\'email dans auth:', authError)
    throw new Error('Impossible de mettre à jour l\'email')
  }

  // Mettre à jour l'email dans startup_users
  const { error: profileError } = await supabase
    .from('startup_users')
    .update({ 
      email: newEmail
    })
    .eq('id', userId)

  if (profileError) {
    console.error('Erreur lors de la mise à jour de l\'email dans le profil startup:', profileError)
    throw new Error('Impossible de mettre à jour l\'email dans le profil')
  }
}

/**
 * Récupère ou crée un profil utilisateur startup
 */
export const getOrCreateStartupUserProfile = async (
  userId: string,
  profileData: CreateStartupUser
): Promise<StartupUser> => {
  let profile = await getStartupUserProfile(userId)
  
  if (!profile) {
    profile = await createStartupUserProfile(userId, profileData)
  }
  
  return profile
}

/**
 * Change le mot de passe utilisateur
 */
export const changeUserPassword = async (newPassword: string): Promise<void> => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) {
    console.error('Erreur lors du changement de mot de passe:', error)
    throw new Error('Impossible de changer le mot de passe')
  }
}

/**
 * Désactive un utilisateur startup (soft delete)
 */
export const deactivateStartupUser = async (userId: string): Promise<void> => {
  const { error } = await supabase
    .from('startup_users')
    .update({ is_active: false })
    .eq('id', userId)

  if (error) {
    console.error('Erreur lors de la désactivation de l\'utilisateur startup:', error)
    throw new Error('Impossible de désactiver l\'utilisateur')
  }
}

/**
 * Réactive un utilisateur startup
 */
export const reactivateStartupUser = async (userId: string): Promise<void> => {
  const { error } = await supabase
    .from('startup_users')
    .update({ is_active: true })
    .eq('id', userId)

  if (error) {
    console.error('Erreur lors de la réactivation de l\'utilisateur startup:', error)
    throw new Error('Impossible de réactiver l\'utilisateur')
  }
}