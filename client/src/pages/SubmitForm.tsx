import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link } from "wouter";

export default function SubmitForm() {
  const [match, params] = useRoute("/forms/:formId");
  const formId = params?.formId ? parseInt(params.formId) : null;

  const [formData, setFormData] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: form, isLoading } = trpc.forms.getById.useQuery(
    { formId: formId || 0 },
    { enabled: !!formId }
  );

  const submitMutation = trpc.forms.submit.useMutation({
    onSuccess: () => {
      toast.success("Formulaire soumis avec succès !");
      setFormData({});
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    },
    onError: (error) => {
      toast.error(`Erreur : ${error.message}`);
    },
  });

  const handleFieldChange = (fieldId: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    // Validate required fields
    const missingRequired = form.fields
      .filter((f) => f.isRequired)
      .some((f) => !formData[f.id]);

    if (missingRequired) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsSubmitting(true);
    const responses = form.fields.map((field) => ({
      fieldId: field.id,
      value: formData[field.id] || "",
    }));

    await submitMutation.mutateAsync({
      formId: form.id,
      responses,
    });
    setIsSubmitting(false);
  };

  if (!formId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">
            Formulaire non trouvé
          </h1>
          <Link href="/">
            <Button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">Retour à l'accueil</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du formulaire...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">
            Formulaire non disponible
          </h1>
          <Link href="/">
            <Button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">Retour à l'accueil</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="container flex items-center justify-between py-4">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-primary"></div>
              <span className="text-xl font-bold text-foreground">DataFlow</span>
            </div>
          </Link>
        </div>
      </nav>

      {/* Form Container */}
      <div className="container py-12 sm:py-16 max-w-2xl">
        <div className="bg-card rounded-lg border border-border shadow-sm p-8 sm:p-12">
          {/* Form Header */}
          <div className="mb-8 space-y-2">
            <h1 className="text-3xl font-bold text-foreground">{form.title}</h1>
            {form.description && (
              <p className="text-muted-foreground">{form.description}</p>
            )}
            <p className="text-sm text-muted-foreground pt-2">
              Secteur : <span className="font-medium">{form.sector}</span>
            </p>
          </div>

          {/* Info Banner */}
          <div className="mb-8 bg-primary/10 border border-primary/20 rounded-lg p-4">
            <p className="text-sm text-foreground">
              <strong>Surveillance Epidemiologique:</strong> Vos donnees contribuent a la surveillance de la sante publique et a la detection des tendances des maladies infectieuses. Tous les champs marques d'un * sont obligatoires.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {form.fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={`field-${field.id}`} className="font-medium">
                  {field.label}
                  {field.isRequired && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </Label>

                {field.fieldType === "text" && (
                  <Input
                    id={`field-${field.id}`}
                    type="text"
                    placeholder={`Entrez ${field.label.toLowerCase()}`}
                    value={formData[field.id] || ""}
                    onChange={(e) =>
                      handleFieldChange(field.id, e.target.value)
                    }
                    required={field.isRequired}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                )}

                {field.fieldType === "number" && (
                  <Input
                    id={`field-${field.id}`}
                    type="number"
                    placeholder={`Entrez un nombre`}
                    value={formData[field.id] || ""}
                    onChange={(e) =>
                      handleFieldChange(field.id, e.target.value)
                    }
                    required={field.isRequired}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                )}

                {field.fieldType === "email" && (
                  <Input
                    id={`field-${field.id}`}
                    type="email"
                    placeholder="exemple@email.com"
                    value={formData[field.id] || ""}
                    onChange={(e) =>
                      handleFieldChange(field.id, e.target.value)
                    }
                    required={field.isRequired}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                )}

                {field.fieldType === "date" && (
                  <Input
                    id={`field-${field.id}`}
                    type="date"
                    value={formData[field.id] || ""}
                    onChange={(e) =>
                      handleFieldChange(field.id, e.target.value)
                    }
                    required={field.isRequired}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                )}

                {field.fieldType === "textarea" && (
                  <Textarea
                    id={`field-${field.id}`}
                    placeholder={`Entrez ${field.label.toLowerCase()}`}
                    value={formData[field.id] || ""}
                    onChange={(e) =>
                      handleFieldChange(field.id, e.target.value)
                    }
                    required={field.isRequired}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-24"
                  />
                )}

                {field.fieldType === "select" && (
                  <Select
                    value={formData[field.id] || ""}
                    onValueChange={(value) =>
                      handleFieldChange(field.id, value)
                    }
                  >
                    <SelectTrigger className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
                      <SelectValue placeholder="Sélectionnez une option" />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options &&
                        typeof field.options === "string" &&
                        JSON.parse(field.options).map((option: string) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}

                {field.fieldType === "radio" && (
                  <RadioGroup
                    value={formData[field.id] || ""}
                    onValueChange={(value) =>
                      handleFieldChange(field.id, value)
                    }
                  >
                    {field.options &&
                      typeof field.options === "string" &&
                      JSON.parse(field.options).map((option: string) => (
                        <div key={option} className="flex items-center gap-2">
                          <RadioGroupItem value={option} id={option} />
                          <Label htmlFor={option}>{option}</Label>
                        </div>
                      ))}
                  </RadioGroup>
                )}

                {field.fieldType === "checkbox" && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`field-${field.id}`}
                      checked={formData[field.id] === "true"}
                      onCheckedChange={(checked) =>
                        handleFieldChange(field.id, checked ? "true" : "false")
                      }
                    />
                    <Label htmlFor={`field-${field.id}`}>
                      {field.label}
                    </Label>
                  </div>
                )}
              </div>
            ))}

            {/* Submit Button */}
            <div className="pt-6">
              <Button
                type="submit"
                disabled={isSubmitting || submitMutation.isPending}
                className="w-full px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting || submitMutation.isPending
                  ? "Envoi en cours..."
                  : "Soumettre le formulaire"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
