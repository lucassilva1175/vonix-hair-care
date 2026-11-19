import { describe, expect, it } from "vitest";
import { catalogId, metaCatalogId, metaParams } from "@/lib/analytics";
import { products } from "@/lib/store";

describe("rastreio com os códigos do catálogo da Meta", () => {
  it("preserva os códigos já usados no GA4", () => {
    expect(catalogId("progressiva-fio-de-luz")).toBe("VONIX-PROGRESSIVA-FIO-DE-LUZ");
    expect(catalogId("botox-vonix")).toBe("VONIX-BOTOX-VONIX");
    expect(catalogId("progressiva-diamond")).toBe("VONIX-PROGRESSIVA-DIAMOND");
    expect(catalogId("kit-banana-e-mel")).toBe("VONIX-COMBO-BANANA-E-MEL");
  });
  it("usa no feed e nos eventos os códigos existentes no catálogo da Meta", () => {
    expect(metaCatalogId(catalogId("kit-banana-e-mel"))).toBe("VONIX-KIT-BANANA-E-MEL");
    expect(metaCatalogId(catalogId("kit-matizador-shampoo-e-mascara"))).toBe("VONIX-KIT-MATIZADOR");
    expect(metaCatalogId(catalogId("mascara-efeito-teia-coco-nutri"))).toBe("VONIX-MASCARA-COCO-NUTRI");
    const item = { item_id: catalogId("kit-banana-e-mel"), item_name: "Combo Banana e Mel", item_variant: "Kit", price: 154.9, quantity: 1 };
    const event = metaParams({ items: [item] });
    expect(event.content_ids).toEqual(["VONIX-KIT-BANANA-E-MEL"]);
    expect(event.contents).toEqual([{ id: "VONIX-KIT-BANANA-E-MEL", quantity: 1, item_price: 154.9 }]);
  });
  it("envia content_ids e contents com o mesmo código", () => {
    const m = metaParams({ value: 174.9, items: [{ item_id: "VONIX-BOTOX-VONIX", item_name: "Botox", item_variant: "1Kg", price: 164.9, quantity: 2 }] });
    expect(m.content_ids).toEqual(["VONIX-BOTOX-VONIX"]);
    expect(m.contents).toEqual([{ id: "VONIX-BOTOX-VONIX", quantity: 2, item_price: 164.9 }]);
    expect(m.value).toBe(174.9);
    expect(m.num_items).toBe(2);
    expect(m.content_type).toBe("product");
  });
});

describe("catálogo da Meta", () => {
  it("cada produto do feed tem um código único (código repetido faz a Meta recusar as linhas)", () => {
    const ids = products.map((p) => metaCatalogId(catalogId(p.slug)));
    const repetidos = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(repetidos).toEqual([]);
  });
  it("a máscara avulsa Coco Nutri não usa o código da Máscara Efeito Teia", () => {
    expect(metaCatalogId(catalogId("mascara-coco-nutri"))).toBe("VONIX-AVULSO-MASCARA-COCO-NUTRI");
    expect(metaCatalogId(catalogId("mascara-efeito-teia-coco-nutri"))).toBe("VONIX-MASCARA-COCO-NUTRI");
  });
});
