import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { CEP_INVALIDO_MSG, cepAtendido } from "@/lib/free-shipping-region";
import { getSavedCep, maskCep, saveCep } from "@/lib/store";

/** "Entregamos no seu CEP?": resposta na hora, sem cálculo de frete, para ninguém montar o pedido e só descobrir no carrinho. */
export function CepCheck({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  const [cep, setCep] = useState("");
  useEffect(() => {
    const saved = getSavedCep();
    if (saved) setCep(saved);
  }, []);
  const digits = cep.replace(/\D/g, "");
  const ok = digits.length === 8 ? cepAtendido(digits) : null;
  return (
    <div className={`${compact ? "px-1" : "rounded-xl border border-border bg-white p-3"} ${className}`} data-testid="cep-check">
      <label className={`flex items-center gap-2 font-semibold ${compact ? "text-small" : "text-body"}`} htmlFor="cep-check-input">
        <MapPin className="h-4 w-4" aria-hidden="true" /> Entregamos no seu CEP?
      </label>
      <input
        id="cep-check-input"
        inputMode="numeric"
        autoComplete="postal-code"
        placeholder="Digite o CEP (00000-000)"
        value={cep}
        onChange={(e) => {
          const v = maskCep(e.target.value);
          setCep(v);
          if (cepAtendido(v)) saveCep(v);
        }}
        className={`mt-2 w-full rounded-full border border-border bg-background px-4 text-body ${compact ? "h-10" : "h-11"}`}
      />
      {ok === true && <p className="mt-2 text-small font-medium text-emerald-700" role="status">Confira o prazo de entrega para esse CEP no carrinho.</p>}
      {ok === false && <p className="mt-2 text-small font-medium text-red-700" role="status">{CEP_INVALIDO_MSG}</p>}
      {ok === null && <p className="mt-2 text-small text-muted-foreground">Entregamos para todo o Brasil.</p>}
    </div>
  );
}
