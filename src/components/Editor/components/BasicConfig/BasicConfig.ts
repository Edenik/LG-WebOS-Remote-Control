import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { getMediaPlayerEntitiesByPlatform } from '../../../../common/utils';
import { Components } from '../../../../constants/constants';
import { LGRemoteControlConfig } from '../../../../types/config';
import { HomeAssistantFixed } from '../../../../types/home-assistant';

@customElement(Components.EditorBasicConfig)
export class BasicConfig extends LitElement {
    @property({ type: Object }) public hass!: HomeAssistantFixed;
    @property({ type: Object }) public config!: LGRemoteControlConfig;

    protected render() {
        return html`
      <div class="basic-config">
        <div class="field-group">
          <label class="field-label">LG Media Player Entity</label>
          <div class="device-config">
            <select 
              name="entity" 
              class="select-item" 
              .value="${this.config.entity}"
              @change=${this._handleConfigChange}
            >
              ${!this.config.entity ? html`<option value="" selected> - - - - </option>` : ''}
              ${getMediaPlayerEntitiesByPlatform(this.hass, 'webostv').map((eid) => html`
                <option value="${eid}" ?selected=${eid === this.config.entity}>
                  ${this.hass.states[eid].attributes.friendly_name || eid}
                </option>
              `)}
            </select>
          </div>
        </div>

        <div class="field-group">
          <label class="field-label">MAC Address</label>
          <input 
            type="text" 
            class="input-field" 
            name="mac"
            .value="${this.config.mac || '00:11:22:33:44:55'}"
            @change=${this._handleConfigChange}
          >
        </div>

        <div class="field-group">
          <label class="field-label">Remote Control Name (optional)</label>
          <input 
            type="text" 
            class="input-field" 
            name="name"
            .value="${this.config.name || ''}"
            @input=${this._handleConfigChange}
          >
        </div>
      </div>
    `;
    }

    private _handleConfigChange(ev: Event) {
        const target = ev.target as HTMLInputElement;
        const value = target.value;
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

    static get styles() {
        return css`
      .basic-config {
        padding: 16px;
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

      .device-config {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .select-item {
        flex: 1;
        padding: 8px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
      }

      .input-field {
        width: 100%;
        padding: 8px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        box-sizing: border-box;
      }
    `;
    }
}