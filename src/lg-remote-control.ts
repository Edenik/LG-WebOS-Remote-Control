import { HomeAssistant } from 'custom-card-helpers';
import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { CARD_TAG_NAME, CARD_VERSION, EDITOR_CARD_TAG_NAME } from "./common/const";
import { amazonIcon, arcIcon, daznIcon, disneyIcon, lineOutIcon, opticIcon, tvHeadphonesIcon, tvOpticIcon } from "./common/icons";
import { renderButtonMedia, renderShape } from './common/mediaRenderer';
import { globalStyles } from './common/styles';
import { ButtonConfig, HomeAssistantFixed, WindowWithCards } from "./common/types";
import { getMediaPlayerEntitiesByPlatform } from "./common/utils";
import "./editor";


const line1 = '  LG WebOS Remote Control Card  ';
const line2 = `  version: ${CARD_VERSION}  `;
/* eslint no-console: 0 */
console.info(
  `%c${line1}\n%c${line2}`,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);


// Allow this card to appear in the card chooser menu
const windowWithCards = window as unknown as WindowWithCards;
windowWithCards.customCards = windowWithCards.customCards || [];
windowWithCards.customCards.push({
  type: CARD_TAG_NAME,
  name: "LG WebOS Remote Control Card",
  preview: true,
  description: "Remote control card for LG WebOS TV devices"
});

@customElement(CARD_TAG_NAME)
class LgRemoteControl extends LitElement {
  public hass!: HomeAssistant;
  public config!: any;
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


  static getConfigElement() {
    // Create and return an editor element
    return document.createElement(EDITOR_CARD_TAG_NAME);
  }

