import { describe, it, expect } from "vitest";
import {
  parseEditorialProject,
  serializeEditorialProject,
  EDITORIAL_PROJECT_MAX_BYTES,
  type EditorialProject,
} from "@/lib/affiliate-editorial-project";
import { vitrine } from "@/lib/store";
const slug = vitrine.find((p) => p.slug !== "combo-perfume-e-serum")!.slug;
const project: EditorialProject = {
  version: 1,
  profile: "ugc",
  cadence: 2,
  format: "video",
  done: ["Sexta"],
  references: [slug],
};
describe("Portable editorial projects", () => {
  it("round trips only allowlisted choices, even if caller has extra fields", () => {
    const source = { ...project, secret: "private", email: "example@example.invalid" };
    const raw = serializeEditorialProject(source);
    expect(raw).not.toContain("private");
    expect(raw).not.toContain("email");
    expect(parseEditorialProject(raw)).toEqual({ project, unavailableReferences: 0 });
  });
  it("removes retired catalog items without restoring untrusted URLs", () => {
    const r = parseEditorialProject(
      JSON.stringify({
        ...project,
        references: [slug, "retired-synthetic-product", "combo-perfume-e-serum"],
      }),
    );
    expect(r).toEqual({ project, unavailableReferences: 2 });
    expect(
      parseEditorialProject(
        JSON.stringify({ ...project, references: ["https://untrusted.invalid"] }),
      ),
    ).toBeNull();
  });
  it.each([
    { ...project, version: 2 },
    { ...project, email: "x@example.invalid" },
    { ...project, cadence: 3, done: ["Terça"] },
    { ...project, done: ["Sexta", "Sexta"] },
    { ...project, references: [slug, slug] },
    { ...project, profile: "<script>" },
    { ...project, references: Array.from({ length: 7 }, (_, i) => "item-" + i) },
    { ...project, references: [null] },
    { ...project, format: "story" },
    { ...project, done: "Sexta" },
    null,
    [],
    "not-json-object",
  ])("rejects malformed or unsupported project", (value) => {
    expect(parseEditorialProject(JSON.stringify(value))).toBeNull();
  });
  it("rejects oversized UTF-8 or malformed input", () => {
    expect(parseEditorialProject(" ".repeat(EDITORIAL_PROJECT_MAX_BYTES + 1))).toBeNull();
    expect(parseEditorialProject("é".repeat(EDITORIAL_PROJECT_MAX_BYTES))).toBeNull();
    expect(parseEditorialProject("{")).toBeNull();
  });
  it("normalizes checked days in calendar order", () => {
    const result = parseEditorialProject(JSON.stringify({ ...project, done: ["Sexta", "Terça"] }));
    expect(result?.project.done).toEqual(["Terça", "Sexta"]);
  });
});
