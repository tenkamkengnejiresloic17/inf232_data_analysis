import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { trpc } from "@/lib/trpc";
import { useRoute } from "wouter";
import { Loader2 } from "lucide-react";

export default function DemographicComparison() {
  const { user, isAuthenticated } = useAuth();
  const [, params] = useRoute("/demographic-comparison/:formId");
  const formId = params?.formId ? parseInt(params.formId, 10) : null;
  const [groupBy, setGroupBy] = useState<"age" | "sex">("age");

  const { data: comparisonData, isLoading, error } = trpc.forms.getDemographicComparison.useQuery(
    { formId: formId || 0, groupBy },
    { enabled: !!formId && isAuthenticated }
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentification requise</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">Veuillez vous connecter pour accéder à cette page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!formId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Formulaire non trouvé</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">Le formulaire spécifié n'existe pas.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          <p className="text-slate-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error || !comparisonData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Erreur</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600">Erreur lors du chargement des données de comparaison.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare data for visualization
  const groups = Object.entries((comparisonData as any)?.data || {});
  const diseases = groups.length > 0 ? Object.keys((groups[0][1] as any)?.diseases || {}) : [];

  // Prepare chart data for each disease
  const chartDataByDisease = diseases.map((disease) => {
    const data: Record<string, any> = { name: disease };
    for (const [groupName, groupData] of groups) {
      data[groupName] = (groupData as any)?.diseases?.[disease]?.percentage || 0;
    }
    return data;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 mb-2">Comparaison Démographique</h1>
          <p className="text-slate-600">Analysez les tendances des maladies par groupe démographique</p>
        </div>

        {/* Controls */}
        <Card className="mb-8 border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Paramètres de comparaison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Grouper par
                </label>
                <Select value={groupBy} onValueChange={(value: any) => setGroupBy(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="age">Groupe d'âge</SelectItem>
                    <SelectItem value="sex">Sexe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {groups.map(([groupName, groupData]) => (
            <Card key={groupName} className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">{groupName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-teal-600">{(groupData as any)?.submissionCount || 0}</div>
                <p className="text-xs text-slate-500 mt-1">soumissions</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Disease Comparison Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bar Chart - Prevalence by Disease */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Prévalence des maladies par groupe</CardTitle>
              <CardDescription>Pourcentage de cas positifs (%)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartDataByDisease}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis label={{ value: "Prévalence (%)", angle: -90, position: "insideLeft" }} />
                  <Tooltip formatter={(value: any) => `${typeof value === 'number' ? value.toFixed(1) : value}%`} />
                  <Legend />
                  {groups.map(([groupName], index: number) => (
                    <Bar
                      key={groupName}
                      dataKey={groupName}
                      fill={["#14b8a6", "#ec4899", "#f59e0b", "#8b5cf6"][index % 4]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Detailed Comparison Table */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Détails par groupe</CardTitle>
              <CardDescription>Nombre de cas et pourcentage</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-2 font-semibold text-slate-900">Maladie</th>
                      {groups.map(([groupName]: [string, any]) => (
                        <th key={groupName} className="text-center py-2 px-2 font-semibold text-slate-900">
                          {groupName}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {diseases.map((disease: string) => (
                    <tr key={disease} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-2 font-medium text-slate-700">{disease}</td>
                      {groups.map(([groupName, groupData]: [string, any]) => {
                        const diseaseData = (groupData as any)?.diseases?.[disease];
                        return (
                          <td key={groupName} className="text-center py-3 px-2">
                            <div className="text-sm font-semibold text-slate-900">
                              {diseaseData?.count || 0}
                            </div>
                            <div className="text-xs text-slate-500">
                              {diseaseData?.percentage.toFixed(1) || 0}%
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Risk Indicators */}
        <Card className="mt-8 border-slate-200">
          <CardHeader>
            <CardTitle>Groupes à risque identifiés</CardTitle>
            <CardDescription>Populations avec prévalence élevée</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {groups.map(([groupName, groupData]: [string, any]) => {
                const highRiskDiseases = Object.entries((groupData as any)?.diseases || {})
                  .filter(([_, data]: [string, any]) => (data as any)?.percentage > 30)
                  .sort((a: any, b: any) => (b[1] as any)?.percentage - (a[1] as any)?.percentage);

                if (highRiskDiseases.length === 0) {
                  return (
                    <div key={groupName} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-medium text-green-900">
                        {groupName}: Aucun risque élevé détecté
                      </p>
                    </div>
                  );
                }

                return (
                  <div key={groupName} className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm font-medium text-amber-900 mb-2">{groupName}:</p>
                    <ul className="space-y-1">
                      {highRiskDiseases.map(([disease, data]: [string, any]) => (
                        <li key={disease} className="text-sm text-amber-800">
                          • {disease}: {(data as any)?.percentage.toFixed(1)}% ({(data as any)?.count} cas)
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
