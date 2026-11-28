import { SOLD } from "@/lib/sales";
import type { Product } from "@/lib/store";

/**
 * Prova social em texto, UMA por produto, falando com dona de salão (dor -> solução).
 * Regras (Guia de persuasão da Vonix): só fato do cadastro/rótulo, número de vendas só do relatório (vendas.json),
 * nada de depoimento inventado, nada de "garantido", "100%" ou "cura". "Mais vendida em SP e MG" é informação do dono (24/11/2026).
 */
export type Prova = { dor: string; solucao: string; pontos: string[]; selo?: string };

const MAIS_VENDIDA_SP_MG = "Mais vendida em São Paulo e Minas Gerais";

export const PROVAS: Record<string, Prova> = {
  "progressiva-fio-de-luz": {
    selo: MAIS_VENDIDA_SP_MG,
    dor: "Cliente que sai do salão e volta reclamando do resultado custa caro: retrabalho, tempo perdido e indicação que não vem.",
    solucao: "A Fio de Luz é a progressiva que as donas de salão de São Paulo e Minas Gerais mais pedem. Desliza na aplicação, alinha os fios e deixa o brilho que a cliente mostra para as amigas.",
    pontos: ["Desliza na aplicação: menos esforço da sua equipe", "Realinha, reduz o volume e finaliza com brilho", "Toque macio no resultado", "Vários influenciadores já usam e mostram em vídeo", "Use com o Shampoo Fio de Luz Anti Resíduo: o primeiro passo certo"],
  },
  "progressiva-diamond": {
    dor: "Cabelo poroso é o que mais dá dor de cabeça: absorve irregular e o resultado não fica parelho.",
    solucao: "A Diamond foi pensada para o cabelo poroso: alinha, reduz o volume e entrega acabamento brilhante, com o Shampoo Diamond Anti-Resíduo preparando os fios.",
    pontos: ["Indicada para cabelos porosos", "Redução de volume e alinhamento", "Acabamento brilhante", "Uso profissional, 1 litro"],
  },
  "progressiva-lift-em-gel": {
    dor: "Progressiva líquida escorre, suja a bancada e deixa você sem controle na hora de aplicar.",
    solucao: "A Lift em Gel tem textura em gel: você aplica mecha a mecha com pincel e controla onde o produto vai. Mais precisão, menos desperdício.",
    pontos: ["Textura em gel: aplicação controlada", "Realinhadores, hidratantes e reconstrutores", "Redução de volume e alinhamento", "Uso profissional, 1 litro"],
  },
  "progressiva-vonix-special-matizadora": {
    dor: "Loira que alisa e fica com reflexo amarelado volta reclamando, e você refaz de graça.",
    solucao: "A Special Matizadora alinha e corrige o reflexo amarelado no mesmo passo, em sistema declarado sem formol. Menos um serviço para fazer, mais uma cliente fidelizada.",
    pontos: ["Alinhamento e correção de reflexos amarelados em um só passo", "Sistema declarado sem formol", "Faça sempre o teste de mecha, o pigmento age rápido em cabelo claro", "Uso profissional, 1 litro"],
  },
  "botox-vonix": {
    dor: "Botox que pesa, que não controla o frizz ou que deixa cheiro forte afasta a cliente do serviço.",
    solucao: "O Botox Vonix é o que o salão pede de novo: reduz o volume, controla o frizz e entrega maciez e brilho, em fórmula apresentada sem formol e derivados.",
    pontos: ["Controle de volume e frizz", "Maciez e brilho no acabamento", "Apresentação sem formol e derivados", "Vários influenciadores já usam e mostram em vídeo", "Pote de 1 kg: rende vários atendimentos"],
  },
  "botox-vonix-matizador": {
    dor: "Fazer botox e depois matizar é dois passos, mais tempo de cadeira e mais custo.",
    solucao: "O Botox Vonix Matizador alinha e matiza fios claros no mesmo passo, com pigmentação azul e violeta, em base declarada sem formol.",
    pontos: ["Alinha e ajusta reflexos juntos", "Base declarada sem formol", "Faça o teste de mecha antes da aplicação completa", "Pote de 1 kg"],
  },
  "botox-line": {
    dor: "Você quer um botox de redução de volume com bom custo para o dia a dia do salão.",
    solucao: "A Botox Line é a máscara profissional de redução de volume em pote de 1 kg, com a assinatura Vonix. Atenção: este é o botox de tampa azul e contém formol.",
    pontos: ["Contém formol (pote de tampa azul)", "Redução de volume", "Pote de 1 kg", "Siga o rótulo: pausa, temperatura e frequência"],
  },
  "sos-reconstrutor-capilar": {
    dor: "Cabelo quebradiço, sem corpo, que pede socorro depois de química puxa a cliente para outro salão.",
    solucao: "O SOS Reconstrutor Capilar traz whey protein, pantenol, óleo de rícino e vitamina A: nutrição, fortalecimento e recuperação cosmética do comprimento em 1 litro.",
    pontos: ["Whey protein, pantenol e óleo de rícino", "Nutrição e fortalecimento do comprimento", "1 litro: dá para muitas aplicações", "Aplique mecha a mecha, deixe agir de 15 a 20 minutos"],
  },
  "shampoo-fio-de-luz-anti-residuo": {
    dor: "Progressiva aplicada em cabelo com acúmulo não rende o que prometeu, e a culpa cai em cima de você.",
    solucao: "O Shampoo Fio de Luz Anti Resíduo remove os resíduos e prepara os fios para a etapa seguinte. Não substitui a progressiva: é o primeiro passo certo para ela render o melhor trabalho.",
    pontos: ["Remove resíduos e acúmulos", "Prepara os fios para a progressiva", "1 litro", "Repita a aplicação se houver muito acúmulo"],
  },
  "shampoo-diamond-anti-residuo": {
    dor: "Cabelo com acúmulo não aceita bem a progressiva ou a selagem, e o resultado fica irregular.",
    solucao: "O Shampoo Diamond Anti Resíduo tem textura cremosa e faz a limpeza profunda que prepara os fios para o tratamento ou alisamento.",
    pontos: ["Limpeza profunda, textura cremosa", "Primeira etapa da linha Diamond", "1 litro", "Siga direto para o tratamento"],
  },
  defrizante: {
    dor: "Você faz um serviço lindo e a cliente sai com frizz no primeiro dia de chuva.",
    solucao: "O Defrizante controla o frizz, dá brilho e traz proteção térmica declarada pelo fabricante. É o finalizador que fecha o serviço antes da secagem.",
    pontos: ["Controle de frizz e brilho", "Proteção térmica declarada pelo fabricante", "Antes da secagem, nos fios úmidos", "300 ml ou 1 litro"],
  },
  "serum-argan": {
    dor: "Finalizador que pesa deixa o cabelo oleoso e a cliente não compra de novo.",
    solucao: "O Sérum Argan tem óleo de argan e base leve: 1 ou 2 gotas dão brilho e acabamento sem peso. Rende muito e a cliente leva para casa.",
    pontos: ["Brilho e nutrição do comprimento", "Toque leve, sem pesar", "1 a 2 gotas já bastam", "Frasco de 60 ml"],
  },
  "reparador-de-pontas": {
    dor: "Ponta ressecada estraga a apresentação do melhor corte.",
    solucao: "O Reparador de Pontas alinha e suaviza as pontas com 1 ou 2 gotas, sem enxágue, com filtro UV citado pelo fabricante.",
    pontos: ["Pontas alinhadas e toque macio", "Sem enxágue", "Filtro UV citado pelo fabricante", "Frasco de 60 ml"],
  },
  "queratina-em-massa": {
    dor: "Cabelo que já passou por muita química fica sem massa e sem brilho.",
    solucao: "A Queratina em Massa traz queratina hidrolisada, aminoácidos e colágeno para a reconstrução do comprimento danificado, com brilho e maciez.",
    pontos: ["Queratina hidrolisada, aminoácidos e colágeno", "Reconstrução, brilho e maciez", "500 g", "Use no dia de reconstrução do cronograma"],
  },
  "selagem-termica-diamond": {
    dor: "Salão que capricha precisa de uma selagem profissional em que possa confiar no resultado do serviço.",
    solucao: "A Selagem Térmica Diamond é a selagem profissional da linha Diamond, em 1 litro, para o salão que capricha.",
    pontos: ["Uso profissional, linha Diamond", "1 litro", "Combine com o Shampoo Diamond Anti-Resíduo", "Siga o rótulo da versão e do lote"],
  },
};

