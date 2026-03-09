import { describe, it, expect } from "vitest";
import { colors, shadows, spacing, radii, typography } from "@/lib/tokens";

describe("design tokens", () => {
  describe("colors.green", () => {
    it("has 11 shades from 50 to 950", () => {
      const keys = Object.keys(colors.green);
      expect(keys).toHaveLength(11);
      expect(colors.green[900]).toBe("#1a4d24");
      expect(colors.green[500]).toBe("#48b356");
    });
  });

  describe("colors.status", () => {
    it("defines all four response statuses", () => {
      expect(colors.status).toHaveProperty("new");
      expect(colors.status).toHaveProperty("reviewing");
      expect(colors.status).toHaveProperty("approved");
      expect(colors.status).toHaveProperty("rejected");
    });
  });

  describe("shadows", () => {
    it("all shadow values contain both light and dark parts", () => {
      for (const value of Object.values(shadows)) {
        expect(value).toMatch(/#cecece/);
        expect(value).toMatch(/#ffffff/);
      }
    });

    it("inset shadows start with 'inset'", () => {
      expect(shadows.neuIn.startsWith("inset")).toBe(true);
      expect(shadows.neuInSm.startsWith("inset")).toBe(true);
    });
  });

  describe("spacing", () => {
    it("sidebar is wider than collapsed sidebar", () => {
      const sidebar = parseInt(spacing.sidebar);
      const collapsed = parseInt(spacing.sidebarCollapsed);
      expect(sidebar).toBeGreaterThan(collapsed);
    });
  });

  describe("radii", () => {
    it("full radius is 9999px", () => {
      expect(radii.full).toBe("9999px");
    });
  });

  describe("typography", () => {
    it("includes Prompt and Sarabun fonts", () => {
      expect(typography.fontFamily.heading).toContain("Prompt");
      expect(typography.fontFamily.body).toContain("Sarabun");
    });
  });
});
