import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Clock, MapPin, Award } from 'lucide-react';

interface ReportsAnalyticsProps {
  supabase: any;
  user: any;
}

export function ReportsAnalytics({ supabase, user }: ReportsAnalyticsProps) {
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Charger tous les problèmes avec leurs relations
      const { data: problemsData, error } = await supabase
        .from('problemes')
        .select(`
          *,
          statut:statut_pb(id, code, ordre),
          categorie:categorie_pb(id, libelle, couleur),
          utilisateur_affecte:utilisateur(id, nom, email, departement:departement(id, nom))
        `)
        .order('create_at', { ascending: false });

      if (error) throw error;

      setProblems(problemsData || []);
      calculateStats(problemsData || []);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (problemsData: any[]) => {
    // Problèmes par catégorie
    const categoryStats: any = {};
    problemsData.forEach((p) => {
      const cat = p.categorie?.libelle || 'Non catégorisé';
      categoryStats[cat] = (categoryStats[cat] || 0) + 1;
    });

    const categoryData = Object.entries(categoryStats).map(([name, value]) => ({
      name,
      value,
    }));

    // Problèmes par quartier
    const quarterStats: any = {};
    problemsData.forEach((p) => {
      const quarter = p.quartier || 'Non spécifié';
      quarterStats[quarter] = (quarterStats[quarter] || 0) + 1;
    });

    const quarterData = Object.entries(quarterStats)
      .map(([name, value]) => ({ name, value }))
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 10);

    // Problèmes par statut
    const statusStats: any = {};
    problemsData.forEach((p) => {
      const status = p.statut?.code || 'inconnu';
      statusStats[status] = (statusStats[status] || 0) + 1;
    });

    const statusData = Object.entries(statusStats).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));

    // Tendance temporelle (30 derniers jours)
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const dailyStats: any = {};
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyStats[dateStr] = 0;
    }

    problemsData
      .filter((p) => new Date(p.create_at) >= last30Days)
      .forEach((p) => {
        const dateStr = p.create_at.split('T')[0];
        if (dailyStats[dateStr] !== undefined) {
          dailyStats[dateStr]++;
        }
      });

    const trendData = Object.entries(dailyStats)
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        count,
      }))
      .reverse();

    // Temps moyen de résolution
    const resolvedProblems = problemsData.filter((p) => 
      p.statut?.code === 'résolu'
    );
    let avgResolutionTime = 0;

    if (resolvedProblems.length > 0) {
      const totalTime = resolvedProblems.reduce((sum, p) => {
        const created = new Date(p.create_at).getTime();
        const updated = new Date(p.updated_at || p.create_at).getTime();
        return sum + (updated - created);
      }, 0);

      avgResolutionTime = totalTime / resolvedProblems.length / (1000 * 60 * 60 * 24); // En jours
    }

    // Performance par département
    const deptStats: any = {};
    problemsData
      .filter((p) => p.utilisateur_affecte?.departement)
      .forEach((p) => {
        const dept = p.utilisateur_affecte.departement.nom;
        if (!deptStats[dept]) {
          deptStats[dept] = { total: 0, resolved: 0 };
        }
        deptStats[dept].total++;
        if (p.statut?.code === 'résolu') {
          deptStats[dept].resolved++;
        }
      });

    const departmentData = Object.entries(deptStats).map(([name, stats]: [string, any]) => ({
      name,
      total: stats.total,
      resolved: stats.resolved,
      rate: stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0,
    }));

    setStats({
      categoryData,
      quarterData,
      statusData,
      trendData,
      avgResolutionTime,
      departmentData,
      totalProblems: problemsData.length,
      resolvedProblems: resolvedProblems.length,
      resolutionRate: problemsData.length > 0 ? Math.round((resolvedProblems.length / problemsData.length) * 100) : 0,
    });
  };

  // Composants Shimmer pour ReportsAnalytics
  const KpiCardShimmer = () => (
    <div className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
    </div>
  );

  const ChartShimmer = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
      <div className="h-64 bg-gray-200 rounded"></div>
    </div>
  );

  const DepartmentShimmer = () => (
    <div className="p-4 bg-gray-100 rounded-lg animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="flex justify-between items-center mb-2">
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        <div className="h-3 bg-gray-200 rounded w-8"></div>
      </div>
      <div className="h-2 bg-gray-200 rounded w-full"></div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* KPIs Shimmer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCardShimmer />
          <KpiCardShimmer />
          <KpiCardShimmer />
          <KpiCardShimmer />
        </div>

        {/* Graphiques Shimmer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartShimmer />
          <ChartShimmer />
          <ChartShimmer />
          <ChartShimmer />
        </div>

        {/* Performance par département Shimmer */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DepartmentShimmer />
            <DepartmentShimmer />
            <DepartmentShimmer />
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-gray-600 mb-1">Total Signalements</p>
          <p className="text-gray-900">{stats.totalProblems}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-gray-600 mb-1">Taux de Résolution</p>
          <p className="text-gray-900">{stats.resolutionRate}%</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-gray-600 mb-1">Temps Moyen Résolution</p>
          <p className="text-gray-900">{stats.avgResolutionTime.toFixed(1)} jours</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-gray-600 mb-1">Zones Affectées</p>
          <p className="text-gray-900">{stats.quarterData.length}</p>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Problèmes par catégorie */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-gray-900 mb-6">Problèmes par Catégorie</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.categoryData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Problèmes par statut */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-gray-900 mb-6">Répartition par Statut</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Zones les plus affectées */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-gray-900 mb-6">Top 10 Zones Affectées</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.quarterData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tendance temporelle */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-gray-900 mb-6">Évolution (30 derniers jours)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance par département */}
      {stats.departmentData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-gray-900 mb-6">Performance par Département</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.departmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#3b82f6" name="Total" />
              <Bar dataKey="resolved" fill="#10b981" name="Résolus" />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.departmentData.map((dept: any, index: number) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-900 mb-2">{dept.name}</p>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Taux de résolution:</span>
                  <span className="text-gray-900">{dept.rate}%</span>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${dept.rate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}