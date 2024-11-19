import { HomeAssistant } from 'custom-card-helpers';
import { HassEntity } from 'home-assistant-js-websocket';
import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { amazonIcon, arcIcon, daznIcon, disneyIcon, lineOutIcon, opticIcon, tvHeadphonesIcon, tvOpticIcon } from "../../common/icons";
import { renderButtonMedia, renderShape } from '../../common/media-renderer';
import { decodeSupportedFeatures, getMediaPlayerEntitiesByPlatform, isRTL } from "../../common/utils";
import { CARD_VERSION, Components } from "../../constants/constants";
import { globalStyles } from '../../styles/styles';
import { ButtonAction, ButtonConfig, SoundButton } from '../../types/buttons';
import { LGRemoteControlConfig, SpotifyLocation } from '../../types/config';
import { HomeAssistantFixed, WindowWithCards } from '../../types/home-assistant';

// import components
import "../Editor/Editor";
import '../Spotify/SpotifyDisplay';
import { getSpotifyEntity, getSpotifyTitle } from '../Spotify/helpers';

const line1 = '  LG WebOS Remote Control Card  ';
const logger = (title: string, log: any) => {
  console.log(
    `%c${line1}\n%c  ${title}  `,
    'color: powderblue; font-weight: bold; background: black',
    'color: royalblue; font-weight: bold; background: white',
    log
  );
}

logger(`version: ${CARD_VERSION}`, "")


// Allow this card to appear in the card chooser menu
const windowWithCards = window as unknown as WindowWithCards;
windowWithCards.customCards = windowWithCards.customCards || [];
windowWithCards.customCards.push({
  type: Components.RemoteControl,
  name: "LG WebOS Remote Control Card",
  preview: true,
  description: "Remote control card for LG WebOS TV devices"
});

@customElement(Components.RemoteControl)
export class LgRemoteControl extends LitElement {
  public hass!: HomeAssistant;
  public config!: LGRemoteControlConfig;
  private _show_inputs: boolean;
  private _show_shortcuts: boolean;
  private _show_debug: boolean;
  private _show_sound_output: boolean;
  private _show_text: boolean;
  private _show_keypad: boolean;
  private _show_vol_text: boolean;
  private volume_value: number;
  private soundOutput: string;
  private output_entity: string;
  private valueDisplayTimeout: NodeJS.Timeout;
  private homeisLongPress: boolean = false;
  private homelongPressTimer: any; // Tipo generico, ma puoi specificare il tipo corretto se lo conosci
  private _lastSpotifyTitle: string;
  private _lastSpotifyState: string;

  static getConfigElement() {
    // Create and return an editor element
    return document.createElement(Components.RemoteControlEditor);
  }

  public static getStubConfig(hass: HomeAssistantFixed) {
    let entities = getMediaPlayerEntitiesByPlatform(hass, "webostv");
    if (entities.length == 0) {
      entities = Object.keys(hass.entities).filter(e => e.startsWith("media_player."));
    }
    const entity = entities.length > 0 ? entities[0] : "media_player.lg_webos_smart_tv";
    return {
      "type": `custom:${Components.RemoteControl}`,
      "entity": entity
    }
  }


  static get properties() {
    return {
      hass: {},
      config: {},
      _show_inputs: {},
      _show_debug: {},
      _show_shortcuts: {},
      _show_sound_output: {},
      _show_text: {},
      _show_keypad: {},
      _show_vol_text: {},
      volume_value: { type: Number, reflect: true },
      output_entity: { type: Number, reflect: true },
    };
  }

  constructor() {
    super();
    this._show_inputs = false;
    this._show_shortcuts = false;
    this._show_debug = false;
    this._show_sound_output = false;
    this._show_text = false;
    this._show_keypad = false;
    this._show_vol_text = false;
    this.volume_value = 0;
    this.soundOutput = "";
  }

  logStates() {
    const entitiesState: Record<string, HassEntity> = {};
    for (const entityName of [this.config.entity, ...(this.config.debug_entities || [])]) {
      const entity: HassEntity = this.hass.states[entityName];
      if (entity) { entitiesState[entity.entity_id] = entity; }
    }

    logger("State changed:", { ...entitiesState, config: this.config, hass: this.hass });
  }

  render() {
    const stateObj: HassEntity = this.hass.states[this.config.entity];
    const debuggerEnabled: boolean = this.config.debug;

    if (debuggerEnabled) { this.logStates() };

    if (this.config.ampli_entity &&
      (this.hass.states[this.config.entity].attributes.sound_output === 'external_arc' ||
        this.hass.states[this.config.entity].attributes.sound_output === 'external_optical')) {
      this.volume_value = Math.round(this.hass.states[this.config.ampli_entity].attributes.volume_level * 100 * 2) / 2;
      this.output_entity = this.config.ampli_entity;
    } else {
      this.volume_value = Math.round(this.hass.states[this.config.entity].attributes.volume_level * 100);
      this.output_entity = this.config.entity;
    }

    return html`
    <div class="card">
      ${this._renderMainContainer(stateObj, this.config, debuggerEnabled)}
    </div>
  `;
  }

