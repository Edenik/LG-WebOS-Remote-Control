import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { buttonBaseStyles } from '../../styles/button-styles';

@customElement('power-button')
export class PowerButton extends LitElement {
    @property({ type: String }) state = 'off';
    @property({ type: String }) mac = '';
    @property({ type: String }) textColor = '';

    private handleClick() {
        if (this.state === 'off') {
            this.dispatchEvent(new CustomEvent('power-on', {
                detail: { mac: this.mac },
                bubbles: true,
                composed: true
            }));
        } else {
            this.dispatchEvent(new CustomEvent('power-off', {
                bubbles: true,
                composed: true
            }));
        }
    }

    render() {
        return html`
      <button class="btn ripple" @click=${this.handleClick}>
        <ha-icon 
          icon="mdi:power" 
          style="color: ${this.state === 'off' ? this.textColor : 'red'};"
        />
      </button>
    `;
    }

    static styles = buttonBaseStyles;
}