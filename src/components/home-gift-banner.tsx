import { Link } from "@tanstack/react-router";
import { ArrowRight, CreditCard, QrCode, Truck } from "lucide-react";
import "./home-gift-banner.css";

/** Banner da home: só os produtos que a Vonix vende, em combos. */
export function HomeGiftBanner() {
  return (
    <section className="gift-banner" data-testid="home-gift-banner" aria-label="Combos Vonix Hair para donas de salão">
      <div className="gift-banner-copy">
        <p className="gift-banner-brand font-display">SITE FEITO PARA CABELEIREIRAS</p>
        <h2 className="gift-banner-heading font-display">Combos do salão com <em>até 10% OFF</em></h2>
        <p className="gift-banner-sub">Site feito para quem vive de cabelo: cabeleireiras e donas de salão. Leve a Progressiva Fio de Luz, a mais vendida em São Paulo e Minas Gerais, já com o shampoo anti-resíduo certo: 5% OFF no combo e mais 5% no Pix, direto no preço, sem cupom.</p>
        <ul className="gift-banner-benefits" aria-label="Condições de pagamento e entrega" data-testid="home-banner-benefits">
          <li><QrCode aria-hidden="true" /><strong>5% OFF no combo + 5% no Pix</strong></li>
          <li><CreditCard aria-hidden="true" /><span>Até <strong>6x sem juros</strong></span></li>
          <li><Truck aria-hidden="true" /><strong>Frete grátis</strong></li>
        </ul>
        <Link to="/loja" search={{ tiposProduto: "Kits" }} className="gift-banner-cta">Quero o meu combo <ArrowRight aria-hidden="true" /></Link>
      </div>
      <img className="gift-banner-photo" src="/images/products/combo-fio-de-luz-completo.jpg" alt="Combo Fio de Luz completo: progressiva, shampoo anti-resíduo e Repair" width={1000} height={1000} fetchPriority="high" />
    </section>
  );
}