  _willRenderText(item: ButtonConfig) {
    return Boolean(item.text);
  }

  _getStylesConst() {
    const borderWidth = this.config.dimensions && this.config.dimensions.border_width ? this.config.dimensions.border_width : "1px";
    const scale = this.config.dimensions && this.config.dimensions.scale ? this.config.dimensions.scale : 1;
    const remoteWidth = Math.round(scale * 260) + "px";
    const backgroundColor = this.config.colors && this.config.colors.background ? this.config.colors.background : "var( --ha-card-background, var(--card-background-color, white) )";
    const borderColor = this.config.colors && this.config.colors.border ? this.config.colors.border : "var(--primary-text-color)";
    const buttonColor = this.config.colors && this.config.colors.buttons ? this.config.colors.buttons : "var(--secondary-background-color)";
    const textColor = this.config.colors && this.config.colors.text ? this.config.colors.text : "var(--primary-text-color)";

    return { borderWidth, scale, remoteWidth, backgroundColor, borderColor, buttonColor, textColor }
  }

  // Styles generator
  _getMainStyles() {
    const { borderWidth, remoteWidth, backgroundColor, borderColor, buttonColor, textColor } = this._getStylesConst();
    return `
      --remote-button-color: ${buttonColor};
      --remote-text-color: ${textColor};
      --remote-color: ${backgroundColor};
      --remotewidth: ${remoteWidth};
      --main-border-color: ${borderColor};
      --main-border-width: ${borderWidth};
    `;
  }

  _renderSpotifyRow() {
    return html`
      <spotify-display .state=${this.hass.states[this.config.spotify_entity]}></spotify-display>
    `
  }

  // Main container renderer
  _renderMainContainer(stateObj: HassEntity, config: LGRemoteControlConfig, debuggerEnabled: boolean) {
    return html`
      <div class="page" style="${this._getMainStyles()}">
        ${this._renderTitle(config, debuggerEnabled)}
        ${this.config.spotify_location === SpotifyLocation.TOP ? this._renderSpotifyRow() : ''}
        ${this._renderPowerControls(stateObj)}
        ${this._renderMainContent(stateObj, config, debuggerEnabled)}
        ${this.config.spotify_location === SpotifyLocation.BOTTOM ? this._renderSpotifyRow() : ''}
      </div>
    `;
  }

  // Title section
  _renderTitle(config: LGRemoteControlConfig, debuggerEnabled: boolean) {
    const tv_name_color = this.config.tv_name_color ? this.config.tv_name_color : "var(--primary-text-color)";

    if (!config.name && !debuggerEnabled) return '';
    return html`
        <div class="tv_title" style="color:${tv_name_color}">
          ${config.name} ${debuggerEnabled ? CARD_VERSION : ""}
        </div>
      `;
  }

  // Power controls section
  _renderPowerControls(stateObj: HassEntity) {
    const { remoteWidth } = this._getStylesConst();

    return html`
        <div class="grid-container-power" style="--remotewidth: ${remoteWidth}">
          <button class="btn-flat flat-high ripple" @click=${() => this._click_button("MENU")}>
            <ha-icon icon="mdi:cog"/>
          </button>
          ${this._renderPowerButton(stateObj)}
          <button class="btn-flat flat-high ripple" @click=${() => this._show_keypad = !this._show_keypad}>
            <ha-icon icon="mdi:numeric"/>
          </button>
        </div>
      `;
  }

  // Power button
  _renderPowerButton(stateObj: HassEntity) {
    const textColor = this.config.colors && this.config.colors.text ? this.config.colors.text : "var(--primary-text-color)";
    const mac = this.config.mac;

    return stateObj.state === 'off'
      ? html`
        <button class="btn ripple" @click=${() => this._media_player_turn_on(mac)}>
          <ha-icon icon="mdi:power" style="color: ${textColor};"/>
        </button>
      `
      : html`
        <button class="btn ripple" @click=${() => this._media_player_service("POWER", "turn_off")}>
          <ha-icon icon="mdi:power" style="color: red;"/>
        </button>
      `;
  }

  // Main content router
  _renderMainContent(stateObj: HassEntity, config: LGRemoteControlConfig, debuggerEnabled: boolean) {
    if (this._show_debug) return this._renderDebugView(stateObj, config);
    if (this._show_inputs) return this._renderInputsView(stateObj);
    if (this._show_shortcuts) return this._renderShortcutsView();
    return this._renderDefaultView(stateObj, debuggerEnabled);
  }

