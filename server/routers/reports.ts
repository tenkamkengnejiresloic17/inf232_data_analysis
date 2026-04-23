import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import {
  getFormById,
  getFieldsByFormId,
  getResponsesByFieldId,
  calculateDescriptiveStats,
  calculateFrequencies,
  createAnalysisReport,
  getAnalysisReportsByFormId,
} from "../db";
import { TRPCError } from "@trpc/server";

export const reportsRouter = router({
  // Generate a report for a form
  generate: protectedProcedure
    .input(z.object({ formId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const form = await getFormById(input.formId);
      if (!form || form.createdById !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Gather analysis data
      const formFields = await getFieldsByFormId(input.formId);
      const analysisData: Record<string, any> = {};
      let totalResponses = 0;

      for (const field of formFields) {
        const responses = await getResponsesByFieldId(field.id);
        const values = responses
          .map((r) => r.value)
          .filter((v): v is string => v !== null && v !== undefined);

        if (values.length === 0) continue;

        totalResponses = Math.max(totalResponses, values.length);

        if (field.fieldType === "number") {
          const numValues = values
            .map((v) => parseFloat(v))
            .filter((v) => !isNaN(v));
          if (numValues.length > 0) {
            const stats = calculateDescriptiveStats(numValues);
            analysisData[field.label] = {
              type: "numeric",
              stats,
            };
          }
        } else {
          const frequencies = calculateFrequencies(values);
          analysisData[field.label] = {
            type: "categorical",
            frequencies,
            total: values.length,
          };
        }
      }

      // Prepare prompt for LLM
      const analysisText = Object.entries(analysisData)
        .map(([fieldName, data]) => {
          if (data.type === "numeric") {
            return `${fieldName}: Moyenne=${data.stats.mean}, Médiane=${data.stats.median}, Écart-type=${data.stats.stdDev}, Min=${data.stats.min}, Max=${data.stats.max}`;
          } else {
            return `${fieldName}: ${data.frequencies
              .map((f: any) => `${f.value}(${f.count})`)
              .join(", ")}`;
          }
        })
        .join("\n");

      const prompt = `Analysez les données suivantes collectées via un formulaire et générez un rapport d'interprétation en langage naturel. 
      
Formulaire: ${form.title}
Secteur: ${form.sector}
Nombre total de soumissions: ${totalResponses}

Données collectées:
${analysisText}

Veuillez fournir:
1. Un résumé des tendances principales détectées
2. Les anomalies ou points intéressants identifiés
3. Un résumé statistique en langage naturel
4. Des recommandations basées sur les données

Répondez en français de manière concise et professionnelle.`;

      // Call LLM
      let llmResponse = "";
      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "Tu es un analyste de données expert. Génère des rapports d'analyse clairs et professionnels en français.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        const content = response.choices[0]?.message?.content;
        llmResponse =
          typeof content === "string"
            ? content
            : Array.isArray(content)
            ? content.map((c: any) => c.text || "").join("")
            : "Rapport non généré";
      } catch (error) {
        console.error("LLM error:", error);
        llmResponse =
          "Erreur lors de la génération du rapport. Veuillez réessayer.";
      }

      // Extract trends and anomalies (simple parsing)
      const trends = Object.entries(analysisData)
        .filter(([_, data]) => data.type === "numeric")
        .map(([name, data]) => ({
          field: name,
          mean: data.stats.mean,
          stdDev: data.stats.stdDev,
        }));

      const anomalies = Object.entries(analysisData)
        .filter(([_, data]) => data.type === "categorical")
        .map(([name, data]) => ({
          field: name,
          topValue: data.frequencies[0]?.value,
          topCount: data.frequencies[0]?.count,
        }));

      // Save report
      const result = await createAnalysisReport({
        formId: input.formId,
        generatedById: ctx.user.id,
        title: `Rapport d'analyse - ${form.title}`,
        content: llmResponse,
        summary: llmResponse.split("\n")[0],
        trends: JSON.stringify(trends),
        anomalies: JSON.stringify(anomalies),
        statistics: JSON.stringify(analysisData),
      });

      return {
        success: true,
        report: {
          title: `Rapport d'analyse - ${form.title}`,
          content: llmResponse,
          trends,
          anomalies,
        },
      };
    }),

  // Get reports for a form
  getByFormId: protectedProcedure
    .input(z.object({ formId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const form = await getFormById(input.formId);
      if (!form || form.createdById !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return getAnalysisReportsByFormId(input.formId);
    }),
});
