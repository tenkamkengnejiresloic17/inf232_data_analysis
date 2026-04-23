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

describe("Health Surveillance Form", () => {
  it("should retrieve the health surveillance form with all required fields", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const forms = await caller.forms.listPublic();

    const healthForm = forms.find(
      (f) =>
        f.title.includes("Surveillance") ||
        f.title.includes("Épidémiologique")
    );

    expect(healthForm).toBeDefined();
    expect(healthForm?.sector).toBe("Santé Publique");
    expect(healthForm?.description).toContain("surveillance");
  });

  it("should have all required health and demographic fields", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const forms = await caller.forms.listPublic();
    const healthForm = forms.find(
      (f) =>
        f.title.includes("Surveillance") ||
        f.title.includes("Épidémiologique")
    );

    expect(healthForm).toBeDefined();

    if (healthForm) {
      const fieldLabels = healthForm.fields?.map((f) => f.label) || [];

      expect(fieldLabels.length).toBeGreaterThanOrEqual(14);
      expect(fieldLabels.some((l) => l.includes("Âge"))).toBe(true);
      expect(fieldLabels.some((l) => l.includes("Sexe"))).toBe(true);
      expect(fieldLabels.some((l) => l.includes("Poids"))).toBe(true);
      expect(fieldLabels.some((l) => l.includes("Taille"))).toBe(true);

      expect(fieldLabels.some((l) => l.includes("SIDA"))).toBe(true);
      expect(fieldLabels.some((l) => l.includes("syphilis"))).toBe(true);
      expect(fieldLabels.some((l) => l.includes("gonorrhée"))).toBe(true);
      expect(fieldLabels.some((l) => l.includes("chlamydia"))).toBe(true);
      expect(fieldLabels.some((l) => l.includes("choléra"))).toBe(true);
      expect(fieldLabels.some((l) => l.includes("tuberculose"))).toBe(true);
      expect(fieldLabels.some((l) => l.includes("malaria"))).toBe(true);

      expect(fieldLabels.some((l) => l.includes("COVID"))).toBe(true);
      expect(fieldLabels.some((l) => l.includes("fièvre jaune"))).toBe(true);
    }
  });

  it("should have correct field types for health data", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const forms = await caller.forms.listPublic();
    const healthForm = forms.find(
      (f) =>
        f.title.includes("Surveillance") ||
        f.title.includes("Épidémiologique")
    );

    expect(healthForm).toBeDefined();

    if (healthForm && healthForm.fields) {
      const ageField = healthForm.fields.find((f) =>
        f.label.includes("Âge")
      );
      const poidsField = healthForm.fields.find((f) =>
        f.label.includes("Poids")
      );
      const tailleField = healthForm.fields.find((f) =>
        f.label.includes("Taille")
      );

      expect(ageField?.fieldType).toBe("number");
      expect(poidsField?.fieldType).toBe("number");
      expect(tailleField?.fieldType).toBe("number");

      const sidaField = healthForm.fields.find((f) =>
        f.label.includes("SIDA")
      );
      const malariaField = healthForm.fields.find((f) =>
        f.label.includes("malaria")
      );

      expect(sidaField?.fieldType).toBe("select");
      expect(malariaField?.fieldType).toBe("select");

      // Check that disease fields have proper options (stored as JSON array)
      expect(sidaField?.options).toBeDefined();
      expect(malariaField?.options).toBeDefined();
    }
  });

  it("should have 30 submissions in the database", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const forms = await caller.forms.listPublic();
    const healthForm = forms.find(
      (f) =>
        f.title.includes("Surveillance") ||
        f.title.includes("Épidémiologique")
    );

    expect(healthForm).toBeDefined();

    if (healthForm) {
      expect(healthForm.submissionCount).toBeGreaterThanOrEqual(30);
    }
  });
});
