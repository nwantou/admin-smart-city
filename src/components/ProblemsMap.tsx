import { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

interface ProblemsMapProps {
  problems: any[];
  onProblemClick: (problem: any) => void;
}

export function ProblemsMap({ problems, onProblemClick }: ProblemsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  // Filtrer les problèmes avec coordonnées valides
  const validProblems = problems.filter(
    (p) => p.latitude && p.longitude && !isNaN(p.latitude) && !isNaN(p.longitude)
  );

  // Carte simple avec Canvas
  useEffect(() => {
    if (!mapRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const container = mapRef.current;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    // Fond de carte
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grille
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    container.innerHTML = '';
    container.appendChild(canvas);
  }, [validProblems]);

  if (validProblems.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Aucun signalement géolocalisé</p>
        </div>
      </div>
    );
  }

  // Calculer les limites
  const lats = validProblems.map((p) => p.latitude);
  const lngs = validProblems.map((p) => p.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  return (
    <div className="relative h-96">
      <div ref={mapRef} className="absolute inset-0 bg-gray-100" />
      
      {/* Marqueurs absolus */}
      <div className="absolute inset-0">
        {validProblems.map((problem) => {
          // Normaliser les coordonnées (0-100%)
          const x = ((problem.longitude - minLng) / (maxLng - minLng || 1)) * 90 + 5;
          const y = ((maxLat - problem.latitude) / (maxLat - minLat || 1)) * 90 + 5;

          const getColor = () => {
            if (problem.statut?.code === 'urgent') return 'bg-red-500';
            if (problem.statut?.code === 'resolu') return 'bg-green-500';
            if (problem.statut?.code === 'en_cours') return 'bg-orange-500';
            return 'bg-blue-500';
          };

          return (
            <button
              key={problem.id}
              onClick={() => onProblemClick(problem)}
              className={`absolute w-6 h-6 ${getColor()} rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition-transform cursor-pointer`}
              style={{ left: `${x}%`, top: `${y}%` }}
              title={problem.titre}
            >
              <span className="sr-only">{problem.titre}</span>
            </button>
          );
        })}
      </div>

      {/* Légende */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-gray-700">Urgent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <span className="text-gray-700">En cours</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-700">Résolu</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-gray-700">Nouveau</span>
        </div>
      </div>
    </div>
  );
}
