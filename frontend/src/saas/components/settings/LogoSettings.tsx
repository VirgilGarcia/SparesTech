import React, { useState } from 'react'
import { Upload, Image } from 'lucide-react'

interface LogoSettingsProps {
  logoPreview: string
  onRemoveLogo: () => Promise<void>
}

const LogoSettings: React.FC<LogoSettingsProps> = ({ logoPreview, onRemoveLogo }) => {
  const [isRemoving, setIsRemoving] = useState(false)
  
  const handleRemove = async () => {
    try {
      setIsRemoving(true)
      await onRemoveLogo()
    } catch (error) {
      console.error('Erreur lors de la suppression du logo:', error)
    } finally {
      setIsRemoving(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Logique d'upload du fichier
    // TODO: Implémenter la logique d'upload
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Logo de la marketplace</h3>
        <p className="text-sm text-gray-600">
          Téléchargez le logo de votre entreprise (max 2 Mo, formats acceptés: JPG, PNG, SVG)
        </p>
      </div>

      <div className="space-y-6">
        {/* Aperçu du logo actuel */}
        {(/* currentLogo || */ logoPreview) && (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-white rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo actuel"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <Image className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">
                  {/* {logoFile ? 'Nouveau logo' : 'Logo actuel'} */}
                  Logo actuel
                </p>
                <p className="text-sm text-gray-600">
                  {/* {logoFile ? logoFile.name : 'Logo de votre marketplace'} */}
                  Logo de votre marketplace
                </p>
              </div>
            </div>
            {/* {logoFile && ( */}
            {/*   <button */}
            {/*     onClick={handleRemoveLogo} */}
            {/*     className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50" */}
            {/*   > */}
            {/*     <X className="w-4 h-4" /> */}
            {/*   </button> */}
            {/* )} */}
            <button
              onClick={handleRemove}
              disabled={isRemoving}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {isRemoving ? 'Suppression...' : 'Supprimer'}
            </button>
          </div>
        )}

        {/* Zone de téléchargement */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
          <div className="text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Télécharger un logo
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Glissez-déposez votre fichier ici ou cliquez pour parcourir
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="logo-upload"
            />
            <label
              htmlFor="logo-upload"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choisir un fichier
            </label>
          </div>
        </div>

        {/* Bouton de sauvegarde */}
        {/* {logoFile && ( */}
        {/*   <div className="flex justify-end"> */}
        {/*     <button */}
        {/*       onClick={onUploadLogo} */}
        {/*       disabled={uploading} */}
        {/*       className="px-4 py-2 text-white rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed" */}
        {/*       style={{ backgroundColor: theme.primaryColor }} */}
        {/*     > */}
        {/*       {uploading ? ( */}
        {/*         <div className="flex items-center"> */}
        {/*           <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> */}
        {/*           Téléchargement... */}
        {/*         </div> */}
        {/*       ) : ( */}
        {/*         'Sauvegarder le logo' */}
        {/*       )} */}
        {/*     </button> */}
        {/*   </div> */}
        {/* )} */}

        {/* Informations */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start">
            <div className="w-5 h-5 text-blue-600 mr-3 mt-0.5">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-blue-800 font-medium">Conseils pour le logo</p>
              <ul className="text-sm text-blue-700 mt-1 space-y-1">
                <li>• Utilisez un format carré ou rectangulaire</li>
                <li>• Résolution recommandée: 200x200px minimum</li>
                <li>• Fond transparent recommandé (PNG)</li>
                <li>• Taille maximale: 2 Mo</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LogoSettings