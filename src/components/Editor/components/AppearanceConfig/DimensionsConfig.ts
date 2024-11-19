import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Components } from '../../../../constants/constants';
import { LGRemoteControlConfig } from '../../../../types/config';

@customElement(Components.EditorDimenstionsConfig)
export class EditorDimensionsConfig extends LitElement {
    @property({ type: Object }) public config!: LGRemoteControlConfig;

    protected render() {
        const dimensions = this.config.dimensions || {};
        const scale = dimensions.scale || 1;
        const borderWidth = dimensions.border_width ? parseFloat(dimensions.border_width) : 1;

        return html`
      <div class="dimensions-group">
        <div class="slider-group">
          <div class="slider-label">
            <span>Card Scale</span>
            <span class="slider-value">${scale}</span>
          </div>
          <input 
            type="range" 
            min="0.5" 
            max="1.5" 
            step="0.01"
            .value="${scale}"
            name="scale"
            @input=${this._handleDimensionChange}
          >
        </div>

        <div class="slider-group">
          <div class="slider-label">
            <span>Border Width</span>
            <span class="slider-value">${borderWidth}px</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="5" 
            step="1"
            .value="${borderWidth}"
            name="border_width"
            @input=${this._handleDimensionChange}
          >
        </div>
      </div>
    `;
    }

    private _handleDimensionChange(ev: Event) {
        const target = ev.target as HTMLInputElement;
        const value = target.value;
        const name = target.name;

        const newDimensions = {
            ...this.config.dimensions,
            [name]: name === 'border_width' ? `${value}px` : parseFloat(value)
        };

        const newConfig = {
            ...this.config,
            dimensions: newDimensions
        };

        this.dispatchEvent(new CustomEvent('config-changed', {
            detail: { config: newConfig },
            bubbles: true,
            composed: true,
        }));
    }

    static styles = css`
    .dimensions-group {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 16px;
    }

    .slider-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .slider-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .slider-value {
      font-size: 0.9em;
      color: var(--secondary-text-color);
    }

    input[type="range"] {
      width: 100%;
      -webkit-appearance: none;
      appearance: none;
      height: 6px;
      background: var(--primary-color);
      border-radius: 3px;
      cursor: pointer;
    }

    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--primary-color);
      border: 2px solid white;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    input[type="range"]::-moz-range-thumb {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--primary-color);
      border: 2px solid white;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  `;
}