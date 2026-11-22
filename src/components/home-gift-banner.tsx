import { Link } from "@tanstack/react-router";
import { ArrowRight, Barcode, CreditCard, QrCode, Truck } from "lucide-react";
import "./home-gift-banner.css";

/** One fixed campaign; text remains readable and selectable on every screen. */
export function HomeGiftBanner() {
  return (
    <section className="gift-banner" data-testid="home-gift-banner" aria-label="Todos os pedidos acompanham sacolinha Vonix">
      <img className="gift-banner-photo" src="/images/banners/vonix-sacolinhas-fixo.webp" alt="Mulher com o queixo apoiado nas duas mãos e sacolinhas Vonix de Banana e Mel, Coco Nutri e Whey Protein à frente" width={1942} height={809} fetchPriority="high" />
      <div className="gift-banner-shade" aria-hidden="true" />
      <div className="gift-banner-copy">
        <p className="gift-banner-brand font-display">VONIX <span>HAIR</span></p>
        <h2 className="gift-banner-heading font-display">Seu pedido<span className="gift-banner-break"> </span>já vai com<span className="gift-banner-break"> </span><em>sacolinha.</em></h2>
        <ul className="gift-banner-benefits" aria-label="Condições de pagamento e entrega" data-testid="home-banner-benefits">
          <li className="gift-banner-pix"><QrCode aria-hidden="true" /><strong>5% OFF no Pix</strong></li>
          <li><CreditCard aria-hidden="true" /><span>Até <strong>6x sem juros</strong> no cartão</span></li>
          <li><Truck aria-hidden="true" /><strong>Frete grátis</strong></li>
          <li><Barcode aria-hidden="true" /><span>Pagamento no <strong>boleto</strong></span></li>
        </ul>
        <Link to="/loja" className="gift-banner-cta">Conheça os produtos <ArrowRight aria-hidden="true" /></Link>
      </div>
      <p className="gift-banner-terms">Sacolinha inclusa em todos os pedidos. Desconto no Pix para itens sem outra oferta.</p>
    </section>
  );
}
