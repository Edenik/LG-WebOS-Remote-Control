import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { keypadStyles } from '../../styles/button-styles';

@customElement('key-pad')
export class KeyPad extends LitElement {
  private handleNumberClick(num: number) {
    this.dispatchEvent(new CustomEvent('number-click', {
      detail: { number: num },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <div class="grid-container-keypad">
        ${[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, null].map((num: number | null) => {
      return num !== null ? html`
            <button class="btn-keypad ripple"
             @click=${() => this.handleNumberClick(num)}>
              ${num}
            </button>`
        : html`<button class="btn-keypad"></button>`
    })}
      </div>
    `;
  }

  static styles = keypadStyles;
}