import { useState, useEffect, useRef } from 'react';
import { Send, Clock, CheckCircle, MapPin, Users, TrendingUp } from 'lucide-react';
import { ProblemsMap } from './ProblemsMap';
import { ProblemsList } from './ProblemsList';
import { ProblemDetailsModal } from './ProblemDetailsModal';

interface DashboardOverviewProps {
  supabase: any;
  user: any;
}

export function DashboardOverview({ supabase, user }: DashboardOverviewProps) {
  const [problems, setProblems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProblem, setSelectedProblem] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [mapRef, setMapRef] = useState<any>(null);

  useEffect(() => {
    loadData();
    subscribeToChanges();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Charger les problèmes avec leurs relations
      const { data: problemsData, error: problemsError } = await supabase
        .from('problemes')
        .select(`
          *,
          statut:statut_pb(id, code, ordre),
          categorie:categorie_pb(id, libelle, couleur, ordre),
          utilisateur_affecte:utilisateur(id, nom, email, departement:departement(id, nom)),
          media:media_url(id, url, type)
        `)
        .order('create_at', { ascending: false });

      if (problemsError) throw problemsError;

      // Charger les catégories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categorie_pb')
        .select('*')
        .order('ordre');

      if (categoriesError) throw categoriesError;

      // Charger les statuts
      const { data: statusesData, error: statusesError } = await supabase
        .from('statut_pb')
        .select('*')
        .order('ordre');

      if (statusesError) throw statusesError;

      // Charger les départements
      const { data: departmentsData, error: departmentsError } = await supabase
        .from('departement')
        .select('*');

      if (departmentsError) throw departmentsError;

      setProblems(problemsData || []);
      setCategories(categoriesData || []);
      setStatuses(statusesData || []);
      setDepartments(departmentsData || []);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToChanges = () => {
    const channel = supabase
      .channel('problems-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'problemes' },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const filteredProblems = problems.filter((problem) => {
    const statusMatch = filterStatus === 'all' || problem.statut?.code === filterStatus;
    const categoryMatch = filterCategory === 'all' || problem.id_categorie === filterCategory;
    return statusMatch && categoryMatch;
  });

  // Statistiques
  const stats = {
    total: problems.length,
    pending: problems.filter(p => p.statut?.code === 'soumis').length,
    inProgress: problems.filter(p => p.statut?.code === 'en cours').length,
    resolved: problems.filter(p => p.statut?.code === 'résolu').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-1">Total Signalements</p>
          <p className="text-gray-900">{stats.total}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-gray-600 mb-1">En cours</p>
          <p className="text-gray-900">{stats.inProgress}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Send className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-gray-600 mb-1">Soumis</p>
          <p className="text-gray-900">{stats.pending}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-gray-600 mb-1">Résolus</p>
          <p className="text-gray-900">{stats.resolved}</p>
        </div>
      </div>

      {/* Carte et Liste */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Carte */}
         
        {/* Carte */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-gray-900">Carte des signalements</h2>
            <p className="text-gray-600 text-sm mt-1">
              {filteredProblems.length} signalement(s) géolocalisé(s)
            </p>
          </div>
          <ProblemsMap 
            mapRef={mapRef} 
            setMapRef={setMapRef} 
            problems={filteredProblems} 
            onProblemClick={setSelectedProblem} 
          />
        </div>

        {/* Liste */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-gray-900 mb-4">Signalements récents</h2>
            
            {/* Filtres */}
            <div className="flex flex-wrap gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                {statuses.map((status) => (
                  <option key={status.id} value={status.code}>
                    {status.code.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Toutes les catégories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.libelle}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <ProblemsList
            problems={filteredProblems}
            onProblemClick={setSelectedProblem}
          />
        </div>
      </div>

      {/* Modal de détails */}
      {selectedProblem && (
        <ProblemDetailsModal
          problem={selectedProblem}
          supabase={supabase}
          user={user}
          categories={categories}
          statuses={statuses}
          departments={departments}
          onClose={() => setSelectedProblem(null)}
          onUpdate={loadData}
        />
      )}
    </div>
  );
}