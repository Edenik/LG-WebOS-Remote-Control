import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { LGRemoteControlConfig } from '../../types/config';

@customElement('appearance-config')
export class AppearanceConfig extends LitElement {
    @property({ type: Object }) config!: LGRemoteControlConfig;

    private _onChange(ev: Event) {
        const target = ev.target as HTMLInputElement;
        const value = target.type === 'number' ? parseFloat(target.value) : target.value;

        const newConfig = {
            ...this.config,
            dimensions: {
                ...this.config.dimensions,
                [target.name]: value
            }
        };

        this._dispatchConfigChange(newConfig);
    }

    private _onColorChange(ev: Event) {
        const target = ev.target as HTMLInputElement;
        const newConfig = {
            ...this.config,
            colors: {
                ...this.config.colors,
                [target.name]: target.value
            }
        };

        this._dispatchConfigChange(newConfig);
    }

    private _clearColor(colorName: string) {
        const newConfig = {
            ...this.config,
            colors: {
                ...this.config.colors
            }
        };
        delete newConfig.colors[colorName];

        this._dispatchConfigChange(newConfig);
    }

    private _dispatchConfigChange(config: LGRemoteControlConfig) {
        this.dispatchEvent(new CustomEvent('config-changed', {
            detail: { config },
            bubbles: true,
            composed: true,
        }));
    }

    protected render() {
        return html`
      <div class="card-config">
        <div class="section">
          <h3>Dimensions</h3>
          <div class="field">
            <ha-slider
              name="scale"
              label="Card Scale"
              min="0.5"
              max="1.5"
              step="0.1"
              .value=${this.config.dimensions?.scale || 1}
              @change=${this._onChange}
              pin
            ></ha-slider>
            <span class="slider-value">${this.config.dimensions?.scale || 1}</span>
          </div>

          <div class="field">
            <ha-slider
              name="border_width"
              label="Border Width"
              min="1"
              max="5"
              step="1"
              .value=${parseInt(this.config.dimensions?.border_width || '1')}
              @change=${this._onChange}
              pin
            ></ha-slider>
            <span class="slider-value">${this.config.dimensions?.border_width || '1px'}</span>
          </div>
        </div>

        <div class="section">
          <h3>Colors</h3>
          <div class="color-fields">
            <div class="color-field">
              <label>Background:</label>
              <div class="color-input-container">
                <input 
                  type="color"
                  name="background"
                  .value=${this.config.colors?.background || '#ffffff'}
                  @change=${this._onColorChange}
                />
                <ha-icon-button
                  @click=${() => this._clearColor('background')}
                  .path=${'M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z'}
                ></ha-icon-button>
              </div>
            </div>

            <div class="color-field">
              <label>Buttons:</label>
              <div class="color-input-container">
                <input 
                  type="color"
                  name="buttons"
                  .value=${this.config.colors?.buttons || '#f0f0f0'}
                  @change=${this._onColorChange}
                />
                <ha-icon-button
                  @click=${() => this._clearColor('buttons')}
                  .path=${'M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z'}
                ></ha-icon-button>
              </div>
            </div>

            <div class="color-field">
              <label>Text:</label>
              <div class="color-input-container">
                <input 
                  type="color"
                  name="text"
                  .value=${this.config.colors?.text || '#000000'}
                  @change=${this._onColorChange}
                />
                <ha-icon-button
                  @click=${() => this._clearColor('text')}
                  .path=${'M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z'}
                ></ha-icon-button>
              </div>
            </div>

            <div class="color-field">
              <label>Border:</label>
              <div class="color-input-container">
                <input 
                  type="color"
                  name="border"
                  .value=${this.config.colors?.border || '#000000'}
                  @change=${this._onColorChange}
                />
                <ha-icon-button
                  @click=${() => this._clearColor('border')}
                  .path=${'M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z'}
                ></ha-icon-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    }

    static styles = css`
    .card-config {
      padding: 16px;
    }

    .section {
      margin-bottom: 24px;
    }

    h3 {
      margin: 0 0 8px;
      font-size: 16px;
    }

    .field {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
    }

    .slider-value {
      min-width: 40px;
      text-align: right;
    }

    .color-fields {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .color-field {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .color-input-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    input[type="color"] {
      width: 50px;
      height: 32px;
      padding: 0;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
    }
  `;
}