  // Debug view
  _renderDebugView(stateObj: HassEntity, config: LGRemoteControlConfig) {
    const states = this.hass.states;
    const debugEntities: HassEntity[] = [stateObj]; // add TV as first item

    if (config.debug_entities) {
      for (const entity of config.debug_entities) {
        // we already pushed this entity (TV)
        if (entity === stateObj.entity_id) { continue; }

        const entityState: HassEntity | undefined = states[entity];
        if (entityState) { debugEntities.push(entityState); }
      }
    }

    return html`
        <div class="grid-container-input">
          ${renderShape("input")}
          <button class="ripple bnt-input-back" @click=${() => this._show_debug = false}>
            <ha-icon icon="mdi:undo-variant"/>
          </button>
          <p class="source_text"><b>DEBUG</b></p>
          <div class="grid-item-input debug-screen">
            ${this._renderConfig(config)}
            ${debugEntities.map((entityState: HassEntity) => this._renderDebugInfo(entityState))}
          </div>
        </div>
      `;
  }

  // Debug information
  _renderDebugInfo(stateObj: HassEntity) {
    return html`
    <ha-expansion-panel header="${stateObj.attributes.friendly_name ?? stateObj.entity_id}">
      <div class="debug-info">
        <!-- Entity State Section -->
        <div class="debug-section">
          <div class="debug-content">
            <div class="debug-row">
              <div class="debug-label">Entity ID</div>
              <div class="debug-value">${stateObj.entity_id}</div>
            </div>
            <div class="debug-row">
              <div class="debug-label">State</div>
              <div class="debug-value">${stateObj.state}</div>
            </div>
            <div class="debug-row">
              <div class="debug-label">Last Changed</div>
              <div class="debug-value">${stateObj.last_changed}</div>
            </div>
            <div class="debug-row">
              <div class="debug-label">Last Updated</div>
              <div class="debug-value">${stateObj.last_updated}</div>
            </div>
          </div>
        </div>
  
        <!-- Attributes Section -->
        <div class="debug-section">
          <div class="debug-header">
            <span class="debug-title">Attributes</span>
          </div>
          <div class="debug-content">
            ${Object.entries(stateObj.attributes).map(([key, value]) => {
      if (key === "supported_features" && stateObj.entity_id.startsWith("media_player.")) {
        value = [value, "Decoded:", ...decodeSupportedFeatures(value)]
      }

      return html`
              <div class="debug-row">
                <div class="debug-label">${key}</div>
                <div class="debug-value">
                  ${Array.isArray(value)
          ? html`
                      <div class="debug-list">
                        ${value.map(item => html`<div class="debug-list-item">${item}</div>`)}
                      </div>`
          : typeof value === 'object' && value !== null
            ? html`<pre class="debug-pre">${JSON.stringify(value, null, 2)}</pre>`
            : value
        }
                </div>
              </div>
            `
    })}
          </div>
        </div>
      </div>
      </ha-expansion-panel>
    `;
  }

  _renderConfigSection = (title: string, data: any) => {
    if (!data || (Array.isArray(data) && data.length === 0)) return '';

    return html`
      <div class="debug-section">
        <div class="debug-header">
          <span class="debug-title">${title}</span>
        </div>
        <div class="debug-content">
          ${Array.isArray(data) ?
        data.map(item => html`
              <div class="debug-row">
                <div class="debug-label">${item.name || item.text || item.button_name || 'Item'}</div>
                <div class="debug-value">
                  <pre class="debug-pre">${JSON.stringify(item, null, 2)}</pre>
                </div>
              </div>
            `) :
        Object.entries(data).map(([key, value]) => html`
              <div class="debug-row">
                <div class="debug-label">${key}</div>
                <div class="debug-value">
                  ${typeof value === 'object' ?
            html`<pre class="debug-pre">${JSON.stringify(value, null, 2)}</pre>` :
            value}
                </div>
              </div>
            `)
      }
        </div>
      </div>
    `;
  };

  _renderConfig(config: LGRemoteControlConfig) {
    const { type, entity, mac, name, av_receiver_family, debug, ampli_entity,
      shortcuts, buttons, replace_buttons, debug_entities, dimensions, colors } = config;
    return html`
      <ha-expansion-panel header="Remote Control Configuration">
        <div class="debug-info">
          ${this._renderConfigSection('Basic Configuration', { type, entity, mac, name, av_receiver_family, debug, ampli_entity })}
          ${this._renderConfigSection('Shortcuts', shortcuts)}
          ${this._renderConfigSection('Buttons', buttons)}
          ${this._renderConfigSection('Replace Buttons', replace_buttons)}
          ${this._renderConfigSection('Debug Entities', debug_entities)}
          ${this._renderConfigSection('Dimensions', dimensions)}
          ${this._renderConfigSection('Colors', colors)}
        </div>
      </ha-expansion-panel>
    `;
  }

  // Inputs view
  _renderInputsView(stateObj: HassEntity) {
    return html`
      <div class="grid-container-input">
        ${renderShape("input")}
        <button class="ripple bnt-input-back" @click=${() => this._show_inputs = false}>
          <ha-icon icon="mdi:undo-variant"/>
        </button>
        <p class="source_text"><b>SOURCE</b></p>
        <div class="grid-item-input">
          ${this._renderSourceList(stateObj)}
        </div>
      </div>
    `;
  }

