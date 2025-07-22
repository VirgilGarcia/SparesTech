import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User } from 'lucide-react'
import { useAuth } from '../../shared/context/AuthContext'
import { 
  updateStartupUserProfile, 
  updateStartupUserEmail, 
  changeUserPassword,
  getOrCreateStartupUserProfile 
} from '../services/userProfileService'
import type { StartupUser } from '../../shared/types/user'
import Header from '../components/Header'
import PersonalInfoSection from '../components/profile/PersonalInfoSection'
import MarketplacesSection from '../components/profile/MarketplacesSection'
import SecuritySection from '../components/profile/SecuritySection'
import BillingSection from '../components/profile/BillingSection'

const Profile: React.FC = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  
  // États pour la gestion des formulaires
  const [isEditingPersonal, setIsEditingPersonal] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  // Profil utilisateur et données éditables
  const [userProfile, setUserProfile] = useState<StartupUser | null>(null)
  const [personalData, setPersonalData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    company_name: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'France'
  })

  // Charger le profil utilisateur depuis la table startup_users
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user && !userProfile) { // Éviter la boucle infinie
        try {
          // Récupérer ou créer le profil utilisateur startup
          const profile = await getOrCreateStartupUserProfile(user.id, {
            email: user.email || '',
            first_name: user.user_metadata?.first_name || '',
            last_name: user.user_metadata?.last_name || '',
          })
          setUserProfile(profile)
          
          // Remplir le formulaire avec les données du profil
          setPersonalData({
            email: profile.email || '',
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            phone: profile.phone || '',
            company_name: profile.company_name || '',
            address: profile.address || '',
            city: profile.city || '',
            postal_code: profile.postal_code || '',
            country: profile.country || 'France'
          })
        } catch (error) {
          console.error('Erreur lors du chargement du profil:', error)
          setMessage('Erreur lors du chargement du profil')
          // Créer un profil vide pour éviter la boucle infinie
          setUserProfile({
            id: '',
            email: user.email || '',
            first_name: '',
            last_name: '',
            phone: '',
            company_name: '',
            address: '',
            city: '',
            postal_code: '',
            country: 'France'
          } as any)
        }
      }
    }

    loadUserProfile()
  }, [user?.id]) // Ne dépendre que de l'ID utilisateur
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Marketplaces mockées (à remplacer par les vraies données)
  const [marketplaces] = useState<Array<{
    id: string
    name: string
    url: string
    status: 'active' | 'pending'
    created_at: string
  }>>([
    // Exemple de marketplace - remplacer par de vraies données depuis la DB
  ])

  const handlePersonalDataUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!user || !userProfile) {
        throw new Error('Utilisateur non connecté ou profil non chargé')
      }

      // Mettre à jour l'email si changé
      if (personalData.email !== userProfile.email) {
        await updateStartupUserEmail(user.id, personalData.email)
      }

      // Mettre à jour le profil utilisateur dans startup_users
      const updatedProfile = await updateStartupUserProfile(user.id, {
        first_name: personalData.first_name,
        last_name: personalData.last_name,
        phone: personalData.phone,
        company_name: personalData.company_name,
        address: personalData.address,
        city: personalData.city,
        postal_code: personalData.postal_code,
        country: personalData.country
      })

      // Mettre à jour l'état local
      setUserProfile(updatedProfile)
      setMessage('Informations mises à jour avec succès')
      setIsEditingPersonal(false)
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error)
      setMessage(error.message || 'Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas')
      return
    }
    
    setLoading(true)
    try {
      await changeUserPassword(passwordData.currentPassword, passwordData.newPassword)

      setMessage('Mot de passe mis à jour avec succès')
      setIsChangingPassword(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error: any) {
      console.error('Erreur lors du changement de mot de passe:', error)
      setMessage(error.message || 'Erreur lors du changement de mot de passe')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMarketplace = () => {
    navigate('/pricing')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header du profil */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-4">
              <User className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Mon Profil
            </h1>
            <p className="text-xl text-gray-600">
              Gérez vos informations et créez votre marketplace
            </p>
          </div>

          {/* Grille principale */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Colonne principale - Informations utilisateur */}
            <div className="lg:col-span-2 space-y-6">
              <PersonalInfoSection
                personalData={personalData}
                isEditing={isEditingPersonal}
                loading={loading}
                onToggleEdit={() => setIsEditingPersonal(!isEditingPersonal)}
                onDataChange={(field, value) => setPersonalData(prev => ({ ...prev, [field]: value }))}
                onSubmit={handlePersonalDataUpdate}
              />

              <MarketplacesSection
                marketplaces={marketplaces}
                onCreateMarketplace={handleCreateMarketplace}
              />
            </div>

            {/* Colonne latérale */}
            <div className="space-y-6">
              <SecuritySection
                isChangingPassword={isChangingPassword}
                passwordData={passwordData}
                loading={loading}
                onTogglePasswordChange={() => setIsChangingPassword(!isChangingPassword)}
                onPasswordDataChange={(field, value) => setPasswordData(prev => ({ ...prev, [field]: value }))}
                onPasswordSubmit={handlePasswordChange}
              />

              <BillingSection
                user={user}
                hasMarketplaces={marketplaces.length > 0}
                onUpgrade={() => navigate('/pricing')}
                onSignOut={signOut}
              />
            </div>
            
            {/* Message si pas de données récentes */}
            {message && (
              <div className="lg:col-span-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">{message}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile 