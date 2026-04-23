import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useRoute } from "wouter";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "oklch(0.82 0.08 250)",
  "oklch(0.78 0.1 330)",
  "oklch(0.8 0.08 200)",
  "oklch(0.75 0.12 270)",
  "oklch(0.85 0.06 40)",
];

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
  const [newFormTitle, setNewFormTitle] = useState("");
  const [newFormSector, setNewFormSector] = useState("");

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">
            Accès refusé
          </h1>
          <p className="text-muted-foreground">
            Vous devez être administrateur pour accéder au tableau de bord
          </p>
          <Link href="/">
            <Button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Fetch forms
  const { data: forms = [], isLoading: formsLoading } =
    trpc.forms.listByCreator.useQuery();

  // Fetch analysis for selected form
  const { data: analysis, isLoading: analysisLoading } =
    trpc.forms.getAnalysis.useQuery(
      { formId: selectedFormId || 0 },
      { enabled: !!selectedFormId }
    );

  // Fetch submissions for selected form
  const { data: submissionsData, isLoading: submissionsLoading } =
    trpc.forms.getSubmissions.useQuery(
      { formId: selectedFormId || 0, limit: 100, offset: 0 },
      { enabled: !!selectedFormId }
    );

  const createFormMutation = trpc.forms.create.useMutation({
    onSuccess: () => {
      toast.success("Formulaire créé avec succès !");
      setNewFormTitle("");
      setNewFormSector("");
    },
    onError: (error) => {
      toast.error(`Erreur : ${error.message}`);
    },
  });

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFormTitle || !newFormSector) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    await createFormMutation.mutateAsync({
      title: newFormTitle,
      sector: newFormSector,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="container flex items-center justify-between py-4">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-primary"></div>
              <span className="text-xl font-bold text-foreground">DataFlow</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.name}</span>
            <Link href="/">
              <Button className="px-4 py-2 bg-transparent border border-border text-foreground rounded-lg font-medium hover:bg-muted/50 transition-colors text-sm">
                Déconnexion
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border border-border shadow-sm p-6 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-foreground mb-4">
                  Mes formulaires
                </h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {formsLoading ? (
                    <p className="text-sm text-muted-foreground">
                      Chargement...
                    </p>
                  ) : forms.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Aucun formulaire créé
                    </p>
                  ) : (
                    forms.map((form) => (
                      <button
                        key={form.id}
                        onClick={() => setSelectedFormId(form.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                          selectedFormId === form.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/30 text-foreground hover:bg-muted/50"
                        }`}
                      >
                        {form.title}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Create Form */}
              <div className="border-t border-border pt-6">
                <h3 className="text-sm font-bold text-foreground mb-4">
                  Créer un formulaire
                </h3>
                <form onSubmit={handleCreateForm} className="space-y-3">
                  <Input
                    placeholder="Titre du formulaire"
                    value={newFormTitle}
                    onChange={(e) => setNewFormTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                  />
                  <Input
                    placeholder="Secteur d'activité"
                    value={newFormSector}
                    onChange={(e) => setNewFormSector(e.target.value)}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                  />
                  <Button
                    type="submit"
                    disabled={createFormMutation.isPending}
                    className="w-full px-3 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
                  >
                    {createFormMutation.isPending
                      ? "Création..."
                      : "Créer"}
                  </Button>
                </form>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {!selectedFormId ? (
              <div className="bg-card rounded-lg border border-border shadow-sm p-12 text-center space-y-4">
                <h2 className="text-2xl font-bold text-foreground">
                  Sélectionnez un formulaire
                </h2>
                <p className="text-muted-foreground">
                  Choisissez un formulaire dans la liste de gauche pour voir les
                  analyses et les soumissions
                </p>
              </div>
            ) : analysisLoading || submissionsLoading ? (
              <div className="bg-card rounded-lg border border-border shadow-sm p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Chargement des données...</p>
              </div>
            ) : (
              <Tabs defaultValue="analysis" className="space-y-6">
                <TabsList className="bg-muted/30 border border-border rounded-lg p-1 inline-flex">
                  <TabsTrigger
                    value="analysis"
                    className="px-4 py-2 rounded-md text-sm font-medium transition-colors data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Analyse
                  </TabsTrigger>
                  <TabsTrigger
                    value="submissions"
                    className="px-4 py-2 rounded-md text-sm font-medium transition-colors data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Soumissions
                  </TabsTrigger>
                </TabsList>

                {/* Analysis Tab */}
                <TabsContent value="analysis" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {analysis &&
                      Object.entries(analysis).map(([fieldId, fieldData]: any) => (
                        <div
                          key={fieldId}
                          className="bg-card rounded-lg border border-border shadow-sm p-6"
                        >
                          <h3 className="text-lg font-bold text-foreground mb-4">
                            {fieldData.fieldLabel}
                          </h3>

                          {fieldData.stats ? (
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-muted/20 rounded-lg p-3">
                                  <p className="text-xs text-muted-foreground">
                                    Moyenne
                                  </p>
                                  <p className="text-lg font-bold text-foreground">
                                    {fieldData.stats.mean}
                                  </p>
                                </div>
                                <div className="bg-muted/20 rounded-lg p-3">
                                  <p className="text-xs text-muted-foreground">
                                    Médiane
                                  </p>
                                  <p className="text-lg font-bold text-foreground">
                                    {fieldData.stats.median}
                                  </p>
                                </div>
                                <div className="bg-muted/20 rounded-lg p-3">
                                  <p className="text-xs text-muted-foreground">
                                    Écart-type
                                  </p>
                                  <p className="text-lg font-bold text-foreground">
                                    {fieldData.stats.stdDev}
                                  </p>
                                </div>
                                <div className="bg-muted/20 rounded-lg p-3">
                                  <p className="text-xs text-muted-foreground">
                                    Plage
                                  </p>
                                  <p className="text-lg font-bold text-foreground">
                                    {fieldData.stats.min} - {fieldData.stats.max}
                                  </p>
                                </div>
                              </div>

                              {/* Histogram */}
                              <div className="mt-4">
                                <ResponsiveContainer width="100%" height={200}>
                                  <BarChart
                                    data={[
                                      {
                                        name: "Distribution",
                                        value: fieldData.stats.count,
                                      },
                                    ]}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="oklch(0.82 0.08 250)" />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          ) : fieldData.frequencies ? (
                            <div className="space-y-3">
                              {/* Frequency Table */}
                              <div className="space-y-2">
                                {fieldData.frequencies.map(
                                  (freq: any, idx: number) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between"
                                    >
                                      <span className="text-sm text-foreground">
                                        {freq.value}
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <div className="w-24 bg-muted/30 rounded-full h-2 overflow-hidden">
                                          <div
                                            className="bg-primary h-full"
                                            style={{
                                              width: `${freq.percentage}%`,
                                            }}
                                          ></div>
                                        </div>
                                        <span className="text-xs text-muted-foreground w-12 text-right">
                                          {freq.percentage}%
                                        </span>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>

                              {/* Pie Chart */}
                              <div className="mt-4">
                                <ResponsiveContainer width="100%" height={200}>
                                  <PieChart>
                                    <Pie
                                      data={fieldData.frequencies}
                                      dataKey="count"
                                      nameKey="value"
                                      cx="50%"
                                      cy="50%"
                                      outerRadius={60}
                                    >
                                      {fieldData.frequencies.map(
                                        (_: any, idx: number) => (
                                          <Cell
                                            key={`cell-${idx}`}
                                            fill={COLORS[idx % COLORS.length] || "oklch(0.82 0.08 250)"}
                                          />
                                        )
                                      )}
                                    </Pie>
                                    <Tooltip />
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ))}
                  </div>
                </TabsContent>

                {/* Submissions Tab */}
                <TabsContent value="submissions" className="space-y-6">
                  <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-border">
                      <h3 className="text-lg font-bold text-foreground">
                        Soumissions ({(submissionsData as any)?.total || 0})
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/20 border-b border-border">
                          <tr>
                            <th className="px-6 py-3 text-left font-bold text-foreground">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left font-bold text-foreground">
                              Réponses
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {(submissionsData as any)?.submissions?.map((submission: any) => (
                            <tr
                              key={submission.id}
                              className="border-b border-border hover:bg-muted/10 transition-colors"
                            >
                              <td className="px-6 py-3 text-muted-foreground">
                                {new Date(
                                  submission.submittedAt
                                ).toLocaleString("fr-FR")}
                              </td>
                              <td className="px-6 py-3">
                                <span className="text-sm text-foreground">
                                  {submission.responses?.length || 0} champs
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
