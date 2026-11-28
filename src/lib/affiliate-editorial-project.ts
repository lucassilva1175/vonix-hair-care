import {
  buildEditorialPlan,
  type EditorialProfile,
  type EditorialCadence,
  type EditorialFormat,
} from "./affiliate-editorial-plan";
import {
  resolveEditorialReferences,
  EDITORIAL_REFERENCE_LIMIT,
} from "./affiliate-editorial-references";

export const EDITORIAL_PROJECT_MAX_BYTES = 4096;
export type EditorialProject = {
  version: 1;
  profile: EditorialProfile;
  cadence: EditorialCadence;
  format: EditorialFormat;
  done: string[];
  references: string[];
};
export type EditorialProjectImport = { project: EditorialProject; unavailableReferences: number };

// Deliberately accepts only finite, predefined choices and current catalogue
// slugs. No names, addresses, tracking codes, user IDs or arbitrary text.
export function parseEditorialProject(raw: string): EditorialProjectImport | null {
  if (
    raw.length > EDITORIAL_PROJECT_MAX_BYTES ||
    new TextEncoder().encode(raw).length > EDITORIAL_PROJECT_MAX_BYTES
  )
    return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const p = value as Record<string, unknown>;
    const keys = ["version", "profile", "cadence", "format", "done", "references"];
    if (Object.keys(p).length !== keys.length || keys.some((key) => !Object.hasOwn(p, key)))
      return null;
    const { version, profile, cadence, format, done, references } = p;
    if (
      version !== 1 ||
      (profile !== "rotina" && profile !== "ugc" && profile !== "informacao") ||
      (cadence !== 2 && cadence !== 3 && cadence !== 5) ||
      (format !== "video" && format !== "foto" && format !== "misto") ||
      !Array.isArray(done) ||
      done.length > 5 ||
      !Array.isArray(references) ||
      references.length > EDITORIAL_REFERENCE_LIMIT ||
      !references.every(
        (slug): slug is string => typeof slug === "string" && /^[a-z0-9-]{1,120}$/.test(slug),
      )
    )
      return null;
    const days = buildEditorialPlan(profile, cadence, format).entries.map((entry) => entry.day);
    if (
      !done.every((day) => typeof day === "string" && days.includes(day)) ||
      new Set(done).size !== done.length ||
      new Set(references).size !== references.length
    )
      return null;
    const valid = resolveEditorialReferences(references).map((item) => item.slug);
    return {
      project: {
        version,
        profile,
        cadence,
        format,
        done: days.filter((day) => done.includes(day)),
        references: valid,
      },
      unavailableReferences: references.length - valid.length,
    };
  } catch {
    return null;
  }
}
export function serializeEditorialProject(project: EditorialProject): string {
  // Build an allowlisted object rather than serializing the caller itself.
  const serialized = JSON.stringify({
    version: 1,
    profile: project.profile,
    cadence: project.cadence,
    format: project.format,
    done: project.done,
    references: resolveEditorialReferences(project.references).map((item) => item.slug),
  });
  const checked = parseEditorialProject(serialized);
  if (!checked) throw Error("invalid editorial project");
  return JSON.stringify(checked.project, null, 2);
}
