import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { buttonBaseStyles } from '../../styles/button-styles';
import { SoundButton as SoundButtonType } from '../../types/buttons';

@customElement('sound-button')
export class SoundButton extends LitElement {
    @property({ type: Object }) button!: SoundButtonType;
    @property({ type: String }) currentOutput = '';
    @property({ type: Boolean }) showText = false;

    private handleClick() {
        this.dispatchEvent(new CustomEvent('sound-select', {
            detail: { output: this.button.output },
            bubbles: true,
            composed: true
        }));
    }

    render() {
        const isActive = this.currentOutput === this.button.output;
        const baseClass = isActive ? 'btn_sound_on' : 'btn_sound_off';
        const widthClass = this.showText ? 'bnt_sound_text_width' : 'bnt_sound_icon_width';

        return html`
      <button 
        class="${baseClass} ${this.button.class} ${widthClass} ${!isActive ? 'ripple overlay' : ''}"
        @click=${this.handleClick}
      >
        ${this.showText ? this.button.text : (
                typeof this.button.icon === 'string'
                    ? html`<ha-icon class="icon_source" icon="${this.button.icon}">`
                    : this.button.icon
            )}
      </button>
    `;
    }

    static styles = buttonBaseStyles;
}