  // Source list renderer
  _renderSourceList(stateObj: HassEntity) {
    return stateObj.attributes.source_list.map(source => html`
      <button 
        class="${stateObj.attributes.source === source ? 'btn-input-on' : 'btn-input ripple overlay'}"
        @click=${() => {
        this._select_source(source);
        this._show_inputs = false;
      }}
      >
        ${source}
      </button>
    `);
  }

  // Shortcuts view
  _renderShortcutsView() {
    return html`
          <div class="grid-container-input">
            ${renderShape("input")}
            <button class="ripple bnt-input-back" @click=${() => this._show_shortcuts = false}>
              <ha-icon icon="mdi:undo-variant"/>
            </button>
            <p class="source_text"><b>Shortcuts</b></p>
            <div class="grid-item-input">
              <div>
                ${this._renderShortcutList()}
              </div>
            </div>
          </div>
        `;
  }

  // Shortcuts list renderer
  _renderShortcutList() {
    return this.config.shortcuts.map(shortcut => {
      const willRenderText = this._willRenderText(shortcut);
      const isRtl = willRenderText && isRTL(shortcut.text);

      return html`
        <button 
          class="btn-input ${isRtl ? 'rtl' : ''} ripple overlay"
          title="${shortcut.tooltip ?? ''}" 
          style="width: 95%; ${willRenderText ? `color: ${shortcut.text_color ?? ''};` : ''}"
          @click=${() => {
          this._run_script(shortcut.script_id, shortcut.data);
          this._show_shortcuts = false;
        }}
        > 
          <span>
            ${renderButtonMedia(shortcut)}
            ${shortcut.text ?? ""}
          </span>
        </button>
      `;
    });
  }


  // Sound view
  _renderSoundView(stateObj: HassEntity) {
    return html`
      <div class="grid-container-sound">
        ${renderShape("sound")}
        <button class="bnt-sound-back ripple" @click=${() => this._show_sound_output = false}>
          <ha-icon icon="mdi:undo-variant"/>
        </button>
        ${this._show_text ? this._renderSoundText(stateObj) : this._renderSoundIcons(stateObj)}
      </div>
    `;
  }

  // Sound text view
  _renderSoundText(stateObj: HassEntity) {
    return html`
      <button class="btn_soundoutput ripple" @click=${() => this._show_text = false}>SOUND</button>
      ${this._renderSoundButtons(stateObj, true)}
    `;
  }

  // Sound icons view
  _renderSoundIcons(stateObj: HassEntity) {
    return html`
      <button class="sound_icon_text ripple" @click=${() => this._show_text = true}>
        <ha-icon style="height: calc(var(--remotewidth) / 6); width: calc(var(--remotewidth) / 6);" icon="mdi:speaker">
      </button>
      ${this._renderSoundButtons(stateObj, false)}
    `;
  }

  // Sound buttons renderer
  _renderSoundButtons(stateObj: HassEntity, isText: boolean) {
    const buttons: SoundButton[] = [
      { output: "tv_speaker", text: "TV Speaker", icon: "mdi:television-classic", class: "tv" },
      { output: "tv_external_speaker", text: "TV + Optic", icon: tvOpticIcon(), class: "tv-opt" },
      { output: "tv_speaker_headphone", text: "TV + H-Phone", icon: tvHeadphonesIcon(), class: "tv-phone" },
      { output: "external_optical", text: "Optical", icon: opticIcon(), class: "opt" },
      { output: "external_arc", text: "HDMI", icon: arcIcon(), class: "hdmi" },
      { output: "lineout", text: "Lineout", icon: lineOutIcon(), class: "line" },
      { output: "headphone", text: "HeadPhone", icon: "mdi:headphones", class: "phone" },
      { output: "bt_soundbar", text: "Bluetooth", icon: "mdi:bluetooth", class: "bluetooth" }
    ];

    return buttons.map(button => this._renderSoundButton(stateObj, button, isText));
  }

  // Individual sound button renderer
  _renderSoundButton(stateObj: HassEntity, button: SoundButton, isText: boolean) {
    const isActive = stateObj.attributes.sound_output === button.output;
    const baseClass = isActive ? 'btn_sound_on' : 'btn_sound_off';
    const widthClass = isText ? 'bnt_sound_text_width' : 'bnt_sound_icon_width';

    return html`
      <button 
        class="${baseClass} ${button.class} ${widthClass} ${!isActive ? 'ripple overlay' : ''}"
        @click=${() => this._select_sound_output(button.output)}
      >
        ${isText ? button.text : (typeof button.icon === 'string'
        ? html`<ha-icon class="icon_source" icon="${button.icon}">`
        : button.icon)}
      </button>
    `;
  }

