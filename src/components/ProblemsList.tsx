import { Clock, MapPin, User } from 'lucide-react';

interface ProblemsListProps {
  problems: any[];
  onProblemClick: (problem: any) => void;
}

export function ProblemsList({ problems, onProblemClick }: ProblemsListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  };

  const getStatusBadge = (status: any) => {
    const statusMap: any = {
      soumis: { color: 'bg-blue-100 text-blue-700', label: 'Soumis' },
      'en cours': { color: 'bg-orange-100 text-orange-700', label: 'En cours' },
      résolu: { color: 'bg-green-100 text-green-700', label: 'Résolu' },
    };

    const config = statusMap[status?.code] || { color: 'bg-gray-100 text-gray-700', label: status?.code };
    return config;
  };

  if (problems.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Aucun signalement trouvé</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 overflow-y-auto max-h-[500px]">
      {problems.map((problem) => {
        const statusBadge = getStatusBadge(problem.statut);
        
        return (
          <button
            key={problem.id}
            onClick={() => onProblemClick(problem)}
            className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-start gap-3">
              {/* Image ou icône */}
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                {problem.media?.url ? (
                  <img
                    src={problem.media.url}
                    alt={problem.titre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-gray-900 truncate">{problem.titre}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${statusBadge.color}`}>
                    {statusBadge.label}
                  </span>
                </div>

                {problem.description && (
                  <p className="text-gray-600 line-clamp-2 mb-2">
                    {problem.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 text-gray-600">
                  {problem.quartier && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{problem.quartier}</span>
                    </div>
                  )}
                  
                  {problem.utilisateur_affecte && (
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{problem.utilisateur_affecte.nom || 'Agent'}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(problem.create_at)}</span>
                  </div>
                </div>

                {problem.categorie && (
                  <div className="mt-2">
                    <span
                      className="inline-block px-2 py-1 rounded text-xs"
                      style={{
                        backgroundColor: problem.categorie.couleur || '#e5e7eb',
                        color: '#1f2937',
                      }}
                    >
                      {problem.categorie.libelle}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
