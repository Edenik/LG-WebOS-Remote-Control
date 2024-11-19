import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { getMediaPlayerEntitiesByPlatform } from '../../common/utils';
import { LGRemoteControlConfig } from '../../types/config';
import { HomeAssistantFixed } from '../../types/home-assistant';

@customElement('basic-config')
export class BasicConfig extends LitElement {
    @property({ type: Object }) hass!: HomeAssistantFixed;
    @property({ type: Object }) config!: LGRemoteControlConfig;

    private _onChange(ev: Event) {
        const target = ev.target as HTMLInputElement;
        const value = target.value;
        const newConfig = {
            ...this.config,
            [target.name]: value,
        };

        this._dispatchConfigChange(newConfig);
    }

    private _dispatchConfigChange(config: LGRemoteControlConfig) {
        const event = new CustomEvent('config-changed', {
            detail: { config },
            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(event);
    }

    protected render() {
        const tvEntities = getMediaPlayerEntitiesByPlatform(this.hass, 'webostv');

        return html`
      <div class="card-config">
        <div class="field">
          <ha-select
            name="entity"
            label="TV Entity"
            .value=${this.config.entity}
            @selected=${this._onChange}
          >
            ${tvEntities.map(entity => html`
              <mwc-list-item .value=${entity}>
                ${this.hass.states[entity]?.attributes?.friendly_name || entity}
              </mwc-list-item>
            `)}
          </ha-select>
        </div>

        <div class="field">
          <ha-textfield
            name="name"
            label="Name"
            .value=${this.config.name || ''}
            @change=${this._onChange}
          ></ha-textfield>
        </div>

        <div class="field">
          <ha-textfield
            name="mac"
            label="MAC Address"
            .value=${this.config.mac || ''}
            @change=${this._onChange}
            helper-text="Required for Wake-on-LAN"
          ></ha-textfield>
        </div>
      </div>
    `;
    }

    static styles = css`
    .card-config {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    ha-select, ha-textfield {
      width: 100%;
    }
  `;
}