import { useState, useEffect } from 'react';
import { X, MapPin, Calendar, User, MessageSquare, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ProblemDetailsModalProps {
  problem: any;
  supabase: any;
  user: any;
  categories: any[];
  statuses: any[];
  departments: any[];
  onClose: () => void;
  onUpdate: () => void;
}

export function ProblemDetailsModal({
  problem,
  supabase,
  user,
  categories,
  statuses,
  departments,
  onClose,
  onUpdate,
}: ProblemDetailsModalProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    id_statut: problem.id_statut || '',
    id_utilisateur_affecte: problem.id_utilisateur_affecte || '',
    id_categorie: problem.id_categorie || '',
  });
  const [comment, setComment] = useState('');
  const [agents, setAgents] = useState<any[]>([]);

  const loadAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('utilisateur')
        .select('id, nom, email, role, departement:departement(id, nom)')
        .in('role', ['admin', 'agent_municipal']);

      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des agents:', error);
    }
  };

  // Charger les agents au montage
  useEffect(() => {
    loadAgents();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);

      // Vérifier les changements pour les notifications
      const statusChanged = formData.id_statut && formData.id_statut !== problem.id_statut;
      const assignedChanged = formData.id_utilisateur_affecte && formData.id_utilisateur_affecte !== problem.id_utilisateur_affecte;

      // Mettre à jour le problème
      const updateData: any = {
        id_statut: formData.id_statut || null,
        id_categorie: formData.id_categorie || null,
        id_utilisateur_affecte: formData.id_utilisateur_affecte || null,
        updated_at: new Date().toISOString(),
      };

      // Si on assigne à quelqu'un, mettre à jour la date d'assignation
      if (formData.id_utilisateur_affecte && formData.id_utilisateur_affecte !== problem.id_utilisateur_affecte) {
        updateData.current_assigned_at = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from('problemes')
        .update(updateData)
        .eq('id', problem.id);

      if (updateError) throw updateError;

      // Envoyer des notifications en temps réel via le serveur
      if (statusChanged) {
        try {
          await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cf7452f1/notify-problem-change`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              problem_id: problem.id,
              change_type: 'status_changed',
              changed_by_id: user.id,
            }),
          });
        } catch (notifError) {
          console.error('Erreur lors de l\'envoi des notifications de changement de statut:', notifError);
        }
      }

      if (assignedChanged) {
        try {
          await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cf7452f1/notify-problem-change`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              problem_id: problem.id,
              change_type: 'assigned',
              changed_by_id: user.id,
            }),
          });
        } catch (notifError) {
          console.error('Erreur lors de l\'envoi des notifications d\'assignation:', notifError);
        }
      }

      toast.success('Signalement mis à jour avec succès');
      setEditing(false);
      onUpdate();
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('fr-FR');
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

  const statusBadge = getStatusBadge(problem.statut);

  return (
    <div className="fixed inset-0  bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-gray-900">{problem.titre}</h2>
              <span className={`px-3 py-1 rounded-full ${statusBadge.color}`}>
                {statusBadge.label}
              </span>
            </div>
            <p className="text-gray-600">ID: {problem.id.substring(0, 8)}...</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Image */}
          {problem.media?.url && (
            <div className="rounded-lg overflow-hidden">
              <img
                src={problem.media.url}
                alt={problem.titre}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          {/* Description */}
          {problem.description && (
            <div>
              <h3 className="text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{problem.description}</p>
            </div>
          )}

          {/* Informations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-gray-600">Localisation</p>
                <p className="text-gray-900">
                  {problem.quartier || 'Non spécifié'}
                </p>
                {problem.latitude && problem.longitude && (
                  <p className="text-gray-600">
                    {problem.latitude.toFixed(6)}, {problem.longitude.toFixed(6)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-gray-600">Date de création</p>
                <p className="text-gray-900">{formatDate(problem.create_at)}</p>
              </div>
            </div>

            {problem.categorie && (
              <div className="flex items-start gap-3">
                <div
                  className="w-5 h-5 rounded mt-0.5"
                  style={{ backgroundColor: problem.categorie.couleur || '#e5e7eb' }}
                ></div>
                <div>
                  <p className="text-gray-600">Catégorie</p>
                  <p className="text-gray-900">{problem.categorie.libelle}</p>
                </div>
              </div>
            )}

            {problem.utilisateur_affecte && (
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-600"> Emis Par </p>
                  <p className="text-gray-900">
                    {problem.utilisateur_affecte.nom || problem.utilisateur_affecte.email}
                  </p>
                  {problem.utilisateur_affecte.departement && (
                    <p className="text-gray-600">
                      {problem.utilisateur_affecte.departement.nom}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Formulaire d'édition */}
          {editing ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
              <h3 className="text-gray-900 mb-3">Modifier le signalement</h3>

              <div>
                <label className="block text-gray-700 mb-2">Statut</label>
                <select
                  value={formData.id_statut}
                  onChange={(e) => setFormData({ ...formData, id_statut: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un statut</option>
                  {statuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.code.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Catégorie</label>
                <select
                  value={formData.id_categorie}
                  onChange={(e) => setFormData({ ...formData, id_categorie: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.libelle}
                    </option>
                  ))}
                </select>
              </div>
                {/*
              <div>
                <label className="block text-gray-700 mb-2">Assigner à</label>
                <select
                  value={formData.id_utilisateur_affecte}
                  onChange={(e) => setFormData({ ...formData, id_utilisateur_affecte: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Non assigné</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.nom || agent.email}
                      {agent.departement ? ` - ${agent.departement.nom}` : ''}
                    </option>
                  ))}
                </select>
              </div>
                */ }
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Traiter le signalement
            </button>
          )}
        </div>
      </div>
    </div>
  );
}