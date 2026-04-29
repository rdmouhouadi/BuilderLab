// Barre de filtres — pour l'instant c'est un composant statique
// On ajoutera la logique de filtrage dans la prochaine étape

export default function FilterBar() {
  // Liste des compétences filtrables
  // Ce sont les compétences que les projets peuvent RECHERCHER
  // (et non pas les compétences que les users possèdent)
  const skills = [
    'Tous',
    'Developer',
    'Designer',
    'Data Scientist',
    'Business',
    'Marketing',
  ]

  return (
    <div
      className="flex gap-2 flex-wrap p-3 rounded-xl"
      style={{ backgroundColor: '#161B28', border: '1px solid #1E2840' }}
    >
      {skills.map((skill) => (
        <button
          key={skill}
          className="text-sm px-3 py-1.5 rounded-lg transition-all"
          style={{
            // "Tous" est actif par défaut visuellement
            backgroundColor: skill === 'Tous'
              ? 'rgba(13,148,136,0.14)'
              : 'transparent',
            color: skill === 'Tous' ? '#5EEAD4' : '#64748B',
            border: skill === 'Tous'
              ? '1px solid rgba(13,148,136,0.28)'
              : '1px solid transparent',
          }}
        >
          {skill}
        </button>
      ))}
    </div>
  )
}