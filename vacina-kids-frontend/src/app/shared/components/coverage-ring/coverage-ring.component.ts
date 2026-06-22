import { Component, computed, input } from '@angular/core';

/** Um segmento colorido do donut (status → arco proporcional). */
interface DonutSeg {
  color: string;
  dash: string;
  offset: string;
}

/**
 * Donut de cobertura em **SVG puro** (design §dashboard): anel de fundo + 4
 * segmentos proporcionais (Aplicada/Pendente/Atrasada/Futura) e o % "em dia"
 * ao centro. `stroke-dasharray/offset` + `rotate(-90)`. Apresentação pura.
 */
@Component({
  selector: 'app-coverage-ring',
  template: `
    <svg
      class="ring"
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 200 200"
      role="img"
      [attr.aria-label]="'Cobertura em dia ' + pct() + '%'"
    >
      <circle class="ring__track" cx="100" cy="100" r="80" fill="none" />
      @for (s of segs(); track $index) {
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke-width="22"
          stroke-linecap="round"
          [style.stroke]="s.color"
          [attr.stroke-dasharray]="s.dash"
          [attr.stroke-dashoffset]="s.offset"
          transform="rotate(-90 100 100)"
        />
      }
      <text class="ring__pct" x="100" y="98">{{ pct() }}<tspan class="ring__sign">%</tspan></text>
      <text class="ring__cap" x="100" y="124">em dia</text>
    </svg>
  `,
  styles: `
    .ring {
      display: block;
    }
    .ring__track {
      stroke: #f2eee4;
      stroke-width: 22;
    }
    .ring__pct {
      font-family: 'Poppins', sans-serif;
      font-size: 42px;
      font-weight: 700;
      fill: var(--vk-text);
      text-anchor: middle;
    }
    .ring__sign {
      font-size: 22px;
    }
    .ring__cap {
      font-size: 15px;
      fill: var(--vk-text-3);
      text-anchor: middle;
    }
  `,
})
export class CoverageRingComponent {
  /** % "em dia" exibido ao centro. */
  readonly percent = input.required<number>();
  readonly aplicadas = input(0);
  readonly pendentes = input(0);
  readonly atrasadas = input(0);
  readonly futuras = input(0);
  readonly size = input(150);

  /** circunferência do raio 80 no viewBox 200×200. */
  private readonly circ = 2 * Math.PI * 80;

  readonly pct = computed(() => Math.max(0, Math.min(100, Math.round(this.percent()))));

  /** 4 segmentos proporcionais, com pequeno gap para os cantos arredondados. */
  readonly segs = computed<DonutSeg[]>(() => {
    const dados = [
      { color: '#abc270', value: this.aplicadas() },
      { color: '#fec868', value: this.pendentes() },
      { color: '#fda769', value: this.atrasadas() },
      { color: '#cfe0a8', value: this.futuras() },
    ];
    const total = dados.reduce((acc, d) => acc + d.value, 0) || 1;
    const gap = 6;
    let acc = 0;
    const out: DonutSeg[] = [];
    for (const d of dados) {
      if (d.value <= 0) {
        continue;
      }
      const len = (d.value / total) * this.circ;
      out.push({
        color: d.color,
        dash: `${Math.max(len - gap, 0.01)} ${this.circ}`,
        offset: `${-acc}`,
      });
      acc += len;
    }
    return out;
  });
}