  public static getStubConfig(hass: HomeAssistantFixed) {
    let entities = getMediaPlayerEntitiesByPlatform(hass, "webostv");
    if (entities.length == 0) {
      entities = Object.keys(hass.entities).filter(e => e.startsWith("media_player."));
    }
    const entity = entities.length > 0 ? entities[0] : "media_player.lg_webos_smart_tv";
    return {
      "type": `custom:${CARD_TAG_NAME}`,
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

  render() {
    const stateObj = this.hass.states[this.config.entity];
    const debuggerEnabled = this.config.debug;

    if (debuggerEnabled) {
      console.info({ hass: this.hass, config: this.config, state: stateObj, fn: "render", file: "lg-remote-control" })
    }

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

  _willRenderText(item) {
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
  // Main container renderer
  _renderMainContainer(stateObj, config, debuggerEnabled) {
    return html`
        <div class="page" style="${this._getMainStyles()}">
          ${this._renderTitle(config, debuggerEnabled)}
          ${this._renderPowerControls(stateObj)}
          ${this._renderMainContent(stateObj, debuggerEnabled)}
        </div>
      `;
  }

  // Title section
  _renderTitle(config, debuggerEnabled) {
    const tv_name_color = this.config.tv_name_color ? this.config.tv_name_color : "var(--primary-text-color)";

    if (!config.name && !debuggerEnabled) return '';
    return html`
        <div class="tv_title" style="color:${tv_name_color}">
          ${config.name} ${debuggerEnabled ? CARD_VERSION : ""}
        </div>
      `;
  }

  // Power controls section
  _renderPowerControls(stateObj) {
    const { remoteWidth } = this._getStylesConst();

    return html`
        <div class="grid-container-power" style="--remotewidth: ${remoteWidth}">
          <button class="btn-flat flat-high ripple" @click=${() => this._channelList()}>
            <ha-icon icon="mdi:format-list-numbered"/>
          </button>
          ${this._renderPowerButton(stateObj)}
          <button class="btn-flat flat-high ripple" @click=${() => this._show_keypad = !this._show_keypad}>
            123
          </button>
        </div>
      `;
  }

  // Power button
  _renderPowerButton(stateObj) {
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
  _renderMainContent(stateObj, debuggerEnabled: boolean) {
    if (this._show_debug) return this._renderDebugView(stateObj);
    if (this._show_inputs) return this._renderInputsView(stateObj);
    if (this._show_shortcuts) return this._renderShortcutsView(stateObj);
    return this._renderDefaultView(stateObj, debuggerEnabled);
  }

  // Debug view
  _renderDebugView(stateObj) {
    return html`
        <div class="grid-container-input">
          ${renderShape("input")}
          <button class="ripple bnt-input-back" @click=${() => this._show_debug = false}>
            <ha-icon icon="mdi:undo-variant"/>
          </button>
          <p class="source_text"><b>DEBUG</b></p>
          ${this._renderDebugInfo(stateObj)}
        </div>
      `;
  }

  // Debug information
  _renderDebugInfo(stateObj) {
    return html`
        <div class="grid-item-input">
          <p>Entity State</p>
          ${JSON.stringify(stateObj, null, 4)}
        </div>
        <br>
        <div class="grid-item-input">
          <p>Remote Config</p>
          ${JSON.stringify(this.config, null, 4)}
        </div>
        <br>
        <div class="grid-item-input">
          <p>Hass States</p>
          ${JSON.stringify(this.hass.states, null, 4)}
        </div>
      `;
  }

  // Inputs view
  _renderInputsView(stateObj) {
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
  _renderSourceList(stateObj) {
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
  _renderShortcutsView(stateObj) {
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

      return html`
        <button 
          class="btn-input ripple overlay"
          title="${shortcut.tooltip ?? ''}" 
          style="
            width: 95%;
            ${willRenderText ? `color: ${shortcut.text_color ?? ''};` : ''}
          "
          @click=${() => {
          this._run_script(shortcut.script_id, shortcut.data);
          this._show_shortcuts = false;
        }}
        > 
          ${renderButtonMedia(shortcut)} ${shortcut.text ?? ""}
        </button>
      `;
    });
  }


  // Sound view
  _renderSoundView(stateObj) {
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
  _renderSoundText(stateObj) {
    return html`
      <button class="btn_soundoutput ripple" @click=${() => this._show_text = false}>SOUND</button>
      ${this._renderSoundButtons(stateObj, true)}
    `;
  }

  // Sound icons view
  _renderSoundIcons(stateObj) {
    return html`
      <button class="sound_icon_text ripple" @click=${() => this._show_text = true}>
        <ha-icon style="height: calc(var(--remotewidth) / 6); width: calc(var(--remotewidth) / 6);" icon="mdi:speaker">
      </button>
      ${this._renderSoundButtons(stateObj, false)}
    `;
  }

  // Sound buttons renderer
  _renderSoundButtons(stateObj, isText) {
    const buttons = [
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
  _renderSoundButton(stateObj, button, isText) {
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
  _renderDefaultView(stateObj, debuggerEnabled: boolean) {
    return html`
       ${this._show_keypad ? this._renderKeypad() :
        this._show_sound_output ? this._renderSoundView(stateObj) :
          this._renderDirectionPad(stateObj)}
      ${this._renderSourceButtons(debuggerEnabled)}
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
            @click=${() => this._button(command)}>
          </button>
        `)}
      </div>
    `;
  }

  // Volume and channel control renderer with correct grid layout
  _renderVolumeChannelControl(stateObj) {
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
          @click=${() => this._button("CHANNELUP")}>
          <ha-icon icon="mdi:chevron-up"/>
        </button>
  
        <!-- Volume icon button -->
        <button class="btn" 
          style="border-radius: 0px; cursor: default; margin: 0px auto 0px auto; height: 100%;">
          <ha-icon icon="${isMuted ? 'mdi:volume-off' : 'mdi:volume-high'}"/>
        </button>
  
        <!-- Mute button -->
        <button class="btn ripple" 
          style="color:${isMuted ? 'red' : ''}; height: 100%;" 
          @click=${() => customMute && customMute.script_id ? this._run_script(customMute.script_id) : customMute && customMute.scene_id ? this._run_scene(customMute.scene_id) : this._button("MUTE")}>
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
          @click=${() => this._button("INFO")}>
          <ha-icon icon="mdi:information-variant"/>
        </button>
  
        <!-- Channel Down button -->
        <button class="btn ripple" 
          style="border-radius: 0px 0px 50% 50%; margin: 0px auto 0px auto; height: 100%;"  
          @click=${() => this._button("CHANNELDOWN")}>
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
            this._button(num.toString())
          }
        }}>
                  ${num}
                </button>`
        : html`<button class="btn-keypad"></button>`
    })}
    </div>`;
  }

  // Direction pad renderer
  _renderDirectionPad(stateObj) {
    return html`
      <div class="grid-container-cursor">
        ${renderShape("direction")}
        ${this._renderDirectionButtons(stateObj)}
      </div>
    `;
  }

  // Direction buttons renderer
  _renderDirectionButtons(stateObj) {
    const { backgroundColor } = this._getStylesConst()
    return html`
      <button class="btn ripple item_sound" @click=${() => this._show_sound_output = true}>
        <ha-icon icon="mdi:speaker"/>
      </button>
      <button class="btn ripple item_up" style="background-color: transparent;" @click=${() => this._button("UP")}>
        <ha-icon icon="mdi:chevron-up"/>
      </button>
      <button class="btn ripple item_input" @click=${() => this._show_inputs = true}>
        <ha-icon icon="mdi:import"/>
      </button>
      <button class="btn ripple item_2_sx" style="background-color: transparent;" @click=${() => this._button("LEFT")}>
        <ha-icon icon="mdi:chevron-left"/>
      </button>
      <div class="ok_button ripple item_2_c" style="border: solid 2px ${backgroundColor}" @click=${() => this._button("ENTER")}>
        ${this._show_vol_text === true ? this.volume_value : 'OK'}
      </div>
      <button class="btn ripple item_right" style="background-color: transparent;" @click=${() => this._button("RIGHT")}>
        <ha-icon icon="mdi:chevron-right"/>
      </button>
      <button class="btn ripple item_back" @click=${() => this._button("BACK")}>
        <ha-icon icon="mdi:undo-variant"/>
      </button>
      <button class="btn ripple item_down" style="background-color: transparent;" @click=${() => this._button("DOWN")}>
        <ha-icon icon="mdi:chevron-down"/>
      </button>
      <button class="btn ripple item_exit" @click=${() => this._button("EXIT")}>EXIT</button>
    `;
  }

  // Source buttons renderer
  _renderSourceButtons(debuggerEnabled: boolean) {
    if (!this.config.buttons) {
      return this._renderDefaultSourceButtons();
    }

    return html`
      <div class="grid-container-source">
        ${this.config.buttons.map(button => this._renderCustomButton(button))}
        ${this.config.shortcuts ?
        html`
            <button class="btn_source ripple" @click=${() => this._show_shortcuts = true}>
              <ha-icon style="height: 70%; width: 70%;" icon="mdi:format-list-bulleted-square"/>
            </button>
          ` : ''}
        ${debuggerEnabled ?
        html`
            <button class="btn_source ripple" @click=${() => this._show_debug = true}>DBG</button>
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

  // Custom button renderer - handles individual script/scene buttons
  _renderCustomButton(button: ButtonConfig) {
    // Check if this should render as text instead of icon/image
    const willRenderText = this._willRenderText(button);

    // Build style string if text rendering
    const styleString = willRenderText && button.text_color
      ? `color: ${button.text_color};`
      : '';

    return html`
      <button 
        class="btn_source ripple ${willRenderText ? 'btn_text' : ''}"
        style="${styleString}"
        title="${button.tooltip ?? ''}"
        @click=${() => { this._handleButtonClick(button) }}
        ?disabled=${button.action === 'script' && !button.script_id || button.action === 'source' && !button.source}
      >
        ${renderButtonMedia(button)} ${button.text ?? ""}
      </button>
    `;
  }


  // Helper for image color filtering
  _getColorFilter(color) {
    // Convert color to RGB values for filtering
    const rgb = this._hexToRgb(color);
    if (!rgb) return '';

    return `opacity(0.5) drop-shadow(0 0 0 ${color})`;
  }

  _hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace('#', '');

    // Parse hex to rgb
    const bigint = parseInt(hex, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255
    };
  }

  _channelList() {
    const popupEvent = new Event('ll-custom', { bubbles: true, cancelable: false, composed: true });
    (popupEvent as any).detail = {
      "browser_mod": {
        "service": "browser_mod.popup",
        "data": {
          "content": {
            "type": "custom:card-channel-pad",
            "entity": this.config.entity,
            "channels": this.config.channels
          },
          "title": " ",
          "size": "wide",
          "style": "--popup-border-radius: 15px;"
        }
      }
    };
    this.ownerDocument.querySelector("home-assistant").dispatchEvent(popupEvent);
  }

  _button(button) {
    this.callServiceFromConfig(button, "webostv.button", {
      entity_id: this.config.entity,
      button: button
    })
  }

  _command(button, command) {
    this.callServiceFromConfig(button, "webostv.command", {
      entity_id: this.config.entity,
      command: command
    });
  }

  _media_player_turn_on(mac) {
    if (this.config.mac) {
      this.hass.callService("wake_on_lan", "send_magic_packet", {
        mac: mac
      });
    } else {
      this._media_player_service("POWER", "turn_on");
    }
  }

  _media_player_service(button, service) {
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
      const tvEntity = this.hass.states[this.config.entity];
      const newSoundOutput = tvEntity.attributes.sound_output;

      if (newSoundOutput !== this.soundOutput) {
        this.soundOutput = newSoundOutput; // Aggiorna il valore della variabile di classe
        this.requestUpdate(); // Richiedi l'aggiornamento della card
      }
    }
  }

  _debugLog(domain: string, service: string, serviceData: Record<string, any>) {
    if (this.config.debug) {
      console.log({ domain, service, serviceData, fn: "debugLog", file: "lg-remote-control" })
    }
  }

  _homeButtonDown(event: MouseEvent | TouchEvent) {
    this.homeisLongPress = false;
    this.homelongPressTimer = setTimeout(() => {
      this.homeisLongPress = true;
      this._button("MENU")
    }, 1000); // Tempo in millisecondi per determinare una pressione prolungata
  }

  _homeButtonUp(event: MouseEvent | TouchEvent) {
    clearTimeout(this.homelongPressTimer);
    if (!this.homeisLongPress) {
      this._button("HOME")
    }
  }

  _run_action(action: "script" | "automation" | "scene", actionId: string, data: Record<string, any> = {}) {
    const domain = action;
    const service = actionId;
    const serviceData = { entity_id: `${domain}.${actionId}`, ...data };
    this._debugLog(domain, service, serviceData);
    this.hass.callService(domain, service, serviceData);
  }

  _run_script(scriptId: string, data: Record<string, any> = {}) {
    this._run_action("script", scriptId, data);
  }

  _run_scene(sceneId: string, data: Record<string, any> = {}) {
    this._run_action("scene", sceneId, data);
  }

  _run_automation(automationId: string, data: Record<string, any> = {}) {
    this._run_action("automation", automationId, data);
  }

  _select_source(source: string) {
    const domain = "media_player";
    const service = "select_source";
    const serviceData = {
      entity_id: this.config.entity,
      source: source
    };

    this._debugLog(domain, service, serviceData);
    this.hass.callService(domain, service, serviceData);
  }

  _select_sound_output(sound_output) {
    const domain = "webostv";
    const service = "select_sound_output";
    const serviceData = {
      entity_id: this.config.entity,
      sound_output: sound_output
    };

    this._debugLog(domain, service, serviceData);
    this.hass.callService(domain, service, serviceData);
    this._show_sound_output = false;
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error("Invalid configuration");
    }
    this.config = config;
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

    this._debugLog(serviceToUse.split(".")[0], serviceToUse.split(".")[1], serviceDataToUse);
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
