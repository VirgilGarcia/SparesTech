import React from 'react'
import { User, Calendar, Shield, Activity } from 'lucide-react'

interface ProfileStatsProps {
  profile: {
    id: string
    first_name?: string | null
    last_name?: string | null
    email: string
    role: string
    created_at: string
    updated_at: string
  }
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ profile }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getFullName = () => {
    const firstName = profile.first_name || ''
    const lastName = profile.last_name || ''
    return `${firstName} ${lastName}`.trim() || 'Nom non renseigné'
  }

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin':
        return { label: 'Administrateur', color: 'text-purple-600', bg: 'bg-purple-100' }
      case 'client':
        return { label: 'Client', color: 'text-green-600', bg: 'bg-green-100' }
      default:
        return { label: 'Utilisateur', color: 'text-gray-600', bg: 'bg-gray-100' }
    }
  }

  const roleInfo = getRoleDisplay(profile.role)

  const stats = [
    {
      name: 'Nom complet',
      value: getFullName(),
      icon: User,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      name: 'Rôle',
      value: roleInfo.label,
      icon: Shield,
      color: roleInfo.color,
      bg: roleInfo.bg
    },
    {
      name: 'Membre depuis',
      value: formatDate(profile.created_at),
      icon: Calendar,
      color: 'text-orange-600',
      bg: 'bg-orange-100'
    },
    {
      name: 'Dernière modification',
      value: formatDate(profile.updated_at),
      icon: Activity,
      color: 'text-green-600',
      bg: 'bg-green-100'
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Informations du compte</h2>
        <p className="text-sm text-gray-600 mt-1">
          Vue d'ensemble de votre profil
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center">
            <div className={`p-3 rounded-full ${stat.bg}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <p className="text-base font-semibold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Email et ID */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-600">Email</p>
            <p className="text-base text-gray-900 break-all">{profile.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">ID utilisateur</p>
            <p className="text-base text-gray-900 font-mono">{profile.id.slice(0, 8)}...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileStats