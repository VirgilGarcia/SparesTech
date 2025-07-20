import React from 'react'
import { Users, Shield, User, TrendingUp } from 'lucide-react'

interface UserStatsProps {
  userStats: {
    total: number
    active: number
    archived: number
    admins: number
    clients: number
  }
}

const UserStats: React.FC<UserStatsProps> = ({
  userStats
}) => {
  const stats = [
    {
      name: 'Total utilisateurs',
      value: userStats.total,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      name: 'Utilisateurs actifs',
      value: userStats.active,
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      name: 'Administrateurs',
      value: userStats.admins,
      icon: Shield,
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    },
    {
      name: 'Clients',
      value: userStats.clients,
      icon: User,
      color: 'text-orange-600',
      bg: 'bg-orange-100'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default UserStats