import { useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getRef, normalizeRef } from "@/lib/affiliate-ref";

const CAMPAIGN_KEY = "vonix-youshop-campaign";

function campaignFrom(search: string): URLSearchParams {
  const campaign = new URLSearchParams();
  for (const [key, value] of new URLSearchParams(search)) {
    if (key.startsWith("utm_") && value && !campaign.has(key)) {
      campaign.set(key, value);
    }
  }
  return campaign;
}

export function rememberYouShopCampaign(search: string): void {
  const campaign = campaignFrom(search).toString();
  if (!campaign) return;
  try {
    sessionStorage.setItem(CAMPAIGN_KEY, campaign);
  } catch {
    // The current URL can still supply the campaign when storage is unavailable.
  }
}

type YouShopOffer = { code: string; priceCents: number };

// Official offer links verified against the YouShop catalog.
const YOUSHOP_OFFERS: Readonly<
  Partial<Record<string, Readonly<Partial<Record<string, YouShopOffer>>>>>
> = {
  "ampola-de-hidratacao-mousse-flash": {
    "18ml": { code: "1KHF5WDSOGP2AG4O", priceCents: 6090 },
  },
  "botox-line": {
    "1Kg": { code: "SLNGCFMJO4ECD13J", priceCents: 16690 },
  },
  "botox-line-matizador": {
    "1Kg": { code: "ZE4MIBFIBP8JT0JN", priceCents: 17190 },
  },
  "botox-vonix": {
    "1Kg": { code: "QGMEUFLC4GYFB04Q", priceCents: 17390 },
  },
  "botox-vonix-matizador": {
    "1Kg": { code: "G1M1PYWDZZYHA9VH", priceCents: 17990 },
  },
  "combo-botox-line-shampoo": {
    "Combo": { code: "T6C2BO9VI5OIFIC1", priceCents: 19551 },
  },
  "combo-botox-vonix-nutri-repair": {
    "Combo": { code: "UGCZWRQ0EIEEJJVR", priceCents: 23590 },
  },
  "combo-botox-vonix-shampoo": {
    "Combo": { code: "BZKW737HOQOHHNGJ", priceCents: 20121 },
  },
  "combo-diamond-defrizante": {
    "Combo": { code: "VWVIDXK41IFTDSWL", priceCents: 25052 },
  },
  "combo-diamond-shampoo-anti-residuo": {
    "Combo": { code: "8UUT2ILWWQPDDQWJ", priceCents: 19266 },
  },
  "combo-finalizacao-serum": {
    "Combo": { code: "PW7JHJUXHJHO3PTY", priceCents: 20872 },
  },
  "combo-fio-de-luz-completo": {
    "Combo": { code: "ODHPD5GUZL3O4OV0", priceCents: 28990 },
  },
  "combo-fio-de-luz-serum": {
    "Combo": { code: "DV9YVOJSM1IZLGCN", priceCents: 28947 },
  },
  "combo-fio-de-luz-shampoo-anti-residuo": {
    "Combo": { code: "9FYT8MBGSKLI6WNM", priceCents: 22590 },
  },
  "combo-lift-em-gel-serum": {
    "Combo": { code: "SJ1IF774XBQLIQ4U", priceCents: 28947 },
  },
  "combo-lift-em-gel-shampoo": {
    "Combo": { code: "PG0RYMULAO44O5WP", priceCents: 20596 },
  },
  "combo-queratina-em-massa-shampoo": {
    "Combo": { code: "TZZTDGYX11RZY12M", priceCents: 15590 },
  },
  "combo-selagem-diamond-shampoo": {
    "Combo": { code: "M6XCLTBGJZHCQZHD", priceCents: 20596 },
  },
  "combo-sos-queratina-cistina": {
    "Combo": { code: "JKU7SBPIPJOHUQJG", priceCents: 20990 },
  },
  "combo-sos-reconstrutor": {
    "Combo": { code: "G86VM5YJ694LDILS", priceCents: 26762 },
  },
  "combo-sos-shampoo": {
    "Combo": { code: "L8YFCK8YBJILPM8B", priceCents: 20026 },
  },
  "combo-special-matizadora-reparador": {
    "Combo": { code: "S7QSENMTLYEW7LPI", priceCents: 27332 },
  },
  "combo-special-matizadora-shampoo": {
    "Combo": { code: "T7NBA5DFMJX5SKP5", priceCents: 20596 },
  },
  "combo-teia-anabolizante-shampoo": {
    "Combo": { code: "MQSSAOBCGR1GNISZ", priceCents: 17390 },
  },
  "combo-teia-coco-nutri-shampoo": {
    "Combo": { code: "TFGSKDKBWYPLSEEV", priceCents: 17390 },
  },
  "combo-trio-shampoos-hidratantes": {
    "Combo": { code: "3DKOCK2POWMBPJFX", priceCents: 20207 },
  },
  "defrizante": {
    "1L": { code: "SEIT8PIYCTGYDSHV", priceCents: 8790 },
    "300ml": { code: "EV2FJJ9T3RJUEEEU", priceCents: 6090 },
  },
  "kit-matizador-shampoo-e-mascara": {
    "Kit": { code: "LWF1IR4RCS6CEXF7", priceCents: 7090 },
  },
  "mascara-efeito-teia-anabolizante": {
    "1Kg": { code: "UX8KYMLOLB67EMPA", priceCents: 10090 },
  },
  "mascara-efeito-teia-coco-nutri": {
    "1Kg": { code: "5CZB6VTYDFDUFBA2", priceCents: 10090 },
  },
  "mascara-efeito-teia-desmaia-cabelo": {
    "1Kg": { code: "PENQHPAIY6AJWI8A", priceCents: 10090 },
  },
  "mascara-efeito-teia-tomba-cabelo": {
    "1Kg": { code: "COBHKJY7BZXDBMH7", priceCents: 10090 },
  },
  "mascara-hidratacao-lanolina-karite": {
    "960g": { code: "XVGEKR1W9Q8MWXHI", priceCents: 8790 },
  },
  "mascara-hidratante-argan-cartamo-coco": {
    "1Kg": { code: "BJTWW5F4NDIZSYV1", priceCents: 10090 },
  },
  "mascara-reparacao-nutri-repair": {
    "1Kg": { code: "9QWKOZ2JUATZP3QB", priceCents: 8790 },
  },
  "mousse-flash": {
    "500ml": { code: "8EXHOXYFGWCHWX7R", priceCents: 9590 },
  },
  "progressiva-diamond": {
    "1L": { code: "ODAJY3QAKI3PKOB6", priceCents: 16490 },
  },
  "progressiva-fio-de-luz": {
    "1L": { code: "04W3W4NPON34NRRK", priceCents: 17990 },
  },
  "progressiva-lift-em-gel": {
    "1L": { code: "EBEUQZVCOCGVLKTE", priceCents: 16590 },
  },
  "progressiva-vonix-special-matizadora": {
    "1L": { code: "H38CBPNH3OLVCATP", priceCents: 17890 },
  },
  "queratina-com-cistina-molecular": {
    "35ml": { code: "LBG53KWPDEFROLGP", priceCents: 6090 },
  },
  "queratina-em-gel": {
    "500ml": { code: "ADJDHPMGRWNHGGCN", priceCents: 7090 },
  },
  "queratina-em-massa": {
    "500g": { code: "ISGZRMVPPCWQWPIF", priceCents: 7090 },
  },
  "reparador-de-pontas": {
    "60ml": { code: "RPWCIXDLCEA6CMU4", priceCents: 7090 },
  },
  "selagem-termica-diamond": {
    "1 L": { code: "MO1TIBBRLDYRFS1J", priceCents: 14590 },
  },
  "serum-argan": {
    "60ml": { code: "N75NJXGTR6UO5IKT", priceCents: 8790 },
  },
  "shampoo-diamond-anti-residuo": {
    "1L": { code: "U8QX2HGIIEFJEC1O", priceCents: 7090 },
  },
  "shampoo-fio-de-luz-anti-residuo": {
    "1L": { code: "JRUIQARE7OKVMXCZ", priceCents: 7090 },
  },
  "shampoo-hidratante-anabolizante-capilar": {
    "1L": { code: "5GCOEIRNASZTYYE8", priceCents: 7090 },
  },
  "shampoo-hidratante-dep-toc": {
    "1L": { code: "6DRKGNXOFSYAZWBX", priceCents: 7090 },
  },
  "shampoo-hidratante-desmaia-cabelo": {
    "1L": { code: "ILRCURHEKY1QDRXV", priceCents: 7090 },
  },
  "sos-reconstrutor-capilar": {
    "1000ml": { code: "THKAVDTTR6Y37M2T", priceCents: 17190 },
  },
};

export function useYouShopCheckout(
  slug: string,
  label: string,
  price: number,
  canBuyDirectly: boolean,
): string | undefined {
  const search = useLocation({ select: (location) => location.searchStr });
  const [savedCampaign, setSavedCampaign] = useState("");
  const [hasAffiliate, setHasAffiliate] = useState(false);
  useEffect(() => {
    setHasAffiliate(Boolean(getRef()));
    try {
      setSavedCampaign(sessionStorage.getItem(CAMPAIGN_KEY) ?? "");
    } catch {
      setSavedCampaign("");
    }
  }, [search]);

  const offer = YOUSHOP_OFFERS[slug]?.[label];
  if (!canBuyDirectly || !offer || offer.priceCents !== Math.round(price * 100)) return;
  if (hasAffiliate || normalizeRef(new URLSearchParams(search).get("ref"))) return;

  const checkout = new URL(offer.code, "https://pay.youshop.com.br/");
  const campaign = campaignFrom(search);
  checkout.search = (campaign.size ? campaign : campaignFrom(savedCampaign)).toString();
  return checkout.href;
}
