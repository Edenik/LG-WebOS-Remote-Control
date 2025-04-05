import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { Components } from "../../constants/constants";
import { LGRemoteControlConfig, SpotifyLocation } from "../../types/config";
import { HomeAssistantFixed } from "../../types/home-assistant";

// import components
import "./components/AdvancedConfig/AdvancedConfig";
import "./components/AppearanceConfig/AppearanceConfig";
import "./components/BasicConfig/BasicConfig";
import "./components/BasicConfig/SpotifyConfig";
import "./components/ButtonsConfig/ButtonsConfig";

@customElement(Components.RemoteControlEditor)
export class LgRemoteControlEditor extends LitElement {
  private _config: LGRemoteControlConfig;
  private hass: HomeAssistantFixed;

  static get properties() {
    return {
      hass: {},
      _config: {},
    };
  }

  setConfig(config: LGRemoteControlConfig) {
    const newConfig = {
      ...config,
      buttons: Array.isArray(config.buttons) ? config.buttons : [],
      shortcuts: Array.isArray(config.shortcuts) ? config.shortcuts : [],
      spotify_location: config.spotify_location || SpotifyLocation.TOP
    };

    this._config = newConfig;
    this.debugLog({ hass: this.hass, config: this._config, fn: "setConfig" })
  }

  // This function is called when the input element of the editor loses focus or is changed
  configChanged(ev: Event) {
    const target = ev.target as HTMLInputElement
    const _config = Object.assign({}, this._config);
    _config[target.name.toString()] = target.value;
    this._config = _config;

    // A config-changed event will tell lovelace we have made changed to the configuration
    // this make sure the changes are saved correctly later and will update the preview
    const event = new CustomEvent("config-changed", {
      detail: { config: _config },
      bubbles: true,
      composed: true,
    });

    this.debugLog({ hass: this.hass, event, _config, fn: "configChanged" })
    this.dispatchEvent(event);
  }

  debugLog(log: Record<string, any>) {
    if (this.isDebuggerEnabled()) {
      console.log({ ...log, file: "editor.ts" })
    }
  }

  isDebuggerEnabled() {
    // Use Boolean type coercion with default false
    return Boolean(this._config.debug ?? false);
  }

  private _configChanged(ev: CustomEvent) {
    ev.stopPropagation();
    this._config = ev.detail.config;
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    }));
  }

  private renderBasicConfig() {
    return html`
      <ha-expansion-panel header="Basic Configuration">
        <div class="section-content">
          <editor-basic-config
            .hass=${this.hass}
            .config=${this._config}
            @config-changed=${this._configChanged}
          ></editor-basic-config>
          
          <editor-spotify-config
            .hass=${this.hass}
            .config=${this._config}
            @config-changed=${this._configChanged}
          ></editor-spotify-config>
        </div>
      </ha-expansion-panel>
    `;
  }

  private renderAppearanceConfig() {
    return html`
      <editor-appearance-config
        .hass=${this.hass}
        .config=${this._config}
        @config-changed=${this._configChanged}
      ></editor-appearance-config>
    `;
  }

  private renderAdvancedConfig() {
    return html`
      <editor-advanced-config
        .hass=${this.hass}
        .config=${this._config}
        @config-changed=${this._configChanged}
      ></editor-advanced-config>
    `;
  }

  private renderButtonsAndShortcutsConfig() {
    return html`
       <editor-buttons-config
          .hass=${this.hass}
          .config=${this._config}
          @config-changed=${this._configChanged}
        ></editor-buttons-config>`
  }

  render() {
    if (!this.hass || !this._config) {
      return html``;
    }

    return html`
        <div class="container">
            ${this.renderBasicConfig()}
            ${this.renderAppearanceConfig()}
            ${this.renderAdvancedConfig()}
            ${this.renderButtonsAndShortcutsConfig()}

            <div style="margin-top: 16px;">
                <p>Other functionalities must be configured manually in code editor</p>
                <p>References to <a href="https://github.com/madmicio/LG-WebOS-Remote-Control">https://github.com/madmicio/LG-WebOS-Remote-Control</a></p>
            </div>
        </div>
    `;
  }

  static get styles() {
    return css`
      .container {
        display: flex;
        flex-direction: column;
        gap: 16px;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
      }
  
      .section-content {
        padding: 16px;
      }
  
      /* Link Styles */
      a {
        color: var(--primary-color);
        text-decoration: none;
      }
  
      a:hover {
        text-decoration: underline;
      }
  
      /* Card Content Styles */
      .card-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 16px;
      }
  
      /* Footer Styles */
      div[style*="margin-top: 16px"] {
        margin-top: 16px;
      }
  
      div[style*="margin-top: 16px"] p {
        margin: 4px 0;
      }
    `;
  }
}