const POR_CATEGORIA: Record<string, { dor: string; solucao: string }> = {
  quimica: { dor: "Química boa é a que a cliente elogia e indica.", solucao: "Produto de uso profissional da Vonix para o seu salão entregar um serviço bonito e voltar a ser lembrado." },
  hidratacao: { dor: "Cabelo ressecado é cliente insatisfeita.", solucao: "Linha de hidratação da Vonix para manter o cronograma da cliente em dia e vender mais manutenção." },
  lavatorio: { dor: "O lavatório é onde o serviço começa bem ou mal.", solucao: "Shampoo profissional da Vonix para preparar os fios e deixar a base certa para o tratamento." },
  finalizadores: { dor: "O acabamento é o que a cliente leva para casa e mostra.", solucao: "Finalizador da Vonix para fechar o serviço com brilho e maciez, e vender mais no balcão." },
  especiais: { dor: "Cabelo muito castigado pede um cuidado especial.", solucao: "Tratamento especial da Vonix para recuperar o comprimento com nutrição e fortalecimento." },
  kits: { dor: "Vender produto solto dá trabalho e deixa a cliente sem rotina.", solucao: "Combo pronto da Vonix: os produtos que se completam, juntos em um só pedido, no melhor preço." },
};

export type ProvaView = Prova & { nome: string; quantidade: string; vendidos: number };

/** Monta a prova de um produto: dados reais (nome, tamanhos, vendidos) + texto da dor e da solução. */
export function provaDe(p: Product): ProvaView {
  const base = PROVAS[p.slug];
  const cat = POR_CATEGORIA[p.slug.startsWith("combo-") ? "kits" : p.category] ?? POR_CATEGORIA["quimica"]!;
  const vendidos = SOLD[p.slug] ?? 0;
  const quantidade = p.variants.map((v) => v.label).join(" ou ");
  const pontos = base?.pontos ?? [p.short, `Quantidade: ${quantidade}`, "Frete grátis em SP e MG", "Pix com 5% OFF nos itens sem outra oferta"];
  const prova: Prova = base ?? { dor: cat.dor, solucao: cat.solucao, pontos };
  const selo = base?.selo ?? (vendidos >= 10 ? `${vendidos} unidades vendidas` : undefined);
  return { ...prova, ...(selo ? { selo } : {}), nome: p.name, quantidade, vendidos };
}
