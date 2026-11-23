import { describe, expect, it } from "vitest";
import { QUANDO, PRODUTOS, PERFIS, linkWhatsapp, mensagemWhatsapp, qualificado } from "@/lib/whatsapp-lead";

describe("formulário Falar com a Vonix", () => {
  it("só quem quer comprar hoje ou nesta semana conta como lead", () => {
    expect(qualificado({ quando: "hoje" })).toBe(true);
    expect(qualificado({ quando: "semana" })).toBe(true);
    expect(qualificado({ quando: "olhando" })).toBe(false);
  });

  it("a mensagem do WhatsApp leva nome, perfil, produto e prazo", () => {
    const msg = mensagemWhatsapp(" Ana ", { perfil: "profissional", produto: "fio-de-luz", quando: "hoje" });
    expect(msg).toContain("Sou Ana,");
    expect(msg).toContain("Sou cabeleireira / tenho salão");
    expect(msg).toContain("Progressiva Fio de Luz");
    expect(msg).toContain("hoje");
  });

  it("o link abre o WhatsApp da Vonix com a mensagem codificada", () => {
    const url = linkWhatsapp("Ana", { perfil: "casa", produto: "botox", quando: "semana" });
    expect(url.startsWith("https://wa.me/5531971185662?text=")).toBe(true);
    expect(decodeURIComponent((url.split("text=")[1] ?? ""))).toContain("Botox Vonix");
  });

  it("as opções têm códigos únicos", () => {
    for (const lista of [PERFIS, PRODUTOS, QUANDO]) {
      const ids = lista.map((x) => x.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});
