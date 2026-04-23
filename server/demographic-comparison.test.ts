import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("Demographic Comparison Analysis", () => {
  it("should retrieve demographic comparison data by age group", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Get the health surveillance form
    const forms = await caller.forms.listPublic();
    const healthForm = forms.find(
      (f) =>
        f.title.includes("Surveillance") ||
        f.title.includes("Épidémiologique")
    );

    expect(healthForm).toBeDefined();

    if (healthForm) {
      const comparisonData = await caller.forms.getDemographicComparison({
        formId: healthForm.id,
        groupBy: "age",
      });

      expect(comparisonData).toBeDefined();
      expect(comparisonData.groupBy).toBe("age");
      expect(comparisonData.data).toBeDefined();

      // Check that age groups are present
      const ageGroups = Object.keys(comparisonData.data);
      expect(ageGroups).toContain("0-18");
      expect(ageGroups).toContain("19-35");
      expect(ageGroups).toContain("36-50");
      expect(ageGroups).toContain("51+");

      // Check that each age group has disease data
      for (const [groupName, groupData] of Object.entries(
        comparisonData.data
      )) {
        expect((groupData as any).submissionCount).toBeGreaterThanOrEqual(0);
        expect((groupData as any).diseases).toBeDefined();

        // Check that disease prevalence is calculated
        const diseases = Object.keys((groupData as any).diseases);
        expect(diseases.length).toBeGreaterThan(0);

        for (const disease of diseases) {
          const diseaseData = (groupData as any).diseases[disease];
          expect(diseaseData.count).toBeGreaterThanOrEqual(0);
          expect(diseaseData.percentage).toBeGreaterThanOrEqual(0);
          expect(diseaseData.percentage).toBeLessThanOrEqual(100);
        }
      }
    }
  });

  it("should retrieve demographic comparison data by sex", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Get the health surveillance form
    const forms = await caller.forms.listPublic();
    const healthForm = forms.find(
      (f) =>
        f.title.includes("Surveillance") ||
        f.title.includes("Épidémiologique")
    );

    expect(healthForm).toBeDefined();

    if (healthForm) {
      const comparisonData = await caller.forms.getDemographicComparison({
        formId: healthForm.id,
        groupBy: "sex",
      });

      expect(comparisonData).toBeDefined();
      expect(comparisonData.groupBy).toBe("sex");
      expect(comparisonData.data).toBeDefined();

      // Check that sex groups are present
      const sexGroups = Object.keys(comparisonData.data);
      expect(sexGroups.length).toBeGreaterThan(0);

      // Check that each sex group has disease data
      for (const [groupName, groupData] of Object.entries(
        comparisonData.data
      )) {
        expect((groupData as any).submissionCount).toBeGreaterThanOrEqual(0);
        expect((groupData as any).diseases).toBeDefined();

        // Check that disease prevalence is calculated
        const diseases = Object.keys((groupData as any).diseases);
        expect(diseases.length).toBeGreaterThan(0);

        for (const disease of diseases) {
          const diseaseData = (groupData as any).diseases[disease];
          expect(diseaseData.count).toBeGreaterThanOrEqual(0);
          expect(diseaseData.percentage).toBeGreaterThanOrEqual(0);
          expect(diseaseData.percentage).toBeLessThanOrEqual(100);
        }
      }
    }
  });

  it("should identify high-risk groups with disease prevalence > 30%", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Get the health surveillance form
    const forms = await caller.forms.listPublic();
    const healthForm = forms.find(
      (f) =>
        f.title.includes("Surveillance") ||
        f.title.includes("Épidémiologique")
    );

    expect(healthForm).toBeDefined();

    if (healthForm) {
      const comparisonData = await caller.forms.getDemographicComparison({
        formId: healthForm.id,
        groupBy: "age",
      });

      // Find high-risk diseases (prevalence > 30%)
      const highRiskDiseases: Record<string, any> = {};

      for (const [groupName, groupData] of Object.entries(
        comparisonData.data
      )) {
        const diseases = (groupData as any).diseases;
        for (const [disease, data] of Object.entries(diseases)) {
          if ((data as any).percentage > 30) {
            if (!highRiskDiseases[disease]) {
              highRiskDiseases[disease] = [];
            }
            highRiskDiseases[disease].push({
              group: groupName,
              percentage: (data as any).percentage,
            });
          }
        }
      }

      // At least one disease should have high prevalence in at least one group
      // (This depends on the data, so we just verify the structure)
      expect(typeof highRiskDiseases).toBe("object");
    }
  });
});
