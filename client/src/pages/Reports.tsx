import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

export default function Reports() {
  const { user, isAuthenticated } = useAuth();
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">
            Accès refusé
          </h1>
          <p className="text-muted-foreground">
            Vous devez être administrateur pour accéder aux rapports
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

  // Fetch reports for selected form
  const { data: reports = [], isLoading: reportsLoading } =
    trpc.reports.getByFormId.useQuery(
      { formId: selectedFormId || 0 },
      { enabled: !!selectedFormId }
    );

  const generateReportMutation = trpc.reports.generate.useMutation({
    onSuccess: () => {
      toast.success("Rapport généré avec succès !");
    },
    onError: (error) => {
      toast.error(`Erreur : ${error.message}`);
    },
  });

  const handleGenerateReport = async () => {
    if (!selectedFormId) {
      toast.error("Veuillez sélectionner un formulaire");
      return;
    }

    await generateReportMutation.mutateAsync({ formId: selectedFormId });
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
            <Link href="/dashboard">
              <Button className="px-4 py-2 bg-transparent border border-border text-foreground rounded-lg font-medium hover:bg-muted/50 transition-colors text-sm">
                Tableau de bord
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Rapports d'analyse
            </h1>
            <p className="text-muted-foreground">
              Générez et consultez les rapports d'interprétation des données
            </p>
          </div>

          {/* Form Selection */}
          <div className="bg-card rounded-lg border border-border shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-bold text-foreground">
              Sélectionner un formulaire
            </h2>

            {formsLoading ? (
              <p className="text-muted-foreground">Chargement des formulaires...</p>
            ) : forms.length === 0 ? (
              <p className="text-muted-foreground">Aucun formulaire créé</p>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {forms.map((form) => (
                    <button
                      key={form.id}
                      onClick={() => setSelectedFormId(form.id)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedFormId === form.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <h3 className="font-bold text-foreground">{form.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {form.sector}
                      </p>
                    </button>
                  ))}
                </div>

                {selectedFormId && (
                  <Button
                    onClick={handleGenerateReport}
                    disabled={generateReportMutation.isPending}
                    className="w-full px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {generateReportMutation.isPending
                      ? "Génération en cours..."
                      : "Générer un nouveau rapport"}
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Reports List */}
          {selectedFormId && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-foreground">
                Rapports générés
              </h2>

              {reportsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">
                    Chargement des rapports...
                  </p>
                </div>
              ) : reports.length === 0 ? (
                <div className="bg-card rounded-lg border border-border shadow-sm p-8 text-center">
                  <p className="text-muted-foreground">
                    Aucun rapport généré pour ce formulaire
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report: any) => (
                    <div
                      key={report.id}
                      className="bg-card rounded-lg border border-border shadow-sm p-6 space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-foreground">
                            {report.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Généré le{" "}
                            {new Date(report.createdAt).toLocaleString(
                              "fr-FR"
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Report Content */}
                      <div className="bg-muted/10 rounded-lg p-4 space-y-3">
                        <div className="prose prose-sm max-w-none">
                          <Streamdown>{report.content}</Streamdown>
                        </div>
                      </div>

                      {/* Trends and Anomalies */}
                      {report.trends && (
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-muted/10 rounded-lg p-4">
                            <h4 className="font-bold text-foreground mb-2">
                              Tendances
                            </h4>
                            <ul className="space-y-2 text-sm">
                              {JSON.parse(report.trends).map(
                                (trend: any, idx: number) => (
                                  <li key={idx} className="text-muted-foreground">
                                    <span className="font-medium text-foreground">
                                      {trend.field}
                                    </span>
                                    : Moyenne {trend.mean.toFixed(2)}, Écart-type{" "}
                                    {trend.stdDev.toFixed(2)}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>

                          <div className="bg-muted/10 rounded-lg p-4">
                            <h4 className="font-bold text-foreground mb-2">
                              Anomalies
                            </h4>
                            <ul className="space-y-2 text-sm">
                              {JSON.parse(report.anomalies).map(
                                (anomaly: any, idx: number) => (
                                  <li key={idx} className="text-muted-foreground">
                                    <span className="font-medium text-foreground">
                                      {anomaly.field}
                                    </span>
                                    : {anomaly.topValue} ({anomaly.topCount})
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
