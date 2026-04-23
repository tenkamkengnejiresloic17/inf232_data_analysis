import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { storagePut } from "../storage";
import {
  getFormById,
  getFieldsByFormId,
  createSubmission,
  createResponses,
  getSubmissionsByFormId,
  createCsvImport,
  getCsvImportsByFormId,
} from "../db";
import { TRPCError } from "@trpc/server";

export const csvRouter = router({
  // Export submissions as CSV
  export: protectedProcedure
    .input(z.object({ formId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const form = await getFormById(input.formId);
      if (!form || form.createdById !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const formFields = await getFieldsByFormId(input.formId);
      const submissions = await getSubmissionsByFormId(input.formId, 10000, 0);

      // Build CSV header
      const headers = [
        "ID",
        "Date de soumission",
        ...formFields.map((f) => f.label),
      ];

        // Build CSV rows
        const rows = await Promise.all(
          submissions.map(async (submission) => {
            const responseValues = formFields.map((field) => "");

            return [
              submission.id,
              new Date(submission.submittedAt).toLocaleString("fr-FR"),
              ...responseValues,
            ];
          })
        );

      // Create CSV content
      const csvContent = [
        headers.map((h) => `"${h}"`).join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      // Upload to storage
      const fileName = `export_${form.id}_${Date.now()}.csv`;
      const { url } = await storagePut(
        `csv-exports/${fileName}`,
        Buffer.from(csvContent, "utf-8"),
        "text/csv"
      );

      return {
        success: true,
        url,
        fileName,
      };
    }),

  // Import CSV file
  import: protectedProcedure
    .input(
      z.object({
        formId: z.number(),
        fileUrl: z.string(),
        fileName: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const form = await getFormById(input.formId);
      if (!form || form.createdById !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      try {
        // Fetch CSV file
        const response = await fetch(input.fileUrl);
        if (!response.ok) {
          throw new Error("Failed to fetch file");
        }

        const csvContent = await response.text();
        const lines = csvContent.split("\n").filter((line) => line.trim());

        if (lines.length < 2) {
          throw new Error("CSV file is empty or invalid");
        }

        // Parse CSV
        const headers = lines[0]
          .split(",")
          .map((h) => h.replace(/"/g, "").trim());
        const formFields = await getFieldsByFormId(input.formId);

        // Map headers to field IDs
        const fieldMapping: Record<number, number> = {};
        formFields.forEach((field) => {
          const headerIndex = headers.findIndex(
            (h) => h.toLowerCase() === field.label.toLowerCase()
          );
          if (headerIndex !== -1) {
            fieldMapping[headerIndex] = field.id;
          }
        });

        // Import rows
        let successCount = 0;
        let errorCount = 0;

        for (let i = 1; i < lines.length; i++) {
          try {
            const values = lines[i]
              .split(",")
              .map((v) => v.replace(/"/g, "").trim());

            // Create submission
            const submissionResult = await createSubmission({
              formId: input.formId,
              submittedAt: new Date(),
              ipAddress: "csv-import",
            });

            const submissionId = (submissionResult as any).insertId;

            // Create responses
            const responses = Object.entries(fieldMapping)
              .map(([headerIdx, fieldId]) => ({
                submissionId,
                fieldId,
                value: values[parseInt(headerIdx)] || "",
              }))
              .filter((r) => r.value !== "");

            if (responses.length > 0) {
              await createResponses(responses);
            }

            successCount++;
          } catch (error) {
            console.error(`Error importing row ${i}:`, error);
            errorCount++;
          }
        }

        // Save import record
        const fileKey = `csv-imports/${input.fileName}`;
        await createCsvImport({
          formId: input.formId,
          uploadedById: ctx.user.id,
          fileName: input.fileName,
          fileKey,
          fileUrl: input.fileUrl,
          rowCount: successCount,
          status: "completed",
        });

        return {
          success: true,
          imported: successCount,
          failed: errorCount,
          message: `${successCount} lignes importées avec succès${
            errorCount > 0 ? `, ${errorCount} erreurs` : ""
          }`,
        };
      } catch (error) {
        console.error("CSV import error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Erreur lors de l'import : ${
            error instanceof Error ? error.message : "Erreur inconnue"
          }`,
        });
      }
    }),

  // Get import history
  getImports: protectedProcedure
    .input(z.object({ formId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const form = await getFormById(input.formId);
      if (!form || form.createdById !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return getCsvImportsByFormId(input.formId);
    }),
});
