import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { toast } from "sonner";

export default function CsvImport() {
  const { user, isAuthenticated } = useAuth();
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">
            Accès refusé
          </h1>
          <p className="text-muted-foreground">
            Vous devez être administrateur pour importer des données
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

  // Fetch import history
  const { data: imports = [], isLoading: importsLoading } =
    trpc.csv.getImports.useQuery(
      { formId: selectedFormId || 0 },
      { enabled: !!selectedFormId }
    );

  const importMutation = trpc.csv.import.useMutation({
    onSuccess: (result) => {
      toast.success(result.message);
      setFile(null);
    },
    onError: (error) => {
      toast.error(`Erreur : ${error.message}`);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".csv")) {
        toast.error("Veuillez sélectionner un fichier CSV");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!selectedFormId || !file) {
      toast.error("Veuillez sélectionner un formulaire et un fichier");
      return;
    }

    setIsUploading(true);

    try {
      // Read file as text
      const fileContent = await file.text();

      // In a real application, you would upload the file to storage first
      // For now, we'll pass the content directly
      await importMutation.mutateAsync({
        formId: selectedFormId,
        fileUrl: `data:text/csv;base64,${btoa(fileContent)}`,
        fileName: file.name,
      });
    } catch (error) {
      toast.error("Erreur lors de la lecture du fichier");
    } finally {
      setIsUploading(false);
    }
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
              Importer des données CSV
            </h1>
            <p className="text-muted-foreground">
              Importez des données existantes depuis un fichier CSV
            </p>
          </div>

          {/* Form Selection */}
          <div className="bg-card rounded-lg border border-border shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-bold text-foreground">
              Étape 1 : Sélectionner un formulaire
            </h2>

            {formsLoading ? (
              <p className="text-muted-foreground">Chargement des formulaires...</p>
            ) : forms.length === 0 ? (
              <p className="text-muted-foreground">Aucun formulaire créé</p>
            ) : (
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
            )}
          </div>

          {/* File Upload */}
          {selectedFormId && (
            <div className="bg-card rounded-lg border border-border shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-bold text-foreground">
                Étape 2 : Sélectionner un fichier CSV
              </h2>

              <div className="space-y-3">
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />

                {file && (
                  <div className="bg-muted/10 rounded-lg p-4">
                    <p className="text-sm font-medium text-foreground">
                      Fichier sélectionné : {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Taille : {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleImport}
                  disabled={!file || isUploading || importMutation.isPending}
                  className="w-full px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isUploading || importMutation.isPending
                    ? "Import en cours..."
                    : "Importer les données"}
                </Button>
              </div>
            </div>
          )}

          {/* Import History */}
          {selectedFormId && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-foreground">
                Historique des imports
              </h2>

              {importsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">
                    Chargement de l'historique...
                  </p>
                </div>
              ) : imports.length === 0 ? (
                <div className="bg-card rounded-lg border border-border shadow-sm p-8 text-center">
                  <p className="text-muted-foreground">
                    Aucun import pour ce formulaire
                  </p>
                </div>
              ) : (
                <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/20 border-b border-border">
                      <tr>
                        <th className="px-6 py-3 text-left font-bold text-foreground">
                          Fichier
                        </th>
                        <th className="px-6 py-3 text-left font-bold text-foreground">
                          Lignes
                        </th>
                        <th className="px-6 py-3 text-left font-bold text-foreground">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(imports as any[]).map((imp) => (
                        <tr
                          key={imp.id}
                          className="border-b border-border hover:bg-muted/10 transition-colors"
                        >
                          <td className="px-6 py-3 font-medium text-foreground">
                            {imp.fileName}
                          </td>
                          <td className="px-6 py-3 text-muted-foreground">
                            {imp.rowCount}
                          </td>
                          <td className="px-6 py-3 text-muted-foreground">
                            {new Date(imp.createdAt).toLocaleString("fr-FR")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
