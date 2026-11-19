import { Truck } from "lucide-react";

/** Aviso simples de frete e prazo, no carrinho e no checkout (sem comemoração, só a informação). */
export function PrazoFrete({ className = "" }: { className?: string }) {
  return (
    <p data-testid="prazo-frete" className={`flex items-center gap-2 text-small font-medium text-[#2c6e55] ${className}`}>
      <Truck className="h-4 w-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
      Frete grátis · entrega de 3 a 5 dias úteis
    </p>
  );
}
