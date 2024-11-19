import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { getMediaPlayerEntitiesByPlatform } from '../../common/utils';
import { AvReceiverdevicemap } from '../../constants/constants';
import { LGRemoteControlConfig } from '../../types/config';
import { HomeAssistantFixed } from '../../types/home-assistant';

@customElement('advanced-config')
export class AdvancedConfig extends LitElement {
    @property({ type: Object }) hass!: HomeAssistantFixed;
    @property({ type: Object }) config!: LGRemoteControlConfig;

    private _onChange(ev: Event) {
        const target = ev.target as HTMLInputElement;
        const value = target.type === 'checkbox' ? target.checked : target.value;

        const newConfig = {
            ...this.config,
            [target.name]: value,
        };

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
          <div class="field">
            <ha-switch
              name="color_buttons"
              .checked=${this.config.color_buttons || false}
              @change=${this._onChange}
            ></ha-switch>
            <span>Show Color Buttons</span>
          </div>

          <div class="field">
            <ha-switch
              name="debug"
              .checked=${this.config.debug || false}
              @change=${this._onChange}
            ></ha-switch>
            <span>Debug Mode</span>
          </div>
        </div>

        <div class="section">
          <h3>AV Receiver Configuration</h3>
          <div class="field">
            <ha-select
              name="av_receiver_family"
              label="AV Receiver Type"
              .value=${this.config.av_receiver_family || ''}
              @selected=${this._onChange}
            >
              <mwc-list-item value="">None</mwc-list-item>
              ${[...AvReceiverdevicemap.entries()].map(([family, data]) => html`
                <mwc-list-item .value=${family}>
                  ${data.friendlyName}
                </mwc-list-item>
              `)}
            </ha-select>
          </div>

          ${this.config.av_receiver_family ? html`
            <div class="field">
              <ha-select
                name="ampli_entity"
                label="AV Receiver Entity"
                .value=${this.config.ampli_entity || ''}
                @selected=${this._onChange}
              >
                <mwc-list-item value="">Select Entity</mwc-list-item>
                ${getMediaPlayerEntitiesByPlatform(this.hass, this.config.av_receiver_family).map(entity => html`
                  <mwc-list-item .value=${entity}>
                    ${this.hass.states[entity]?.attributes?.friendly_name || entity}
                  </mwc-list-item>
                `)}
              </ha-select>
            </div>
          ` : ''}
        </div>

        <div class="section">
          <h3>Debug Entities</h3>
          <div class="field">
            <ha-entity-picker
              name="debug_entities"
              label="Add Debug Entity"
              .hass=${this.hass}
              .value=${this.config.debug_entities?.[0] || ''}
              @value-changed=${this._onChange}
              allow-custom-entity
              multiple
            ></ha-entity-picker>
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

    ha-select {
      width: 100%;
    }

    ha-entity-picker {
      width: 100%;
    }
  `;
}