  // Default view
  _renderDefaultView(stateObj: HassEntity, debuggerEnabled: boolean) {
    return html`
       ${this._show_keypad ? this._renderKeypad() :
        this._show_sound_output ? this._renderSoundView(stateObj) :
          this._renderDirectionPad(stateObj)}
      ${this.config.spotify_location === SpotifyLocation.ABOVE_BUTTONS ? this._renderSpotifyRow() : ''}
      ${this._renderCustomButtons(debuggerEnabled, stateObj)}
      ${this.config.spotify_location === SpotifyLocation.UNDER_BUTTONS ? this._renderSpotifyRow() : ''}
      ${this._renderColorButtons()}
      ${this._renderVolumeChannelControl(stateObj)}
      ${this._renderMediaControl()}
    `;
  }

  // Media control renderer
  _renderMediaControl() {
    const controls = [
      { command: "PLAY", service: "media.controls/play", icon: "mdi:play" },
      { command: "PAUSE", service: "media.controls/pause", icon: "mdi:pause" },
      { command: "STOP", service: "media.controls/stop", icon: "mdi:stop" },
      { command: "REWIND", service: "media.controls/rewind", icon: "mdi:skip-backward" },
      { command: "RECORD", service: "media.controls/Record", icon: "mdi:record", color: "red" },
      { command: "FAST_FOWARD", service: "media.controls/fastForward", icon: "mdi:skip-forward" }
    ];

    return html`
      <div class="grid-container-media-control">
        ${controls.map(control => html`
          <button 
            class="btn-flat flat-low ripple" 
            style="${control.color ? `color: ${control.color};` : ''}"
            @click=${() => this._command(control.command, control.service)}>
            <ha-icon icon="${control.icon}"/>
          </button>
        `)}
      </div>
    `;
  }

  // Color buttons renderer
  _renderColorButtons() {
    if (!this.config.color_buttons) return '';

    const colors = [
      { color: 'red', command: 'RED' },
      { color: 'green', command: 'GREEN' },
      { color: 'yellow', command: 'YELLOW' },
      { color: 'blue', command: 'BLUE' }
    ];

    return html`
      <div class="grid-container-color_btn">
        ${colors.map(({ color, command }) => html`
          <button 
            class="btn-color ripple" 
            style="background-color: ${color}; height: calc(var(--remotewidth) / 12);" 
            @click=${() => this._click_button(command)}>
          </button>
        `)}
      </div>
    `;
  }

  _displayVolumePercentage() {
    this._show_vol_text = true;
    this.valueDisplayTimeout = setTimeout(() => {
      this._show_vol_text = false;
    }, 500);
  }

  // Volume and channel control renderer with correct grid layout
  _renderVolumeChannelControl(stateObj: HassEntity) {
    const isMuted = stateObj.attributes.is_volume_muted === true;
    const customMute = (this.config.replace_buttons ?? []).find((item) => item.button_name.toLowerCase() === "mute")

    return html`
      <div class="grid-container-volume-channel-control">
        <!-- Volume Plus button -->
        <button class="btn ripple" id="plusButton" 
          style="border-radius: 50% 50% 0px 0px; margin: 0px auto 0px auto; height: 100%;">
          <ha-icon icon="mdi:plus"/>
        </button>
  
        <!-- Home button -->
        <button class="btn-flat flat-high ripple" id="homeButton" 
          style="margin-top: 0px; height: 50%;"
          @mousedown=${(e) => this._homeButtonDown(e)} 
          @touchstart=${(e) => this._homeButtonDown(e)} 
          @mouseup=${(e) => this._homeButtonUp(e)} 
          @touchend=${(e) => this._homeButtonUp(e)}>
          <ha-icon icon="mdi:home"></ha-icon>
        </button>
  
        <!-- Channel Up button -->
        <button class="btn ripple" 
          style="border-radius: 50% 50% 0px 0px; margin: 0px auto 0px auto; height: 100%;" 
          @click=${() => this._click_button("CHANNELUP")}>
          <ha-icon icon="mdi:chevron-up"/>
        </button>
  
        <!-- Volume icon button -->
        <button class="btn ripple" 
          @click=${() => { this._displayVolumePercentage() }}
          style="border-radius: 0px; cursor: default; margin: 0px auto 0px auto; height: 100%;">
          ${this._show_vol_text === true ? this.volume_value :
        html`<ha-icon icon="${isMuted ? 'mdi:volume-off' : 'mdi:volume-high'}"/>`}
        </button>
  
        <!-- Mute button -->
        <button class="btn ripple" 
          style="color:${isMuted ? 'red' : ''}; height: 100%;" 
          @click=${() => customMute && customMute.script_id ? this._run_script(customMute.script_id) : customMute && customMute.scene_id ? this._run_scene(customMute.scene_id) : this._click_button("MUTE")}>
          <span class="${isMuted ? 'blink' : ''}">
            <ha-icon icon="mdi:volume-mute"/>
          </span>
        </button>
  
        <!-- Parking button -->
        <button class="btn" 
          style="border-radius: 0px; cursor: default; margin: 0px auto 0px auto; height: 100%;">
          <ha-icon icon="mdi:parking"/>
        </button>
  
        <!-- Volume Minus button -->
        <button class="btn ripple" id="minusButton" 
          style="border-radius: 0px 0px 50% 50%; margin: 0px auto 0px auto; height: 100%;">
          <ha-icon icon="mdi:minus"/>
        </button>
  
        <!-- Info button -->
        <button class="btn-flat flat-high ripple" 
          style="margin-bottom: 0px; height: 50%;" 
          @click=${() => this._click_button("INFO")}>
          <ha-icon icon="mdi:information-variant"/>
        </button>
  
        <!-- Channel Down button -->
        <button class="btn ripple" 
          style="border-radius: 0px 0px 50% 50%; margin: 0px auto 0px auto; height: 100%;"  
          @click=${() => this._click_button("CHANNELDOWN")}>
          <ha-icon icon="mdi:chevron-down"/>
        </button>
      </div>
    `;
  }

