import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { EDITOR_CARD_TAG_NAME } from "./constants/constants";
import { ButtonType, IconType } from "./types/buttons";
import { LGRemoteControlConfig, SpotifyLocation } from "./types/config";
import { HomeAssistantFixed } from "./types/home-assistant";
import { Logger } from "./utils/logger";
import { ServiceHandler } from "./utils/service-handlers";
import { ValidationContext } from "./utils/validation";

// Import our editor components
import './components/editor/AdvancedConfig';
import './components/editor/AppearanceConfig';
import './components/editor/BasicConfig';
import './components/editor/ButtonsEditor';
import './components/editor/IconSelector';
import './components/editor/ValidationDisplay';

const logger = new Logger('Editor');

@customElement(EDITOR_CARD_TAG_NAME)
export class LgRemoteControlEditor extends LitElement {
  private _config: LGRemoteControlConfig;
  private hass: HomeAssistantFixed;
  private serviceHandler: ServiceHandler;
  private validationContext: ValidationContext;

  // Editor state
  private _activeTab: ButtonType = ButtonType.buttons;
  private _selectedIconType: IconType = IconType.mdi;
  private _editingItem: {
    type: ButtonType;
    index: number;
    isNew: boolean;
  } | null = null;

  static get properties() {
    return {
      hass: { type: Object },
      _config: { type: Object },
      _activeTab: { type: String },
      _selectedIconType: { type: String },
      _editingItem: { type: Object }
    };
  }

  constructor() {
    super();
    this.serviceHandler = new ServiceHandler(this.hass);
    this.validationContext = {
      hass: this.hass,
      config: this._config
    };
  }

  public setConfig(config: LGRemoteControlConfig): void {
    this._config = {
      ...config,
      buttons: Array.isArray(config.buttons) ? config.buttons : [],
      shortcuts: Array.isArray(config.shortcuts) ? config.shortcuts : [],
      spotify_location: config.spotify_location || SpotifyLocation.TOP
    };

    logger.log('Editor config updated', { config: this._config });
    this.validationContext.config = this._config;
  }

  protected render() {
    if (!this.hass || !this._config) {
      return html``;
    }

    return html`
      <div class="editor-container">
        ${this._renderBasicConfig()}
        ${this._renderAppearanceConfig()}
        ${this._renderAdvancedConfig()}
        ${this._renderButtonsEditor()}
        
        <div class="documentation-section">
          <p>Additional configuration options available in YAML editor</p>
          <p>See <a href="https://github.com/madmicio/LG-WebOS-Remote-Control" 
                    target="_blank" rel="noopener noreferrer">documentation</a> 
             for full configuration details</p>
        </div>
      </div>
    `;
  }

  private _renderBasicConfig() {
    return html`
      <ha-expansion-panel header="Basic Configuration">
        <basic-config
          .hass=${this.hass}
          .config=${this._config}
          @config-changed=${this._handleConfigChange}>
        </basic-config>
      </ha-expansion-panel>
    `;
  }

  private _renderAppearanceConfig() {
    return html`
      <ha-expansion-panel header="Appearance">
        <appearance-config
          .config=${this._config}
          @config-changed=${this._handleConfigChange}>
        </appearance-config>
      </ha-expansion-panel>
    `;
  }

  private _renderAdvancedConfig() {
    return html`
      <ha-expansion-panel header="Advanced Settings">
        <advanced-config
          .hass=${this.hass}
          .config=${this._config}
          @config-changed=${this._handleConfigChange}>
        </advanced-config>
      </ha-expansion-panel>
    `;
  }

  private _renderButtonsEditor() {
    return html`
      <ha-expansion-panel header="Buttons & Shortcuts" open>
        <buttons-editor
          .hass=${this.hass}
          .config=${this._config}
          .activeTab=${this._activeTab}
          .editingItem=${this._editingItem}
          .selectedIconType=${this._selectedIconType}
          .validationContext=${this.validationContext}
          @tab-change=${this._handleTabChange}
          @edit-item=${this._handleEditItem}
          @add-item=${this._handleAddItem}
          @delete-item=${this._handleDeleteItem}
          @save-item=${this._handleSaveItem}
          @cancel-edit=${this._handleCancelEdit}
          @icon-type-change=${this._handleIconTypeChange}
          @config-changed=${this._handleConfigChange}>
        </buttons-editor>
      </ha-expansion-panel>
    `;
  }

  private _handleConfigChange(ev: CustomEvent) {
    const newConfig = { ...this._config, ...ev.detail.config };
    this._config = newConfig;
    this.validationContext.config = newConfig;

    this._dispatchConfigChange(newConfig);
  }

  private _handleTabChange(ev: CustomEvent) {
    this._activeTab = ev.detail.tab;
  }

  private _handleEditItem(ev: CustomEvent) {
    this._editingItem = {
      type: ev.detail.type,
      index: ev.detail.index,
      isNew: false
    };
  }

  private _handleAddItem(ev: CustomEvent) {
    this._editingItem = {
      type: ev.detail.type,
      index: this._config[ev.detail.type].length,
      isNew: true
    };
  }

  private _handleDeleteItem(ev: CustomEvent) {
    const { type, index } = ev.detail;
    const newConfig = { ...this._config };
    newConfig[type] = [
      ...newConfig[type].slice(0, index),
      ...newConfig[type].slice(index + 1)
    ];

    this._config = newConfig;
    this._dispatchConfigChange(newConfig);
  }

  private _handleSaveItem(ev: CustomEvent) {
    const { item, type, index } = ev.detail;
    const newConfig = { ...this._config };

    if (this._editingItem?.isNew) {
      newConfig[type] = [...newConfig[type], item];
    } else {
      newConfig[type] = [
        ...newConfig[type].slice(0, index),
        item,
        ...newConfig[type].slice(index + 1)
      ];
    }

    this._editingItem = null;
    this._config = newConfig;
    this._dispatchConfigChange(newConfig);
  }

  private _handleCancelEdit() {
    this._editingItem = null;
  }

  private _handleIconTypeChange(ev: CustomEvent) {
    this._selectedIconType = ev.detail.type;
  }

  private _dispatchConfigChange(config: LGRemoteControlConfig) {
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config },
      bubbles: true,
      composed: true
    }));
  }

  static get styles() {
    return css`
      .editor-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 16px;
      }

      ha-expansion-panel {
        --expansion-panel-summary-padding: 0 16px;
        --expansion-panel-content-padding: 0 16px 16px;
        border-radius: var(--ha-card-border-radius, 12px);
        overflow: hidden;
      }

      .documentation-section {
        margin-top: 16px;
        padding: 16px;
        border-radius: var(--ha-card-border-radius, 12px);
        background: var(--ha-card-background, var(--card-background-color, white));
        box-shadow: var(--ha-card-box-shadow, none);
      }

      .documentation-section p {
        margin: 0 0 8px;
      }

      .documentation-section a {
        color: var(--primary-color);
        text-decoration: none;
      }

      .documentation-section a:hover {
        text-decoration: underline;
      }
    `;
  }
}