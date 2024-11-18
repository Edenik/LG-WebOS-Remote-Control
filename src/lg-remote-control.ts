import { HomeAssistant } from 'custom-card-helpers';
import { HassEntity } from 'home-assistant-js-websocket';
import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { CARD_TAG_NAME, CARD_VERSION } from './constants/constants';
import { LGRemoteControlConfig, SpotifyLocation } from './types/config';
import { WindowWithCards } from './types/home-assistant'; // Updated import
import { Logger } from './utils/logger';
import { ServiceHandler } from './utils/service-handlers';

// Import our components
import './components/spotify/SpotifyDisplay';
import './components/views/DebugView';
import './components/views/DefaultView';
import './components/views/InputsView';
import './components/views/ShortcutsView';
import './components/views/SoundView';

const logger = new Logger('LG Remote Control');

// Register card with Home Assistant
const windowWithCards = window as unknown as WindowWithCards;
windowWithCards.customCards = windowWithCards.customCards || [];
windowWithCards.customCards.push({
  type: CARD_TAG_NAME,
  name: "LG WebOS Remote Control Card",
  preview: true,
  description: "Remote control card for LG WebOS TV devices"
});

@customElement(CARD_TAG_NAME)
export class LgRemoteControl extends LitElement {
  private hass!: HomeAssistant;
  private config!: LGRemoteControlConfig;
  private serviceHandler: ServiceHandler;

  // View states
  private _show_inputs: boolean = false;
  private _show_shortcuts: boolean = false;
  private _show_debug: boolean = false;
  private _show_sound_output: boolean = false;
  private _show_keypad: boolean = false;

  constructor() {
    super();
    logger.log('Initializing', { version: CARD_VERSION });
    this.serviceHandler = new ServiceHandler(this.hass);
  }

  static getConfigElement() {
    logger.log('Creating config editor');
    return document.createElement('lg-remote-control-editor');
  }

  public static getStubConfig() {
    return {
      type: `custom:${CARD_TAG_NAME}`,
      entity: "media_player.lg_webos_smart_tv"
    };
  }

  setConfig(config: LGRemoteControlConfig) {
    if (!config.entity) {
      throw new Error("Invalid configuration: entity is required");
    }

    this.config = {
      ...config,
      spotify_location: config.spotify_location || SpotifyLocation.TOP
    };

    logger.log('Configuration updated', { config: this.config });
  }

  protected render() {
    if (!this.hass || !this.config) {
      return html``;
    }

    const stateObj = this.hass.states[this.config.entity];

    return html`
      <div class="card">
        ${this._renderActiveView(stateObj)}
      </div>
    `;
  }

  private _renderActiveView(stateObj: HassEntity) {
    if (this._show_debug) {
      return html`
        <debug-view
          .config=${this.config}
          .stateObj=${stateObj}
          .hass=${this.hass}
          @view-close=${() => this._show_debug = false}>
        </debug-view>`;
    }

    if (this._show_inputs) {
      return html`
        <inputs-view
          .stateObj=${stateObj}
          @view-close=${() => this._show_inputs = false}
          @source-select=${this._handleSourceSelect}>
        </inputs-view>`;
    }

    if (this._show_shortcuts) {
      return html`
        <shortcuts-view
          .shortcuts=${this.config.shortcuts || []}
          @view-close=${() => this._show_shortcuts = false}
          @shortcut-click=${this._handleShortcutClick}>
        </shortcuts-view>`;
    }

    if (this._show_sound_output) {
      return html`
        <sound-view
          .stateObj=${stateObj}
          @view-close=${() => this._show_sound_output = false}
          @sound-select=${this._handleSoundSelect}>
        </sound-view>`;
    }

    return html`
      <default-view
        .config=${this.config}
        .stateObj=${stateObj}
        .showKeypad=${this._show_keypad}
        @keypad-toggle=${() => this._show_keypad = !this._show_keypad}
        @inputs-toggle=${() => this._show_inputs = true}
        @shortcuts-toggle=${() => this._show_shortcuts = true}
        @sound-toggle=${() => this._show_sound_output = true}
        @debug-toggle=${() => this._show_debug = true}
        @button-click=${this._handleButtonClick}
        @volume-change=${this._handleVolumeChange}
        @channel-change=${this._handleChannelChange}>
      </default-view>
    `;
  }

  // Event Handlers
  private _handleSourceSelect(e: CustomEvent) {
    this.serviceHandler.selectSource(this.config.entity, e.detail.source);
  }

  private _handleShortcutClick(e: CustomEvent) {
    const { script_id, data } = e.detail.shortcut;
    if (script_id) {
      this.serviceHandler.runScript(script_id, data);
    }
  }

  private _handleSoundSelect(e: CustomEvent) {
    this.serviceHandler.selectSoundOutput(this.config.entity, e.detail.output);
  }

  private _handleButtonClick(e: CustomEvent) {
    this.serviceHandler.clickButton(this.config.entity, e.detail.button);
  }

  private _handleVolumeChange(e: CustomEvent) {
    const entity = this._getVolumeEntity();
    this.serviceHandler.handleVolumeChange(entity, e.detail.action);
  }

  private _handleChannelChange(e: CustomEvent) {
    this.serviceHandler.handleChannelChange(this.config.entity, e.detail.direction);
  }

  private _getVolumeEntity(): string {
    const stateObj = this.hass.states[this.config.entity];
    const isExternalAudio = ['external_arc', 'external_optical'].includes(stateObj.attributes.sound_output);
    return (this.config.ampli_entity && isExternalAudio) ? this.config.ampli_entity : this.config.entity;
  }

  static get styles() {
    return css`
      :host {
        --remotewidth: 260px;
      }
      
      .card {
        padding: var(--ha-card-padding, 16px);
      }
    `;
  }
}