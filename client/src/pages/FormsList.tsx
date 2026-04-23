import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function FormsList() {
  const { user, isAuthenticated } = useAuth();
  const { data: forms = [], isLoading } = trpc.forms.listPublic.useQuery();

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
            {isAuthenticated && user?.role === "admin" && (
              <Link href="/dashboard">
                <Button className="px-4 py-2 bg-transparent border border-border text-foreground rounded-lg font-medium hover:bg-muted/50 transition-colors text-sm">
                  Tableau de bord
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="container py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-foreground">
              Formulaires de Surveillance Épidémiologique
            </h1>
            <p className="text-lg text-muted-foreground">
              Participez à la surveillance de la santé publique en remplissant nos formulaires de collecte de données sanitaires
            </p>
          </div>

          {/* Info Banner */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
            <p className="text-sm text-foreground">
              <strong>Surveillance Épidémiologique:</strong> Vos données contribuent à la détection des tendances des maladies infectieuses et à la protection de la santé publique. Tous les formulaires ci-dessous collectent des informations démographiques et sanitaires essentielles.
            </p>
          </div>

          {/* Forms Grid */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : forms.length === 0 ? (
            <div className="bg-card rounded-lg border border-border shadow-sm p-12 text-center space-y-4">
              <h2 className="text-xl font-bold text-foreground">
                Aucun formulaire disponible
              </h2>
              <p className="text-muted-foreground">
                Les formulaires seront disponibles bientôt
              </p>
              <Link href="/">
                <Button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
                  Retour à l'accueil
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {forms.map((form: any) => (
                <Link key={form.id} href={`/forms/${form.id}`}>
                  <div className="bg-card rounded-lg border border-border shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <div className="w-6 h-6 rounded bg-primary"></div>
                      </div>
                      <h3 className="text-lg font-bold text-foreground">
                        {form.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {form.description}
                      </p>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-border">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Secteur :</span>
                        <span className="font-medium text-foreground">
                          {form.sector}
                        </span>
                      </div>
                      {form.submissionCount !== undefined && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Soumissions :
                          </span>
                          <span className="font-medium text-foreground">
                            {form.submissionCount}
                          </span>
                        </div>
                      )}
                      <Button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
                        Répondre au formulaire
                      </Button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
