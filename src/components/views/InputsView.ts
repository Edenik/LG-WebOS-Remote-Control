import { HassEntity } from 'home-assistant-js-websocket';
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { renderShape } from '../../common/media-renderer';
import { inputViewStyles } from '../../styles/view-styles';

@customElement('inputs-view')
export class InputsView extends LitElement {
  @property({ type: Object }) stateObj!: HassEntity;

  private handleBack() {
    this.dispatchEvent(new CustomEvent('view-close'));
  }

  private handleSourceSelect(source: string) {
    this.dispatchEvent(new CustomEvent('source-select', {
      detail: { source },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <div class="grid-container-input">
        ${renderShape("input")}
        <button class="ripple bnt-input-back" @click=${this.handleBack}>
          <ha-icon icon="mdi:undo-variant"/>
        </button>
        <p class="source_text"><b>SOURCE</b></p>
        <div class="grid-item-input">
          ${this.renderSourceList()}
        </div>
      </div>
    `;
  }

  private renderSourceList() {
    return this.stateObj.attributes.source_list.map(source => html`
      <button 
        class="${this.stateObj.attributes.source === source ? 'btn-input-on' : 'btn-input ripple overlay'}"
        @click=${() => {
        this.handleSourceSelect(source);
        this.handleBack();
      }}
      >
        ${source}
      </button>
    `);
  }

  static styles = inputViewStyles;
}