  // Keypad renderer
  _renderKeypad() {
    return html`
      <div class="grid-container-keypad">
        ${[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, null].map((num: number) => {
      return !isNaN(num) ? html`
                <button class="btn-keypad ripple"
                 @click=${() => {
          if (num) {
            this._click_button(num.toString())
          }
        }}>
                  ${num}
                </button>`
        : html`<button class="btn-keypad"></button>`
    })}
    </div>`;
  }

  // Direction pad renderer
  _renderDirectionPad(stateObj: HassEntity) {
    return html`
      <div class="grid-container-cursor">
        ${renderShape("direction")}
        ${this._renderDirectionButtons()}
      </div>
    `;
  }

  // Direction buttons renderer
  _renderDirectionButtons() {
    const { backgroundColor } = this._getStylesConst()
    return html`
      <button class="btn ripple item_sound" @click=${() => this._show_sound_output = true}>
        <ha-icon icon="mdi:speaker"/>
      </button>
      <button class="btn ripple item_up" style="background-color: transparent;" @click=${() => this._click_button("UP")}>
        <ha-icon icon="mdi:chevron-up"/>
      </button>
      <button class="btn ripple item_input" @click=${() => this._show_inputs = true}>
        <ha-icon icon="mdi:import"/>
      </button>
      <button class="btn ripple item_2_sx" style="background-color: transparent;" @click=${() => this._click_button("LEFT")}>
        <ha-icon icon="mdi:chevron-left"/>
      </button>
      <div class="ok_button ripple item_2_c" style="border: solid 2px ${backgroundColor}" @click=${() => this._click_button("ENTER")}>
        OK
      </div>
      <button class="btn ripple item_right" style="background-color: transparent;" @click=${() => this._click_button("RIGHT")}>
        <ha-icon icon="mdi:chevron-right"/>
      </button>
      <button class="btn ripple item_back" @click=${() => this._click_button("BACK")}>
        <ha-icon icon="mdi:undo-variant"/>
      </button>
      <button class="btn ripple item_down" style="background-color: transparent;" @click=${() => this._click_button("DOWN")}>
        <ha-icon icon="mdi:chevron-down"/>
      </button>
      <button class="btn ripple item_exit" @click=${() => this._click_button("EXIT")}>EXIT</button>
    `;
  }

  // Source buttons renderer
  _renderCustomButtons(debuggerEnabled: boolean, stateObj: HassEntity) {
    if (!this.config.buttons) {
      return this._renderDefaultSourceButtons();
    }

    return html`
      <div class="grid-container-source">
        ${this.config.buttons.map(button => this._renderCustomButton(button, stateObj))}
        ${this.config.shortcuts ?
        html`
            <button title="Shortcuts" class="btn_source ripple" @click=${() => this._show_shortcuts = true}>
              <ha-icon icon="mdi:gesture-tap-button"/>
            </button>
          ` : ''}
        ${debuggerEnabled ?
        html`
            <button title="Debug" class="btn_source ripple" @click=${() => this._show_debug = true}>
              <ha-icon icon="mdi:bug-check"/>
            </button>
          ` : ''}
      </div>
    `;
  }


  // Default source buttons
  _renderDefaultSourceButtons() {
    return html`
      <div class="grid-container-source">
        <button class="btn_source ripple" @click=${() => this._select_source("Netflix")}>
          <ha-icon style="heigth: 70%; width: 70%;" icon="mdi:netflix"/>
        </button>
        <button class="btn_source ripple" @click=${() => this._select_source("Prime Video")}>
          ${amazonIcon()}
        </button>
        <button class="btn_source ripple" @click=${() => this._select_source("Disney+")}>
          ${disneyIcon()}
        </button>
        <button class="btn_source ripple" @click=${() => this._select_source("DAZN")}>
          ${daznIcon()}
        </button>
      </div>
    `;
  }

  _handleButtonClick(button: ButtonConfig) {
    if (button.action === 'source' && button.source) {
      this._select_source(button.source);
    } else if (button.action === 'script' && button.script_id) {
      this._run_script(button.script_id, button.data);
    } else if (button.action === 'scene' && button.scene_id) {
      this._run_scene(button.scene_id, button.data);
    } else if (button.action === 'automation' && button.automation_id) {
      this._run_automation(button.automation_id, button.data);
    }
  }

