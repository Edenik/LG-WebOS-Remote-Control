import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Components } from '../../../../constants/constants';
import { LGRemoteControlConfig, SpotifyLocation } from '../../../../types/config';
import { HomeAssistantFixed } from '../../../../types/home-assistant';

@customElement(Components.EditorSpotifyConfig)
export class SpotifyConfig extends LitElement {
    @property({ type: Object }) public hass!: HomeAssistantFixed;
    @property({ type: Object }) public config!: LGRemoteControlConfig;

    protected render() {
        return html`
      <div class="spotify-config">
        <div class="field-group">
          <label class="field-label">Spotify Media Player Entity</label>
          <div class="device-config">
            <select 
              name="spotify_entity" 
              class="select-item device-select" 
              .value="${this.config.spotify_entity || ''}"
              @change=${this._handleConfigChange}
            >
              ${!this.config.spotify_entity ? html`<option value="" selected> Select Spotify Entity </option>` : ''}
              ${Object.keys(this.hass.states)
                .filter(entityId => entityId.startsWith('media_player.'))
                .sort()
                .map(entityId => html`
                  <option 
                    value="${entityId}" 
                    ?selected=${entityId === this.config.spotify_entity}
                  >
                    ${this.hass.states[entityId].attributes.friendly_name || entityId}
                  </option>
                `)}
            </select>
            ${this.config.spotify_entity ? html`
              <button class="clear-button" @click=${this._eraseSpotifyEntity}>
                <ha-icon icon="mdi:trash-can-outline"></ha-icon>
              </button>
            ` : ''}
          </div>
        </div>

        ${this.config.spotify_entity ? html`
          <div class="field-group">
            <label class="field-label">Spotify Location</label>
            <select 
              name="spotify_location" 
              class="select-item"
              .value="${this.config.spotify_location || SpotifyLocation.TOP}"
              @change=${this._handleConfigChange}
            >
              ${Object.entries(SpotifyLocation).map(([key, value]) => html`
                <option 
                  value="${value}"
                  ?selected=${this.config.spotify_location === value}
                >
                  ${key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              `)}
            </select>
          </div>
        ` : ''}
      </div>
    `;
    }

    private _eraseSpotifyEntity() {
        const newConfig = {
            ...this.config,
            spotify_entity: ''
        };

        this.dispatchEvent(new CustomEvent('config-changed', {
            detail: { config: newConfig },
            bubbles: true,
            composed: true,
        }));
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
      .spotify-config {
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
}