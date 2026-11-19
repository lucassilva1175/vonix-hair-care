const steps = [
  "Apresente seu perfil gratuitamente.",
  "Se o envio for confirmado, guarde o código de acompanhamento.",
  "Consulte o andamento pelo código, sem prazo ou aprovação garantidos.",
];

export function AffiliateApplicationStepsPreview() {
  return (
    <section
      aria-labelledby="application-steps-preview-title"
      data-testid="vonix-c66-application-steps"
      className="border-b border-border bg-background px-5 py-4"
    >
      <div className="mx-auto max-w-5xl">
        <h2 id="application-steps-preview-title" className="font-display text-2xl text-primary">
          Como funciona sua candidatura
        </h2>
        <ol className="mt-3 grid min-w-0 gap-3 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step} className="flex min-w-0 items-start gap-3 border-l border-border pl-3">
              <span aria-hidden="true" className="font-display text-3xl leading-none text-primary">
                {index + 1}
              </span>
              <p className="text-xs leading-relaxed text-foreground">{step}</p>
            </li>
          ))}
        </ol>
        <a
          href="/consultar-candidatura"
          className="mt-2 inline-flex min-h-11 items-center text-xs font-semibold text-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          Já se inscreveu? Acompanhe sua candidatura
        </a>
      </div>
    </section>
  );
}