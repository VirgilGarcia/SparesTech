import React from 'react'
import { ChevronRight, Check } from 'lucide-react'

interface BreadcrumbStep {
  label: string
  status: 'completed' | 'current' | 'upcoming'
  href?: string
}

interface BreadcrumbProps {
  steps: BreadcrumbStep[]
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ steps }) => {
  return (
    <nav className="flex items-center justify-center mb-8">
      <ol className="flex items-center space-x-4">
        {steps.map((step, index) => (
          <li key={index} className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all
                ${step.status === 'completed' 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : step.status === 'current'
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : 'bg-white border-gray-300 text-gray-500'
                }
              `}>
                {step.status === 'completed' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              <span className={`
                text-sm font-medium transition-colors
                ${step.status === 'current' 
                  ? 'text-blue-600' 
                  : step.status === 'completed'
                  ? 'text-green-600'
                  : 'text-gray-500'
                }
              `}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <ChevronRight className="w-4 h-4 text-gray-400 ml-4" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default Breadcrumb