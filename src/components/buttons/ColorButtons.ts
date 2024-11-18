import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { buttonBaseStyles } from '../../styles/button-styles';

@customElement('color-buttons')
export class ColorButtons extends LitElement {
  @property({ type: Boolean }) enabled = true;

  private colors = [
    { color: 'red', command: 'RED' },
    { color: 'green', command: 'GREEN' },
    { color: 'yellow', command: 'YELLOW' },
    { color: 'blue', command: 'BLUE' }
  ];

  private handleClick(command: string) {
    this.dispatchEvent(new CustomEvent('color-click', {
      detail: { command },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    if (!this.enabled) return '';

    return html`
      <div class="grid-container-color_btn">
        ${this.colors.map(({ color, command }) => html`
          <button 
            class="btn-color ripple" 
            style="background-color: ${color}; height: calc(var(--remotewidth) / 12);" 
            @click=${() => this.handleClick(command)}>
          </button>
        `)}
      </div>
    `;
  }

  static styles = buttonBaseStyles;
}