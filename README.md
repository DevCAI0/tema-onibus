# tema-onibus

Componente React reutilizável de troca de tema (claro/escuro) com uma transição revelada por uma **máscara animada**: o tema novo aparece dentro da silhueta de um ônibus da Viação Novo Horizonte, que depois cresce até cobrir a tela.

Inspirado no efeito do [elysiajs.com](https://elysiajs.com/), feito com a [View Transitions API](https://developer.mozilla.org/docs/Web/API/View_Transition_API) e `mask` do CSS.

## Stack

- [Vite](https://vite.dev/) + React + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) (estilo `base-nova`)

## Rodando

```bash
npm install
npm run dev
```

## Uso

```tsx
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"

<ThemeProvider defaultTheme="system">
  <ThemeToggle maskSrc="/onibus-mascara.webp" />
</ThemeProvider>
```

| Prop | Padrão | Descrição |
|---|---|---|
| `maskSrc` | obrigatória | WebP/GIF/PNG/SVG com fundo transparente (WebP animado dá bordas suaves); o tema novo aparece pelas partes opacas |
| `duration` | `2200` | Duração total em ms. A máscara fica parada 80% do tempo, então para um GIF que toca uma vez use ≈ *duração do GIF ÷ 0,9* |
| `maskSize` | `30vmax` | Tamanho da máscara enquanto fica parada no centro |
| demais | – | Repassadas ao `<Button>` do shadcn (`variant`, `size`, `className`, `children`…) |

## Como funciona

1. Ao clicar, `document.startViewTransition()` tira uma "foto" da tela atual e aplica o tema novo.
2. A camada nova recebe `mask: url(gif)`: só aparece onde o GIF é opaco, então o tema novo surge no formato do ônibus, que se mexe porque o GIF é animado.
3. Um `@keyframes` aumenta o `mask-size` de `0` → `30vmax` (parado enquanto o GIF toca) → `750vmax`, cobrindo a tela.

Detalhes:

- O GIF é baixado uma vez; cada troca usa um `blob:` URL novo para ele começar sempre do primeiro quadro.
- A máscara é um WebP animado (canal alfa real, sem serrilhado) que toca uma vez só (sem loop), para não "resetar" antes de cobrir a tela.
- Clicar durante a animação pula direto para o final.
- Sem suporte à View Transitions API ou com `prefers-reduced-motion`, o tema troca na hora.
- Um script no `index.html` aplica o tema salvo antes da primeira pintura (sem piscar ao recarregar).

## Créditos

- Ilustrações do ônibus e animação de origem gerada com o Gemini.
