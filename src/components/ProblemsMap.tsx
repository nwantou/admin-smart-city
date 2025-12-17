import { useEffect, useRef, useState } from 'react';
import { MapPin, RefreshCw, Layers, Filter } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix pour les icônes Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ProblemsMapProps {
  problems: any[];
  onProblemClick: (problem: any) => void;
  mapRef: any;
  setMapRef: (ref: any) => void;
}

export function ProblemsMap({ problems, onProblemClick, mapRef, setMapRef }: ProblemsMapProps) {
  const markersRef = useRef<L.Marker[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [mapView, setMapView] = useState<'street' | 'satellite' | 'topo'>('street');
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Filtrer les problèmes selon les filtres
  const filteredProblems = problems.filter((problem) => {
    const categoryMatch = filterCategory === 'all' || problem.id_categorie === filterCategory;
    const statusMatch = filterStatus === 'all' || problem.statut?.code === filterStatus;
    return categoryMatch && statusMatch;
  });

  // Filtrer les problèmes avec coordonnées valides
  const validProblems = filteredProblems.filter(
    (p) => p.latitude && p.longitude && !isNaN(p.latitude) && !isNaN(p.longitude)
  );

  // Initialiser la carte
  useEffect(() => {
    if (!mapRef && mapContainerRef.current && validProblems.length > 0) {
      // Calculer le centre moyen si des problèmes existent
      let center: [number, number] = [45.764043, 4.835659]; // Lyon par défaut
      
      if (validProblems.length > 0) {
        const avgLat = validProblems.reduce((sum, p) => sum + p.latitude, 0) / validProblems.length;
        const avgLng = validProblems.reduce((sum, p) => sum + p.longitude, 0) / validProblems.length;
        center = [avgLat, avgLng];
      }

      // Initialiser la carte
      const map = L.map(mapContainerRef.current).setView(center, 13);

      // Ajouter la couche de tuiles selon la vue
      updateMapLayer(map, mapView);

      // Ajouter le contrôle des couches
      L.control.layers({
        'Plan': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap',
          maxZoom: 19,
        }),
        'Satellite': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: '© Esri',
          maxZoom: 19,
        }),
        'Topographique': L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
          attribution: 'OpenTopoMap',
          maxZoom: 17,
        }),
      }).addTo(map);

      setMapRef(map);
    }

    return () => {
      if (mapRef) {
        mapRef.remove();
        setMapRef(null);
      }
    };
  }, []);

  // Mettre à jour les marqueurs lorsque les problèmes changent
  useEffect(() => {
    if (!mapRef) return;

    // Supprimer les anciens marqueurs
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Ajouter les nouveaux marqueurs
    validProblems.forEach((problem, index) => {
      const marker = createMarker(problem, index);
      marker.addTo(mapRef);
      markersRef.current.push(marker);
    });

    // Ajuster la vue pour inclure tous les marqueurs
    if (validProblems.length > 0 && mapRef) {
      const bounds = L.latLngBounds(
        validProblems.map(p => [p.latitude, p.longitude])
      );
      mapRef.fitBounds(bounds, { 
        padding: [50, 50], 
        maxZoom: 15 
      });
    }
  }, [validProblems]);

  // Fonction pour créer un marqueur
  const createMarker = (problem: any, index: number) => {
    // Créer une icône personnalisée basée sur le statut
    const getIcon = () => {
      const status = problem.statut?.code || 'soumis';
      const color = getColorByStatus(status);
      
      const iconSize = status === 'en cours' ? 40 : 35;
      
      return L.divIcon({
        html: `
          <div class="custom-marker" style="
            position: relative;
            width: ${iconSize}px;
            height: ${iconSize}px;
            cursor: pointer;
          ">
            <div style="
              width: 100%;
              height: 100%;
              background: ${color};
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 5px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: ${iconSize * 0.4}px;
            ">
              ${index + 1}
            </div>
            ${
              status === 'en cours' 
                ? `<div class="pulse-animation" style="
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    width: 20px;
                    height: 20px;
                    background: ${color};
                    border: 3px solid white;
                    border-radius: 50%;
                  "></div>`
                : ''
            }
          </div>
        `,
        className: '',
        iconSize: [iconSize, iconSize],
        iconAnchor: [iconSize/2, iconSize/2],
      });
    };

    const marker = L.marker([problem.latitude, problem.longitude], {
      icon: getIcon(),
      title: problem.titre,
    });

    // Créer le contenu du popup
    const popupContent = createPopupContent(problem);
    
    marker.bindPopup(popupContent, {
      maxWidth: 300,
      minWidth: 200,
      className: 'custom-popup',
    });

    // Ajouter un événement de clic DIRECT sur le marqueur
    marker.on('click', () => {
      onProblemClick(problem);
    });

    return marker;
  };

  // Fonction pour créer le contenu du popup
  const createPopupContent = (problem: any) => {
    const status = problem.statut?.code || 'soumis';
    const color = getColorByStatus(status);
    const categoryColor = problem.categorie?.couleur || '#6b7280';
    const date = new Date(problem.create_at).toLocaleDateString('fr-FR');

    // Créer un contenu simple sans bouton qui déclenche des événements
    return `
      <div class="popup-content" style="padding: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
          <h3 style="margin: 0; font-size: 14px; font-weight: bold; color: #1f2937;">${problem.titre}</h3>
          <span style="
            background: ${color};
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;
          ">
            ${status.toUpperCase()}
          </span>
        </div>
        
        <div style="margin-bottom: 8px;">
          <span style="
            background: ${categoryColor};
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            display: inline-block;
            margin-bottom: 5px;
          ">
            ${problem.categorie?.libelle || 'Non catégorisé'}
          </span>
        </div>
        
        ${problem.description ? `
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280; line-height: 1.4;">
            ${problem.description.substring(0, 100)}${problem.description.length > 100 ? '...' : ''}
          </p>
        ` : ''}
        
        <div style="font-size: 11px; color: #9ca3af; margin-bottom: 10px;">
          <div>📍 ${problem.quartier || 'Localisation inconnue'}</div>
          <div>📅 ${date}</div>
        </div>
        
        <div style="text-align: center;">
          <em style="font-size: 11px; color: #6b7280;">Cliquez sur le marqueur pour voir les détails</em>
        </div>
      </div>
    `;
  };

  // Fonction utilitaire pour obtenir la couleur par statut
  const getColorByStatus = (status: string) => {
    switch(status) {
      case 'résolu': return '#10b981';
      case 'en cours': return '#f59e0b';
      case 'soumis': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  // Fonction pour mettre à jour la couche de la carte
  const updateMapLayer = (map: L.Map, view: 'street' | 'satellite' | 'topo') => {
    map.eachLayer((layer: any) => {
      if (layer._url) {
        map.removeLayer(layer);
      }
    });

    switch(view) {
      case 'street':
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap',
          maxZoom: 19,
        }).addTo(map);
        break;
      case 'satellite':
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: '© Esri',
          maxZoom: 19,
        }).addTo(map);
        break;
      case 'topo':
        L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
          attribution: 'OpenTopoMap',
          maxZoom: 17,
        }).addTo(map);
        break;
    }
  };

  // Fonction pour changer la vue de la carte
  const changeMapView = (view: 'street' | 'satellite' | 'topo') => {
    if (mapRef) {
      setMapView(view);
      updateMapLayer(mapRef, view);
    }
  };

  if (validProblems.length === 0) {
    return (
      <div className="h-96 flex flex-col items-center justify-center bg-gray-50 rounded-lg">
        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 mb-4">Aucun signalement géolocalisé</p>
      </div>
    );
  }

  return (
    <div className="relative h-96 rounded-lg overflow-hidden border border-gray-200">
      {/* Conteneur de la carte */}
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Contrôles de la carte */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => mapRef?.zoomIn()}
          className="bg-white w-10 h-10 rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
          title="Zoom avant"
        >
          <span className="text-xl font-bold text-gray-700">+</span>
        </button>
        <button
          onClick={() => mapRef?.zoomOut()}
          className="bg-white w-10 h-10 rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
          title="Zoom arrière"
        >
          <span className="text-xl font-bold text-gray-700">-</span>
        </button>
      </div>

      {/* Vue de la carte */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-gray-500" />
          <select
            value={mapView}
            onChange={(e) => changeMapView(e.target.value as any)}
            className="text-sm border-0 focus:ring-0"
          >
            <option value="street">Vue plan</option>
            <option value="satellite">Vue satellite</option>
            <option value="topo">Vue topographique</option>
          </select>
        </div>
      </div>

      {/* Légende */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 space-y-3 min-w-[200px]">
        <h4 className="text-gray-900 font-medium">Légende</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Soumis</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full relative">
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            </div>
            <span className="text-sm text-gray-700">En cours</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Résolu</span>
          </div>
        </div>
      </div>

      {/* Styles CSS pour les animations et popups */}
      <style>{`
        .leaflet-container {
          font-family: inherit;
          z-index: 1;
        }
        
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 8px;
          padding: 0;
        }
        
        .custom-popup .leaflet-popup-content {
          margin: 0;
          line-height: 1.4;
        }
        
        .custom-popup .leaflet-popup-tip {
          background: white;
        }
        
        .pulse-animation {
          animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.7;
          }
          100% {
            transform: scale(0.8);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}