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
        <ul className="gift-banner-benefits" aria-label="Condições de pagamento e entrega" data-testid="home-banner-benefits">
          <li><QrCode aria-hidden="true" /><strong>5% OFF no combo + 5% no Pix</strong></li>
          <li><CreditCard aria-hidden="true" /><span>Até <strong>6x sem juros</strong></span></li>
          <li><Truck aria-hidden="true" /><strong>Frete grátis</strong></li>
        </ul>
        <Link to="/loja" search={{ tiposProduto: "Kits" }} className="gift-banner-cta">Quero o meu combo <ArrowRight aria-hidden="true" /></Link>
      </div>
      <div className="gift-banner-photos" data-testid="home-banner-photos">
        <img className="gift-banner-photo gift-banner-photo-a" src="/images/banner/fio-de-luz.webp" srcSet="/images/banner/fio-de-luz-600.webp 600w, /images/banner/fio-de-luz.webp 1000w" sizes="(min-width:1024px) 46vw, 100vw" alt="Progressiva Fio de Luz da Vonix Hair em uma bancada de salão, com mecha de cabelo liso e brilhante" width={1000} height={1000} fetchPriority="high" />
        <img className="gift-banner-photo gift-banner-photo-b" src="/images/banner/botox-vonix.webp" srcSet="/images/banner/botox-vonix-600.webp 600w, /images/banner/botox-vonix.webp 1000w" sizes="(min-width:1024px) 46vw, 100vw" alt="Máscara Botox Vonix da Vonix Hair em uma bancada de salão, com cabelo liso e brilhante ao fundo" width={1000} height={1000} loading="lazy" />
      </div>
    </section>
  );
}
