import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { getMediaPlayerEntitiesByPlatform } from '../../../../common/utils';
import { AvReceiverdevicemap, Components } from '../../../../constants/constants';
import { LGRemoteControlConfig } from '../../../../types/config';
import { HomeAssistantFixed } from '../../../../types/home-assistant';

@customElement(Components.EditorAvRecieverConfig)
export class AvReceiverConfig extends LitElement {
    @property({ type: Object }) public hass!: HomeAssistantFixed;
    @property({ type: Object }) public config!: LGRemoteControlConfig;

    protected render() {
        return html`
        <div class="field-group">
          <label class="field-label">AV Receiver</label>
          <div class="device-config">
            <select 
              name="av_receiver_family" 
              class="select-item device-select"
              .value=${this.config.av_receiver_family || ''}
              @focusout=${this._handleConfigChange}
              @change=${this._handleConfigChange}
            >
              ${!this.config.av_receiver_family ? html`<option value="" selected> - - - - </option>` : ''}
              ${[...AvReceiverdevicemap.entries()].map(([family, data]) => html`
                <option value="${family}" ?selected=${family === this.config.av_receiver_family}>
                  ${data.friendlyName}
                </option>
              `)}
            </select>
            ${this.config.av_receiver_family ? html`
              <button class="clear-button" @click=${this._eraseAvReceiver}>
                <ha-icon icon="mdi:trash-can-outline"></ha-icon>
              </button>
            ` : ''}
          </div>
        </div>
  
        ${this.config.av_receiver_family ? html`
          <div class="field-group">
            <label class="field-label">AV Receiver Entity</label>
            <select 
              name="ampli_entity" 
              class="select-item"
              .value=${this.config.ampli_entity || ''}
              @focusout=${this._handleConfigChange}
              @change=${this._handleConfigChange}
            >
              ${!this.config.ampli_entity ? html`<option value="" selected> - - - - </option>` : ''}
              ${getMediaPlayerEntitiesByPlatform(this.hass, this.config.av_receiver_family).map(eid => html`
                <option value="${eid}" ?selected=${eid === this.config.ampli_entity}>
                  ${this.hass.states[eid].attributes.friendly_name || eid}
                </option>
              `)}
            </select>
          </div>
        ` : ''}
      `;
    }

    private _handleConfigChange(ev: Event) {
        const target = ev.target as HTMLSelectElement;
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

    private _eraseAvReceiver() {
        const newConfig = {
            ...this.config,
            av_receiver_family: '',
            ampli_entity: ''
        };

        this.dispatchEvent(new CustomEvent('config-changed', {
            detail: { config: newConfig },
            bubbles: true,
            composed: true,
        }));
    }

    static styles = css`
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
        width: 100%;
        padding: 8px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
      }
  
      .device-select {
        flex: 1;
      }
  
      .clear-button {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px;
        border: none;
        background: none;
        cursor: pointer;
        color: var(--primary-text-color);
        opacity: 0.8;
        transition: opacity 0.2s;
      }
  
      .clear-button:hover {
        opacity: 1;
      }
    `;
}