  _renderCustomButton(button: ButtonConfig, stateObj: HassEntity) {
    const willRenderText = this._willRenderText(button);
    const isRtl = willRenderText && isRTL(button.text);
    const isCurrentSource = button.action === ButtonAction.source && stateObj.attributes["source"] === button.source;

    return html`
      <button 
        class="btn_source ${isRtl ? 'rtl' : ''} ripple ${isCurrentSource ? 'active' : ''}"
        style="${willRenderText && button.text_color ? `color: ${button.text_color};` : ''}"
        title="${button.tooltip ?? ''}"
        @click=${() => { this._handleButtonClick(button) }}
        ?disabled=${button.action === 'script' && !button.script_id || button.action === 'source' && !button.source}
      >
        <span>
          ${renderButtonMedia(button)}
          ${button.text ?? ""}
        </span>
      </button>
    `;
  }

  _click_button(button: string) {
    this.callServiceFromConfig(button, "webostv.button", {
      entity_id: this.config.entity,
      button: button
    })
  }

  _command(button: string, command: string) {
    this.callServiceFromConfig(button, "webostv.command", {
      entity_id: this.config.entity,
      command: command
    });
  }

  _media_player_turn_on(mac: string) {
    if (this.config.mac) {
      this.hass.callService("wake_on_lan", "send_magic_packet", {
        mac: mac
      });
    } else {
      this._media_player_service("POWER", "turn_on");
    }
  }

  _media_player_service(button: string, service: string) {
    this.callServiceFromConfig(button, `media_player.${service}`, {
      entity_id: this.config.entity,
    });
  }

  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    const plusButton = this.shadowRoot.querySelector("#plusButton");
    const minusButton = this.shadowRoot.querySelector("#minusButton");
    const interval = this.output_entity === this.config.ampli_entity ? 250 : 100;
    let longPressTimer;
    let isLongPress = false;

    // Function to update and call the service
    const updateValue = (service: string) => {
      const customVolumeDownScript = (this.config.replace_buttons ?? []).find((item) => item.button_name.toLowerCase() === "volume_down")
      const customVolumeUpScript = (this.config.replace_buttons ?? []).find((item) => item.button_name.toLowerCase() === "volume_up")

      if (service.toLowerCase() === "volume_down" && customVolumeDownScript) {
        if (customVolumeDownScript.script_id) { this._run_script(customVolumeDownScript.script_id) }
        else if (customVolumeDownScript.scene_id) { this._run_scene(customVolumeDownScript.scene_id) }
        else if (customVolumeDownScript.automation_id) { this._run_automation(customVolumeDownScript.automation_id) }
      } else if (service.toLowerCase() === "volume_up" && customVolumeUpScript) {
        if (customVolumeUpScript.script_id) { this._run_script(customVolumeUpScript.script_id) }
        else if (customVolumeUpScript.scene_id) { this._run_scene(customVolumeUpScript.scene_id) }
        else if (customVolumeUpScript.automation_id) { this._run_automation(customVolumeUpScript.automation_id) }
      }
      else {
        this.callServiceFromConfig(service.toUpperCase(), `media_player.${service}`, {
          entity_id: this.output_entity,
        });
      }
    };

    // Gestore per il pulsante '+' (plusButton)
    plusButton.addEventListener("mousedown", () => {
      if (!isNaN(this.volume_value)) {
        isLongPress = false;
        this._show_vol_text = true;
        longPressTimer = setTimeout(() => {
          isLongPress = true;
          updateValue("volume_up");
          longPressTimer = setInterval(() => updateValue("volume_up"), interval);
        }, 500);
      }
    });

    plusButton.addEventListener("touchstart", (e) => {
      e.preventDefault();
      if (!isNaN(this.volume_value)) {
        isLongPress = false;
        this._show_vol_text = true;
        longPressTimer = setTimeout(() => {
          isLongPress = true;
          updateValue("volume_up");
          longPressTimer = setInterval(() => updateValue("volume_up"), interval);
        }, 500);
      }
    });

    plusButton.addEventListener("mouseup", () => {
      clearTimeout(longPressTimer);
      if (!isLongPress) {
        updateValue("volume_up");
      }
      clearInterval(longPressTimer);
      this.valueDisplayTimeout = setTimeout(() => {
        this._show_vol_text = false;
      }, 500);
    });

    plusButton.addEventListener("touchend", () => {
      clearTimeout(longPressTimer);
      if (!isLongPress) {
        updateValue("volume_up");
      }
      clearInterval(longPressTimer);
      this.valueDisplayTimeout = setTimeout(() => {
        this._show_vol_text = false;
      }, 500);
    });

    // Gestore per il pulsante '-' (minusButton)
    minusButton.addEventListener("mousedown", () => {
      if (!isNaN(this.volume_value)) {
        isLongPress = false;
        this._show_vol_text = true;
        longPressTimer = setTimeout(() => {
          isLongPress = true;
          updateValue("volume_down");
          longPressTimer = setInterval(() => updateValue("volume_down"), interval);
        }, 400);
      }
    });

