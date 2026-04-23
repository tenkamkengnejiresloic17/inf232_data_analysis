import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  const features = [
    {
      title: "Formulaires configurables",
      description:
        "Créez des formulaires personnalisés avec des champs adaptés à votre secteur d'activité",
      icon: "📋",
      href: isAuthenticated && user?.role === "admin" ? "/dashboard" : "/forms",
    },
    {
      title: "Analyse descriptive",
      description:
        "Obtenez automatiquement moyenne, médiane, écart-type et statistiques complètes",
      icon: "📊",
      href: isAuthenticated ? "/dashboard" : getLoginUrl(),
    },
    {
      title: "Visualisations interactives",
      description:
        "Explorez vos données avec des graphiques : histogrammes, boîtes à moustaches, camemberts",
      icon: "📈",
      href: isAuthenticated ? "/dashboard" : getLoginUrl(),
    },
    {
      title: "Rapports intelligents",
      description:
        "Générez des rapports automatiques avec interprétation par IA des tendances",
      icon: "🤖",
      href: isAuthenticated && user?.role === "admin" ? "/reports" : getLoginUrl(),
    },
    {
      title: "Import CSV",
      description:
        "Importez vos données existantes et analysez-les directement dans la plateforme",
      icon: "📥",
      href: isAuthenticated && user?.role === "admin" ? "/csv-import" : getLoginUrl(),
    },
    {
      title: "Gestion des rôles",
      description:
        "Contrôlez qui peut créer des formulaires et qui peut soumettre des données",
      icon: "🔐",
      href: isAuthenticated && user?.role === "admin" ? "/dashboard" : getLoginUrl(),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary"></div>
            <span className="text-xl font-bold text-foreground">DataFlow</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground">
                  {user?.name || "User"}
                </span>
                <Link href="/dashboard">
                  <Button className="bg-primary text-primary-foreground hover:opacity-90">
                    Dashboard
                  </Button>
                </Link>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button className="bg-primary text-primary-foreground hover:opacity-90">
                  Sign In
                </Button>
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        {/* Geometric shapes */}
        <div className="absolute w-96 h-96 -top-48 -right-48 rounded-full bg-primary opacity-10 pointer-events-none"></div>
        <div className="absolute w-72 h-72 -bottom-32 -left-32 rounded-full bg-secondary opacity-10 pointer-events-none"></div>

        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-5xl sm:text-6xl font-bold text-foreground leading-tight">
              Collectez et analysez vos données
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Une plateforme minimaliste et puissante pour collecter des données en ligne,
              les analyser avec des statistiques descriptives et générer des rapports intelligents.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              {isAuthenticated ? (
                <>
                  <Link href="/forms">
                    <Button className="px-6 py-2 bg-transparent border border-border text-foreground rounded-lg font-medium hover:bg-muted/50 transition-colors">
                      Voir les formulaires
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button className="px-6 py-2 bg-transparent border border-border text-foreground rounded-lg font-medium hover:bg-muted/50 transition-colors w-full sm:w-auto">
                      Accéder au tableau de bord
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <a href={getLoginUrl()}>
                    <Button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity w-full sm:w-auto">
                      Commencer maintenant
                    </Button>
                  </a>
                  <a href="#features">
                    <Button className="px-6 py-2 bg-transparent border border-border text-foreground rounded-lg font-medium hover:bg-muted/50 transition-colors w-full sm:w-auto">
                      En savoir plus
                    </Button>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-32 bg-card border-t border-border">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Fonctionnalités principales
            </h2>
            <p className="text-lg text-muted-foreground">
              Tout ce dont vous avez besoin pour gérer vos données efficacement
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <Link key={idx} href={feature.href}>
                <div className="bg-card rounded-lg border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all p-8 space-y-4 cursor-pointer">
                  <div className="text-4xl">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32 bg-background">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <h2 className="text-4xl font-bold text-foreground">
              Prêt à commencer ?
            </h2>
            <p className="text-lg text-muted-foreground">
              Rejoignez notre plateforme et commencez à collecter et analyser vos données dès aujourd'hui.
            </p>
            {!isAuthenticated && (
              <a href={getLoginUrl()}>
                <Button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
                  Se connecter maintenant
                </Button>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            DataFlow © 2026 - Plateforme de collecte et d'analyse de données pour INF 232 EC2
          </p>
        </div>
      </footer>
    </div>
  );
}
