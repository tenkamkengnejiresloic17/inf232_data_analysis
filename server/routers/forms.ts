import { z } from "zod";
import { eq } from "drizzle-orm";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { forms } from "../../drizzle/schema";
import { getDb } from "../db";
import {
  createForm,
  getFormById,
  listFormsByCreator,
  updateForm,
  deleteForm,
  createField,
  getFieldsByFormId,
  updateField,
  deleteField,
  createSubmission,
  getSubmissionsByFormId,
  countSubmissionsByFormId,
  createResponses,
  getResponsesBySubmissionId,
  getResponsesByFieldId,
  calculateDescriptiveStats,
  calculateFrequencies,
} from "../db";
import { notifyOwner } from "../_core/notification";
import { TRPCError } from "@trpc/server";

export const formsRouter = router({
  // Create a new form (admin only)
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().optional(),
        sector: z.string().min(1, "Sector is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const result = await createForm({
        createdById: ctx.user.id,
        title: input.title,
        description: input.description || null,
        sector: input.sector,
      });

      return result;
    }),

  // Get a specific form with its fields
  getById: publicProcedure
    .input(z.object({ formId: z.number() }))
    .query(async ({ input }) => {
      const form = await getFormById(input.formId);
      if (!form) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const formFields = await getFieldsByFormId(input.formId);
      return { ...form, fields: formFields };
    }),

  // List all active forms (public)
  listPublic: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return [];
    }

    const allForms = await db
      .select()
      .from(forms)
      .where(eq(forms.isActive, true));

    // Add submission count to each form
    const formsWithCount = await Promise.all(
      allForms.map(async (form) => {
        const count = await countSubmissionsByFormId(form.id);
        const formFields = await getFieldsByFormId(form.id);
        return {
          ...form,
          submissionCount: count,
          fields: formFields,
        };
      })
    );

    return formsWithCount;
  }),

  // List all forms created by the current admin
  listByCreator: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    return listFormsByCreator(ctx.user.id);
  }),

  // Update a form
  update: protectedProcedure
    .input(
      z.object({
        formId: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        sector: z.string().optional(),
        isActive: z.boolean().optional(),
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

      return updateForm(input.formId, {
        title: input.title,
        description: input.description,
        sector: input.sector,
        isActive: input.isActive,
      });
    }),

  // Delete a form
  delete: protectedProcedure
    .input(z.object({ formId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const form = await getFormById(input.formId);
      if (!form || form.createdById !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return deleteForm(input.formId);
    }),

  // Add a field to a form
  addField: protectedProcedure
    .input(
      z.object({
        formId: z.number(),
        label: z.string().min(1),
        fieldType: z.enum([
          "text",
          "number",
          "email",
          "date",
          "select",
          "checkbox",
          "radio",
          "textarea",
        ]),
        isRequired: z.boolean().default(false),
        options: z.array(z.string()).optional(),
        order: z.number(),
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

      return createField({
        formId: input.formId,
        label: input.label,
        fieldType: input.fieldType,
        isRequired: input.isRequired,
        options: input.options ? JSON.stringify(input.options) : null,
        order: input.order,
      });
    }),

  // Update a field
  updateField: protectedProcedure
    .input(
      z.object({
        fieldId: z.number(),
        formId: z.number(),
        label: z.string().optional(),
        isRequired: z.boolean().optional(),
        options: z.array(z.string()).optional(),
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

      return updateField(input.fieldId, {
        label: input.label,
        isRequired: input.isRequired,
        options: input.options ? JSON.stringify(input.options) : undefined,
      });
    }),

  // Delete a field
  deleteField: protectedProcedure
    .input(z.object({ fieldId: z.number(), formId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const form = await getFormById(input.formId);
      if (!form || form.createdById !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return deleteField(input.fieldId);
    }),

  // Submit form responses (public)
  submit: publicProcedure
    .input(
      z.object({
        formId: z.number(),
        responses: z.array(
          z.object({
            fieldId: z.number(),
            value: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const form = await getFormById(input.formId);
      if (!form || !form.isActive) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Create submission
      const submissionResult = await createSubmission({
        formId: input.formId,
        submittedAt: new Date(),
        ipAddress: ctx.req.ip || undefined,
      });

      // Get the submission ID from the result
      const submissionId = (submissionResult as any).insertId;

      // Create responses
      const responsesToCreate = input.responses.map((r) => ({
        submissionId,
        fieldId: r.fieldId,
        value: r.value,
      }));

      await createResponses(responsesToCreate);

      // Notify owner
      try {
        await notifyOwner({
          title: `New submission for form: ${form.title}`,
          content: `A new response has been submitted to your form "${form.title}". Total submissions: ${await countSubmissionsByFormId(input.formId)}`,
        });
      } catch (error) {
        console.error("Failed to notify owner:", error);
      }

      return { success: true, submissionId };
    }),

  // Get submissions for a form (admin only)
  getSubmissions: protectedProcedure
    .input(
      z.object({
        formId: z.number(),
        limit: z.number().default(100),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const form = await getFormById(input.formId);
      if (!form || form.createdById !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const submissions = await getSubmissionsByFormId(
        input.formId,
        input.limit,
        input.offset
      );
      const total = await countSubmissionsByFormId(input.formId);

      // Enrich submissions with responses
      const enrichedSubmissions = await Promise.all(
        submissions.map(async (submission) => {
          const responses = await getResponsesBySubmissionId(submission.id);
          return { ...submission, responses };
        })
      );

      return { submissions: enrichedSubmissions, total };
    }),

  // Get analysis data for a form
  getAnalysis: protectedProcedure
    .input(z.object({ formId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const form = await getFormById(input.formId);
      if (!form || form.createdById !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const formFields = await getFieldsByFormId(input.formId);
      const analysis: Record<string, any> = {};

      for (const field of formFields) {
        const responses = await getResponsesByFieldId(field.id);
        const values = responses
          .map((r) => r.value)
          .filter((v): v is string => v !== null && v !== undefined);

        if (field.fieldType === "number") {
          const numValues = values
            .map((v) => parseFloat(v))
            .filter((v) => !isNaN(v));
          if (numValues.length > 0) {
            analysis[field.id] = {
              fieldLabel: field.label,
              fieldType: field.fieldType,
              stats: calculateDescriptiveStats(numValues),
            };
          }
        } else if (values.length > 0) {
          analysis[field.id] = {
            fieldLabel: field.label,
            fieldType: field.fieldType,
            frequencies: calculateFrequencies(values),
          };
        }
      }

      return analysis;
    }),

  // Get epidemiological analysis
  getEpidemiologicalAnalysis: publicProcedure
    .input(z.object({ formId: z.number() }))
    .query(async ({ input }) => {
      const form = await getFormById(input.formId);
      if (!form) throw new TRPCError({ code: "NOT_FOUND" });

      const formFields = await getFieldsByFormId(input.formId);
      const submissions = await getSubmissionsByFormId(input.formId, 10000, 0);

      const diseaseFields = [
        "sida",
        "syphilis",
        "gonorrhee",
        "chlamydia",
        "cholera",
        "tuberculose",
        "malaria",
      ];

      const diseaseAnalysis: Record<string, any> = {};

      for (const disease of diseaseFields) {
        const field = formFields.find((f) =>
          f.label.toLowerCase().includes(disease.replace("_", ""))
        );

        if (field) {
          const diseaseResponses = await getResponsesByFieldId(field.id);
          const positiveCount = diseaseResponses.filter(
            (r) => r.value === "Oui"
          ).length;
          const percentage =
            submissions.length > 0
              ? (positiveCount / submissions.length) * 100
              : 0;

          diseaseAnalysis[disease] = {
            count: positiveCount,
            percentage: Math.round(percentage * 100) / 100,
            label: field.label,
          };
        }
      }

      return {
        totalSubmissions: submissions.length,
        diseasePrevalence: diseaseAnalysis,
      };
    }),

  // Get demographic comparison analysis (by age group and sex)
  getDemographicComparison: publicProcedure
    .input(z.object({ formId: z.number(), groupBy: z.enum(["age", "sex"]) }))
    .query(async ({ input }) => {
      const form = await getFormById(input.formId);
      if (!form) throw new TRPCError({ code: "NOT_FOUND" });

      const formFields = await getFieldsByFormId(input.formId);
      const submissions = await getSubmissionsByFormId(input.formId, 10000, 0);

      // Get age and sex fields
      const ageField = formFields.find((f) => f.label.toLowerCase().includes("âge"));
      const sexField = formFields.find((f) => f.label.toLowerCase().includes("sexe"));

      if (!ageField || !sexField) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Age and sex fields not found" });
      }

      const diseaseFields = [
        "sida",
        "syphilis",
        "gonorrhee",
        "chlamydia",
        "cholera",
        "tuberculose",
        "malaria",
      ];

      if (input.groupBy === "age") {
        // Group by age ranges
        const ageRanges = {
          "0-18": { min: 0, max: 18 },
          "19-35": { min: 19, max: 35 },
          "36-50": { min: 36, max: 50 },
          "51+": { min: 51, max: 200 },
        };

        const ageComparison: Record<string, any> = {};

        for (const [rangeName, range] of Object.entries(ageRanges)) {
          const submissionsInRange: number[] = [];

          for (const submission of submissions) {
            const ageResponse = await getResponsesBySubmissionId(submission.id);
            const ageValue = ageResponse.find((r) => r.fieldId === ageField.id);

            if (ageValue && ageValue.value) {
              const age = parseInt(ageValue.value, 10);
              if (!isNaN(age) && age >= range.min && age <= range.max) {
                submissionsInRange.push(submission.id);
              }
            }
          }

          const diseaseData: Record<string, any> = {};

          for (const disease of diseaseFields) {
            const field = formFields.find((f) =>
              f.label.toLowerCase().includes(disease.replace("_", ""))
            );

            if (field) {
              const diseaseResponses = await getResponsesByFieldId(field.id);
              const positiveCount = diseaseResponses.filter(
                (r) =>
                  r.value === "Oui" &&
                  submissionsInRange.includes(r.submissionId)
              ).length;

              const percentage =
                submissionsInRange.length > 0
                  ? (positiveCount / submissionsInRange.length) * 100
                  : 0;

              diseaseData[disease] = {
                count: positiveCount,
                percentage: Math.round(percentage * 100) / 100,
                label: field.label,
              };
            }
          }

          ageComparison[rangeName] = {
            submissionCount: submissionsInRange.length,
            diseases: diseaseData,
          };
        }

        return { groupBy: "age", data: ageComparison };
      } else {
        // Group by sex
        const sexComparison: Record<string, any> = {};

        const sexResponses = await getResponsesByFieldId(sexField.id);
        const sexValues = Array.from(new Set(sexResponses.map((r) => r.value).filter((v) => v !== null)));

        for (const sex of sexValues) {
          const submissionsForSex: number[] = [];

          for (const submission of submissions) {
            const responses = await getResponsesBySubmissionId(submission.id);
            const sexResponse = responses.find((r) => r.fieldId === sexField.id);

            if (sexResponse && sexResponse.value === sex) {
              submissionsForSex.push(submission.id);
            }
          }

          const diseaseData: Record<string, any> = {};

          for (const disease of diseaseFields) {
            const field = formFields.find((f) =>
              f.label.toLowerCase().includes(disease.replace("_", ""))
            );

            if (field) {
              const diseaseResponses = await getResponsesByFieldId(field.id);
              const positiveCount = diseaseResponses.filter(
                (r) =>
                  r.value === "Oui" &&
                  submissionsForSex.includes(r.submissionId)
              ).length;

              const percentage =
                submissionsForSex.length > 0
                  ? (positiveCount / submissionsForSex.length) * 100
                  : 0;

              diseaseData[disease] = {
                count: positiveCount,
                percentage: Math.round(percentage * 100) / 100,
                label: field.label,
              };
            }
          }

          sexComparison[sex] = {
            submissionCount: submissionsForSex.length,
            diseases: diseaseData,
          };
        }

        return { groupBy: "sex", data: sexComparison };
      }
    }),
});
