import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Components } from '../../../../constants/constants';
import { LGRemoteControlConfig } from '../../../../types/config';

@customElement(Components.EditorDebugConfig)
export class DebugConfig extends LitElement {
    @property({ type: Object }) public config!: LGRemoteControlConfig;

    protected render() {
        return html`
      <div class="config-section">
        <div class="field-group">
          <label class="field-label">Display Color Buttons</label>
          <select 
            name="color_buttons" 
            class="select-item"
            .value=${String(this.config.color_buttons ?? false)}
            @change=${this._handleBooleanChange}
          >
            <option value="true" ?selected=${Boolean(this.config.color_buttons)}>On</option>
            <option value="false" ?selected=${!Boolean(this.config.color_buttons)}>Off</option>
          </select>
        </div>

        <div class="field-group">
          <label class="field-label">Debug Mode</label>
          <select 
            name="debug" 
            class="select-item"
            .value=${String(this.config.debug ?? false)}
            @change=${this._handleBooleanChange}
          >
            <option value="true" ?selected=${Boolean(this.config.debug)}>On</option>
            <option value="false" ?selected=${!Boolean(this.config.debug)}>Off</option>
          </select>
        </div>
      </div>
    `;
    }

    private _handleBooleanChange(ev: Event) {
        const target = ev.target as HTMLSelectElement;
        const value = target.value === 'true';
        const name = target.name;

        const newConfig = {
            ...this.config,
            [name]: value
        };

        this.dispatchEvent(new CustomEvent('config-changed', {
            detail: { config: newConfig },
            bubbles: true,
            composed: true,
        }));
    }

    static styles = css`
    .config-section {
      margin-bottom: 16px;
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 16px;
    }

    .field-label {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .select-item {
      width: 100%;
      padding: 8px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
    }
  `;
}