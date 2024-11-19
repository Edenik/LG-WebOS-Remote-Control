import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { renderButtonMedia } from '../../common/media-renderer';
import { buttonBaseStyles } from '../../styles/button-styles';
import { ButtonAction, ButtonConfig } from '../../types/buttons';
import { isRTL } from '../../utils/text-helpers';

@customElement('custom-button')
export class CustomButton extends LitElement {
  @property({ type: Object }) button!: ButtonConfig;
  @property({ type: Boolean }) isCurrentSource = false;

  private handleClick() {
    this.dispatchEvent(new CustomEvent('button-click', {
      detail: { button: this.button },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    const willRenderText = Boolean(this.button.text);
    const isRtl = willRenderText && isRTL(this.button.text);

    return html`
      <button 
        class="btn_source ${isRtl ? 'rtl' : ''} ripple ${this.isCurrentSource ? 'active' : ''}"
        style="${willRenderText && this.button.text_color ? `color: ${this.button.text_color};` : ''}"
        title="${this.button.tooltip ?? ''}"
        @click=${this.handleClick}
        ?disabled=${this.button.action === ButtonAction.script && !this.button.script_id ||
      this.button.action === ButtonAction.source && !this.button.source}
      >
        <span>
          ${renderButtonMedia(this.button)}
          ${this.button.text ?? ""}
        </span>
      </button>
    `;
  }

  static styles = buttonBaseStyles;
}