    minusButton.addEventListener("touchstart", (e) => {
      e.preventDefault();
      if (!isNaN(this.volume_value)) {
        isLongPress = false;
        this._show_vol_text = true;
        longPressTimer = setTimeout(() => {
          isLongPress = true;
          updateValue("volume_down");
          longPressTimer = setInterval(() => updateValue("volume_down"), interval);
        }, 400);
      }
    });

    minusButton.addEventListener("mouseup", () => {
      clearTimeout(longPressTimer);
      if (!isLongPress) {
        updateValue("volume_down");
      }
      clearInterval(longPressTimer);
      this.valueDisplayTimeout = setTimeout(() => {
        this._show_vol_text = false;
      }, 500);
    });

    minusButton.addEventListener("touchend", () => {
      clearTimeout(longPressTimer);
      if (!isLongPress) {
        updateValue("volume_down");
      }
      clearInterval(longPressTimer);
      this.valueDisplayTimeout = setTimeout(() => {
        this._show_vol_text = false;
      }, 500);
    });
  }

  updated(changedProperties) {
    if (changedProperties.has("hass")) {
      const tvEntity: HassEntity = this.hass.states[this.config.entity];
      const spotifyEntity = getSpotifyEntity(this.config, this.hass);
      const spotifyTitle = getSpotifyTitle(this.config, this.hass);
      const newSoundOutput = tvEntity.attributes.sound_output;

      if (newSoundOutput !== this.soundOutput ||
        spotifyTitle !== this._lastSpotifyTitle || spotifyEntity.state !== this._lastSpotifyState) {
        this.soundOutput = newSoundOutput;
        this._lastSpotifyTitle = spotifyTitle;
        this._lastSpotifyState = spotifyEntity.state;
        this.requestUpdate();
      }
    }
  }

  _logAction(domain: string, service: string, serviceData: Record<string, any>) {
    if (this.config.debug) {
      logger("Called action:", { domain, service, serviceData })
    }
  }

  _homeButtonDown(event: MouseEvent | TouchEvent) {
    this.homeisLongPress = false;
    this.homelongPressTimer = setTimeout(() => {
      this.homeisLongPress = true;
      this._click_button("MENU")
    }, 1000); // Tempo in millisecondi per determinare una pressione prolungata
  }

  _homeButtonUp(event: MouseEvent | TouchEvent) {
    clearTimeout(this.homelongPressTimer);
    if (!this.homeisLongPress) {
      this._click_button("HOME")
    }
  }

  _run_action(action: ButtonAction.automation | ButtonAction.scene | ButtonAction.script, actionId: string, data: Record<string, any> = {}) {
    const service = actionId.replaceAll(`${action}.`, "");
    const serviceData = { entity_id: `${action}.${service}`, ...data };
    this._logAction(action, service, serviceData);
    this.hass.callService(action, service, serviceData);
  }

  _run_script(scriptId: string, data: Record<string, any> = {}) {
    this._run_action(ButtonAction.script, scriptId, data);
  }

  _run_scene(sceneId: string, data: Record<string, any> = {}) {
    this._run_action(ButtonAction.scene, sceneId, data);
  }

  _run_automation(automationId: string, data: Record<string, any> = {}) {
    this._run_action(ButtonAction.automation, automationId, data);
  }

  _select_source(source: string) {
    const domain = "media_player";
    const service = "select_source";
    const serviceData = {
      entity_id: this.config.entity,
      source: source
    };

    this._logAction(domain, service, serviceData);
    this.hass.callService(domain, service, serviceData);
  }

  _select_sound_output(sound_output: string) {
    const domain = "webostv";
    const service = "select_sound_output";
    const serviceData = {
      entity_id: this.config.entity,
      sound_output: sound_output
    };

    this._logAction(domain, service, serviceData);
    this.hass.callService(domain, service, serviceData);
    this._show_sound_output = false;
  }

  setConfig(config: LGRemoteControlConfig) {
    if (!config.entity) {
      throw new Error("Invalid configuration");
    }
    const newConfig = {
      ...config,
      spotify_location: config.spotify_location || SpotifyLocation.TOP
    };

    this.config = newConfig;
  }

  getCardSize() {
    return 15;
  }

  callServiceFromConfig(key: string, service: string, serviceData: Record<string, any>) {
    let serviceToUse = service;
    let serviceDataToUse = serviceData;
    if (this.config.keys && key in this.config.keys) {
      const keyConfig = this.config.keys[key];
      serviceToUse = keyConfig["service"];
      serviceDataToUse = keyConfig["data"];
    }

    this._logAction(serviceToUse.split(".")[0], serviceToUse.split(".")[1], serviceDataToUse);
    this.hass.callService(
      serviceToUse.split(".")[0],
      serviceToUse.split(".")[1],
      serviceDataToUse
    );
  }

  static get styles() {
    return globalStyles
  }
}
