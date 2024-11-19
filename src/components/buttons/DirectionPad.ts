import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { renderShape } from '../../common/media-renderer';
import { directionPadStyles } from '../../styles/button-styles';

@customElement('direction-pad')
export class DirectionPad extends LitElement {
  @property({ type: String }) backgroundColor = '';

  private dispatchButtonEvent(button: string) {
    this.dispatchEvent(new CustomEvent('button-click', {
      detail: { button },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <div class="grid-container-cursor">
        ${renderShape("direction")}
        <button class="btn ripple item_sound" 
          @click=${() => this.dispatchEvent(new CustomEvent('sound-click'))}>
          <ha-icon icon="mdi:speaker"/>
        </button>
        <button class="btn ripple item_up" style="background-color: transparent;" 
          @click=${() => this.dispatchButtonEvent("UP")}>
          <ha-icon icon="mdi:chevron-up"/>
        </button>
        <button class="btn ripple item_input" 
          @click=${() => this.dispatchEvent(new CustomEvent('input-click'))}>
          <ha-icon icon="mdi:import"/>
        </button>
        <button class="btn ripple item_2_sx" style="background-color: transparent;" 
          @click=${() => this.dispatchButtonEvent("LEFT")}>
          <ha-icon icon="mdi:chevron-left"/>
        </button>
        <div class="ok_button ripple item_2_c" 
          style="border: solid 2px ${this.backgroundColor}" 
          @click=${() => this.dispatchButtonEvent("ENTER")}>
          OK
        </div>
        <button class="btn ripple item_right" style="background-color: transparent;" 
          @click=${() => this.dispatchButtonEvent("RIGHT")}>
          <ha-icon icon="mdi:chevron-right"/>
        </button>
        <button class="btn ripple item_back" 
          @click=${() => this.dispatchButtonEvent("BACK")}>
          <ha-icon icon="mdi:undo-variant"/>
        </button>
        <button class="btn ripple item_down" style="background-color: transparent;" 
          @click=${() => this.dispatchButtonEvent("DOWN")}>
          <ha-icon icon="mdi:chevron-down"/>
        </button>
        <button class="btn ripple item_exit" 
          @click=${() => this.dispatchButtonEvent("EXIT")}>
          EXIT
        </button>
      </div>
    `;
  }

  static styles = directionPadStyles;
}