import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Components } from '../../../../constants/constants';
import { LGRemoteControlConfig } from '../../../../types/config';

@customElement(Components.EditorColorsConfig)
export class EditorColorsConfig extends LitElement {
  @property({ type: Object }) public config!: LGRemoteControlConfig;

  protected render() {
    const colors = this.config.colors || {};

    return html`
      <div class="field-group">
        <label class="field-label">Colors</label>
        <div class="color-config">
          ${this.renderColorInput('buttons', 'Buttons Color', colors.buttons)}
          ${this.renderColorInput('text', 'Text Color', colors.text)}
          ${this.renderColorInput('background', 'Background Color', colors.background)}
          ${this.renderColorInput('border', 'Border Color', colors.border)}
        </div>
      </div>
    `;
  }

  private renderColorInput(name: string, label: string, value: string | undefined) {
    return html`
      <div class="color-item">
        <span class="color-label">${label}</span>
        <div class="color-input-group">
          <input 
            type="color" 
            class="color-input" 
            name="${name}"
            .value="${value || ''}"
            @input=${this._handleColorChange}
          >
          <ha-icon 
            data-input-name="${name}" 
            icon="mdi:trash-can-outline"
            @click=${this._handleColorClear}
          ></ha-icon>
        </div>
      </div>
    `;
  }

  private _handleColorChange(ev: Event) {
    const target = ev.target as HTMLInputElement;
    const newColors = {
      ...this.config.colors,
      [target.name]: target.value
    };

    this._emitConfigChange(newColors);
  }

  private _handleColorClear(ev: Event) {
    const target = ev.target as HTMLElement;
    const inputName = target.getAttribute('data-input-name');
    if (!inputName) return;

    const newColors = { ...this.config.colors };
    delete newColors[inputName];

    this._emitConfigChange(newColors);
  }

  private _emitConfigChange(colors: Record<string, string>) {
    const newConfig = {
      ...this.config,
      colors
    };

    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    }));
  }

  static styles = css`
    .field-group {
      margin-bottom: 16px;
    }

    .field-label {
      font-weight: 500;
      margin-bottom: 8px;
    }

    .color-config {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      width: 100%;
    }

    .color-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .color-label {
      flex: 1;
    }

    .color-input-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .color-input {
      padding: 4px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      width: 50px;
    }

    ha-icon {
      cursor: pointer;
      opacity: 0.8;
    }

    ha-icon:hover {
      opacity: 1;
    }
  `;
}