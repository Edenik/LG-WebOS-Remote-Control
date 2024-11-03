// Create and register the card editor
import { css, html, LitElement, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

import { EDITOR_CARD_TAG_NAME } from "./const";
import { ButtonAction, ButtonConfig, ButtonType, HomeAssistantFixed, SelectedButton } from "./types";
import { getMediaPlayerEntitiesByPlatform } from "./utils";


const avreceivers = {
  "anthemav": {
    "friendlyName": "Anthem A/V Receivers",
  },
  "arcam_fmj": {
    "friendlyName": "Arcam FMJ Receivers",
  },
  "denonavr": {
    "friendlyName": "Denon, Marantz A/V Receivers",
  },
  "heos": {
    "friendlyName": "Denon heos A/V Receivers",
  },
  "harman_kardon_avr": {
    "friendlyName": "Harman Kardon AVR",
  },
  "monoprice": {
    "friendlyName": "Monoprice 6-Zone Amplifier",
  },
  "onkyo": {
    "friendlyName": "Onkyo A/V Receivers",
  },
  "sonos": {
    "friendlyName": "Sonos",
  },
  "pws66i": {
    "friendlyName": "Soundavo WS66i 6-Zone Amplifier",
  },
  "yamaha": {
    "friendlyName": "Yamaha Network Receivers",
  },
}

const AvReceiverdevicemap = new Map(Object.entries(avreceivers));

enum IconType {
  svg = "svg",
  mdi = "mdi",
  img = "img",
  none = "none"
}
@customElement(EDITOR_CARD_TAG_NAME)
class LgRemoteControlEditor extends LitElement {
  private _config: any;
  private hass: HomeAssistantFixed;
  private _selectedItem: SelectedButton | null = null;
  private _activeTab: ButtonType = ButtonType.button;
  private _isAddingNew: boolean = false;
  private _isFormDirty: boolean = false;
  private _selectedIconType: IconType = IconType.svg;

  static get properties() {
    return {
      hass: {},
      _config: {},
      _selectedItem: { type: Object },
      _activeTab: { type: String },
      _isAddingNew: { type: Boolean },
      _isFormDirty: { type: Boolean },
    };
  }

  private switchTab(tab: ButtonType) {
    this._activeTab = tab;
    this.requestUpdate();
  }

  setConfig(config) {
    const newConfig = {
      ...config,
      buttons: Array.isArray(config.buttons) ? config.buttons : [],
      shortcuts: Array.isArray(config.shortcuts) ? config.shortcuts : []
    };

    this._config = newConfig;
    this.debugLog({ hass: this.hass, config: this._config, fn: "setConfig" })
  }

  // This function is called when the input element of the editor loses focus or is changed
  configChanged(ev) {

    const _config = Object.assign({}, this._config);
    _config[ev.target.name.toString()] = ev.target.value;
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

  configChangedBool(ev) {
    const inputName = ev.target.name;
    // Convert string 'true'/'false' to boolean
    const newValue = ev.target.value === 'true';

    const _config = { ...this._config };
    _config[inputName] = newValue;
    this._config = _config;

    const event = new CustomEvent('config-changed', {
      detail: { config: _config },
      bubbles: true,
      composed: true,
    });

    this.debugLog({ hass: this.hass, event, _config, fn: "configChangedBool" })
    this.dispatchEvent(event);
  }

  colorsConfigChanged(ev) {
    // Controlla se l'evento è scatenato da un'icona
    if (ev.target.tagName === "HA-ICON") {
      const inputName = ev.target.getAttribute("data-input-name");
      if (inputName) {
        const inputElement = this.shadowRoot.querySelector(`[name="${inputName}"]`) as any;
        if (inputElement) {
          // Imposta l'input su una stringa vuota
          inputElement.value = "";

          // Aggiorna la configurazione
          const _config = Object.assign({}, this._config);
          _config["colors"] = { ...(_config["colors"] ?? {}) };
          _config["colors"][inputName] = "";
          this._config = _config;

          // Invia l'evento "config-changed"
          const event = new CustomEvent("config-changed", {
            detail: { config: _config },
            bubbles: true,
            composed: true,
          });

          this.debugLog({ hass: this.hass, event, _config, fn: "colorsConfigChanged" })
          this.dispatchEvent(event);
        }
      }
    } else {
      // Se l'evento non proviene da un'icona, gestisci la modifica dell'input come al solito
      const _config = Object.assign({}, this._config);
      _config["colors"] = { ...(_config["colors"] ?? {}) };
      _config["colors"][ev.target.name.toString()] = ev.target.value;
      this._config = _config;

      // Invia l'evento "config-changed"
      const event = new CustomEvent("config-changed", {
        detail: { config: _config },
        bubbles: true,
        composed: true,
      });

      this.debugLog({ hass: this.hass, event, _config, fn: "colorsConfigChanged" })
      this.dispatchEvent(event);
    }
  }

  _erase_av_receiver() {
    this._config.av_receiver_family = '';
    this.requestUpdate(); // Aggiunta per forzare il render
  }

  dimensionsConfigChanged(ev) {
    // Se l'evento non proviene da un'icona, gestisci la modifica dell'input come al solito
    const _config = Object.assign({}, this._config);
    _config["dimensions"] = { ...(_config["dimensions"] ?? {}) };

    if (ev.target.name === 'border_width') {
      _config["dimensions"][ev.target.name] = ev.target.value + 'px';
    } else {
      _config["dimensions"][ev.target.name] = ev.target.value;
    }

    this._config = _config;

    // Invia l'evento "config-changed"
    const event = new CustomEvent("config-changed", {
      detail: { config: _config },
      bubbles: true,
      composed: true,
    });

    this.debugLog({ hass: this.hass, event, _config, fn: "dimensionsConfigChanged" })
    this.dispatchEvent(event);
  }

  getLgTvEntityDropdown(optionValue) {
    let mediaPlayerEntities = getMediaPlayerEntitiesByPlatform(this.hass, 'webostv');
    let heading = 'LG Media Player Entity';
    let blankEntity = html``;
    if (this._config.tventity == '' || !(mediaPlayerEntities).includes(optionValue)) {
      blankEntity = html`<option value="" selected> - - - - </option> `;
    }
    return html`
            ${heading}:<br>
            <select name="entity" id="entity" class="select-item" .value="${optionValue}"
                    @focusout=${this.configChanged}
                    @change=${this.configChanged} >
                ${blankEntity}
                ${mediaPlayerEntities.map((eid) => {
      if (eid != this._config.tventity) {
        return html`<option value="${eid}">${this.hass.states[eid].attributes.friendly_name || eid}</option> `;
      }
      else {
        return html`<option value="${eid}" selected>${this.hass.states[eid].attributes.friendly_name || eid}</option> `;
      }
    })}
            </select>
            <br>
            <br>`
  }

  setRemoteName(remoteNameValue) {
    let heading = 'Remote Control Name (option):';
    return html`
            ${heading}<br>
            <input type="text" name="name" id="name" style="width: 37.8ch;padding: .6em; font-size: 1em;" .value="${remoteNameValue}"
                   @input=${this.configChanged}
            <br><br>
        `;
  }

  selectMac(macValue) {
    macValue = macValue ?? '00:11:22:33:44:55';
    let heading = 'MAC Address:';
    return html`
            ${heading}<br>
            <input type="text" name="mac" id="mac" style="width: 37.8ch;padding: .6em; font-size: 1em;" .value="${macValue}"
                   @focusout=${this.configChanged}
                   @change=${this.configChanged}>
            <br><br>
        `;
  }

  selectColors(config) {
    let heading = 'Colors Configuration';

    if (!config || !config.colors) {
      config = { colors: { buttons: '', text: '', background: '', border: '' } };
    }

    return html`
            <div class="heading">${heading}:</div>
            <div class="color-selector" class="title">
                <label class="color-item" for="buttons" >Buttons Color:</label>
                <input type="color" name="buttons" id="buttons"  .value="${config.colors && config.colors.buttons || ''}"
                       @input=${this.colorsConfigChanged}></input>
                <ha-icon data-input-name="buttons" icon="mdi:trash-can-outline" @click=${this.colorsConfigChanged}></ha-icon>
 
 
                <label class="color-item" for="text">Text Color:</label>
                <input type="color" name="text" id="text"  .value="${config.colors && config.colors.text || ''}"
                       @input=${this.colorsConfigChanged}></input>
                       <ha-icon data-input-name="text" icon="mdi:trash-can-outline" @click=${this.colorsConfigChanged}></ha-icon>
 
                <label class="color-item" for="background">Background Color:</label>
                <input type="color" name="background" id="background"  .value="${config.colors && config.colors.background || ''}"
                       @input=${this.colorsConfigChanged}></input>
                       <ha-icon data-input-name="background" icon="mdi:trash-can-outline" @click=${this.colorsConfigChanged}></ha-icon>
 
                <label class="color-item" for="border">Border color:</label>
                <input type="color" name="border" id="border"  .value="${config.colors && config.colors.border || ''}"
                        @input=${this.colorsConfigChanged}></input>
                        <ha-icon data-input-name="border" icon="mdi:trash-can-outline" @click=${this.colorsConfigChanged}></ha-icon>
            </div>
        `;
  }

  colorButtonsConfig() {
    // Use actual boolean with default false
    const selectedValue = Boolean(this._config.color_buttons ?? false);

    return html`
      <div>Color buttons config</div>
      <select name="color_buttons" id="color_buttons" class="select-item"
              .value=${String(selectedValue)}
              @change=${this.configChangedBool}
      >
        <option value="true" ?selected=${selectedValue}>On</option>
        <option value="false" ?selected=${!selectedValue}>Off</option>
      </select>
      <br>
    `;
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

  debugConfig() {
    // Use actual boolean instead of string
    const selectedValue = Boolean(this._config.debug ?? false);

    return html`
      <div>Debugger config</div>
      <select name="debug" id="debug" class="select-item"
              .value=${String(selectedValue)} 
              @change=${this.configChangedBool}
      >
        <option value="true" ?selected=${selectedValue}>On</option>
        <option value="false" ?selected=${!selectedValue}>Off</option>
      </select>
      <br>
    `;
  }

  setDimensions(dimensions) {
    let heading = 'Dimensions';

    const borderWidth = parseFloat(dimensions.border_width ?? "1");

    return html`
          <div class="heading">${heading}:</div>
          <br>
          <label for="scale">Card Scale: ${dimensions.scale ?? 1}</label><br>
          <input type="range" min="0.5" max="1.5" step="0.01" .value="${dimensions && dimensions.scale}" id="scale" name="scale" @input=${this.dimensionsConfigChanged} style="width: 40ch;">
          </input>
          <br>
          <br>
          <label for="border_width">Card border width: ${borderWidth}px</label><br>
          <input type="range" min="1" max="5" step="1" .value="${borderWidth}" id="border_width" name="border_width" @input=${this.dimensionsConfigChanged} style="width: 40ch;">
          </input>
          <br>
          </div>
        `;
  }

  getDeviceAVReceiverDropdown(optionvalue) {
    const familykeys = [...AvReceiverdevicemap.keys()];
    const blankEntity = (!this._config.av_receiver_family || this._config.av_receiver_family === '')
      ? html`<option value="" selected> - - - - </option>`
      : '';
    return html`
        <div>AV-Receiver config option:</div>
        <div style="display: flex;width: 40ch;align-items: center;">
         <select 
            name="av_receiver_family"
            id="av_receiver_family"
            class="select-item"
            style="width:100%;"
            .value=${optionvalue}
            @focusout=${this.configChanged}
            @change=${this.configChanged}>
            ${blankEntity}
            ${familykeys.map((family) => {
      const receiverData = AvReceiverdevicemap.get(family);
      return html`
                <option value="${family}" ?selected=${optionvalue === family}>
                  ${receiverData.friendlyName}
                </option>
              `;
    })}
          </select>
          ${this._config.av_receiver_family && this._config.av_receiver_family != '' ? html`
          <ha-icon 
            style="padding-left: 0.8em;"
            icon="mdi:trash-can-outline" 
            @click=${this._erase_av_receiver}
            @mouseover=${() => this.focus()}
          ></ha-icon>`
        : ''}
        </div>
        <br />
    `;
  }

  getMediaPlayerEntityDropdown(optionValue) {
    if (this._config.av_receiver_family) {
      const mediaPlayerEntities = getMediaPlayerEntitiesByPlatform(this.hass, optionValue);
      const blankEntity = (this._config.ampli_entity === '' || !mediaPlayerEntities.includes(optionValue))
        ? html`<option value="" selected> - - - - </option>`
        : '';
      return html`
                A-Receiver config (option):<br>
                <select name="ampli_entity" id="ampli_entity" class="select-item" .value="${optionValue}"
                        @focusout=${this.configChanged}
                        @change=${this.configChanged}>
                    ${blankEntity}
                    ${mediaPlayerEntities.map((eid) => html`
                        <option value="${eid}" ?selected=${eid === this._config.ampli_entity}>
                            ${this.hass.states[eid].attributes.friendly_name || eid}
                        </option>
                    `)}
                </select>
                <br><br>
            `;
    } else {
      return html``; // Gestire il caso in cui `deviceFamily` non corrisponda a nessuna piattaforma
    }
  }


  private handleIconTypeChange(ev: Event) {
    const target = ev.target as HTMLInputElement;
    this._selectedIconType = target.value as IconType;

    // Clear other icon fields when switching types
    if (this._selectedItem) {
      const newConfig = structuredClone(this._config);
      const { type, index } = this._selectedItem;

      if (newConfig[type] && index !== -1) {
        // Clear all icon-related fields
        delete newConfig[type][index].svg;
        delete newConfig[type][index].icon;
        delete newConfig[type][index].img;

        this._selectedItem = {
          ...this._selectedItem,
          button: newConfig[type][index]
        };

        this._config = newConfig;
        this.dispatchEvent(new CustomEvent("config-changed", {
          detail: { config: newConfig },
          bubbles: true,
          composed: true,
        }));
      }
    }

    this.requestUpdate();
  }

  private handleItemSelect(button: ButtonConfig, index: number, type: ButtonType) {
    this._selectedItem = { button, index, type };
    this.requestUpdate();
  }

  private handleItemUpdate(ev: Event) {
    this._isFormDirty = true;
    if (!this._selectedItem) return;
    const { type, index } = this._selectedItem;
    const target = ev.target as HTMLInputElement;
    const field = target.name;
    const value = target.value;

    const newConfig = structuredClone(this._config);

    if (newConfig[type] && index !== -1) {
      try {
        newConfig[type][index][field] = value;
        this._selectedItem = {
          ...this._selectedItem,
          button: newConfig[type][index]
        };
      } catch (error) {
        console.error(error)
      }
    }

    this._config = newConfig;
    this.requestUpdate();

    const event = new CustomEvent("config-changed", {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    });

    this.debugLog({ hass: this.hass, event, fn: "handleItemUpdate" })
    this.dispatchEvent(event);
  }

  private handleAddItem(type: ButtonType) {
    const newConfig = structuredClone(this._config);

    // Ensure arrays exist
    if (!Array.isArray(newConfig.buttons)) newConfig.buttons = [];
    if (!Array.isArray(newConfig.shortcuts)) newConfig.shortcuts = [];

    const newButton: ButtonConfig = {
      tooltip: `New ${type === ButtonType.button ? "Button" : "Shortcut"}`,
      action: ButtonAction.source,
      text: '',
      data: {}
    };

    // Add to the correct array
    if (type === ButtonType.button) {
      newConfig.buttons.push(newButton);
      this._selectedItem = {
        button: newButton,
        index: newConfig.buttons.length - 1,
        type: ButtonType.button
      };
    } else {
      newConfig.shortcuts.push(newButton);
      this._selectedItem = {
        button: newButton,
        index: newConfig.shortcuts.length - 1,
        type: ButtonType.shortcut
      };
    }

    this._isAddingNew = true;
    this._isFormDirty = false;
    this._config = newConfig;

    // Force update
    this.requestUpdate();

    // Dispatch config change event
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    }));
  }



  private handleButtonTypeChange(ev: Event, button: ButtonConfig) {
    const target = ev.target as HTMLInputElement;
    const newAction = target.value as ButtonAction;

    if (button.action === newAction) return;

    const newConfig = structuredClone(this._config);
    const { type, index } = this._selectedItem!;

    if (newConfig[type] && index !== -1) {
      // Clear action-specific fields
      const buttonToUpdate = newConfig[type][index];

      // Clear all action-specific fields
      delete buttonToUpdate.script_id;
      delete buttonToUpdate.scene_id;
      delete buttonToUpdate.automation_id;
      delete buttonToUpdate.data;
      delete buttonToUpdate.name;

      // Set new action
      buttonToUpdate.action = newAction;
      buttonToUpdate.tooltip = `New ${newAction}`;

      this._selectedItem = {
        ...this._selectedItem!,
        button: buttonToUpdate
      };

      this._config = newConfig;
      this.requestUpdate();

      this.dispatchEvent(new CustomEvent("config-changed", {
        detail: { config: newConfig },
        bubbles: true,
        composed: true,
      }));
    }
  }

  private handleBack() {
    if (this._isAddingNew && !this._isFormDirty && this._selectedItem) {
      // Remove the last added item since no changes were made
      const newConfig = structuredClone(this._config);
      const { type, index } = this._selectedItem;

      if (newConfig[type] && newConfig[type].length > index) {
        newConfig[type].splice(index, 1);
        this._config = newConfig;

        this.dispatchEvent(new CustomEvent("config-changed", {
          detail: { config: newConfig },
          bubbles: true,
          composed: true,
        }));
      }
    }

    // Preserve the current tab when going back
    const currentTab = this._selectedItem?.type === ButtonType.shortcut ? ButtonType.shortcut : ButtonType.button;

    this._isAddingNew = false;
    this._selectedItem = null;
    this._isFormDirty = false;
    this._activeTab = currentTab;

    this.requestUpdate();
  }

  private handleDeleteItem(type: ButtonType, index: number) {
    const newConfig = structuredClone(this._config);

    // Get the correct array based on the type
    const items = type === ButtonType.shortcut ?
      (newConfig.shortcuts || []) :
      (newConfig.buttons || []);

    if (!items || index >= items.length) return;

    // Remove the item
    items.splice(index, 1);

    // Update the correct array in config
    if (type === ButtonType.shortcut) {
      newConfig.shortcuts = items;
    } else {
      newConfig.buttons = items;
    }

    // Clear selection if deleted item was selected
    if (this._selectedItem?.type === type && this._selectedItem?.index === index) {
      this._selectedItem = null;
    }

    // Update indices for remaining selected items
    if (this._selectedItem?.type === type && this._selectedItem?.index > index) {
      this._selectedItem.index--;
    }

    this._config = newConfig;
    this.requestUpdate();

    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    }));
  }

  private getSourceList(): string[] {
    if (!this.hass || !this._config.entity || !this.hass.states[this._config.entity]) {
      return [];
    }
    return this.hass.states[this._config.entity].attributes.source_list || [];
  }

  private handleSourceSelect(ev: Event) {
    const target = ev.target as HTMLSelectElement;

    // Update both text and tooltip with the source name
    const sourceName = target.value;
    const newConfig = structuredClone(this._config);
    const { type, index } = this._selectedItem!;

    if (newConfig[type] && index !== -1) {
      newConfig[type][index].text = sourceName;
      newConfig[type][index].tooltip = sourceName;

      this._selectedItem = {
        ...this._selectedItem!,
        button: newConfig[type][index]
      };

      this._config = newConfig;
      this.requestUpdate();

      this.dispatchEvent(new CustomEvent("config-changed", {
        detail: { config: newConfig },
        bubbles: true,
        composed: true,
      }));
    }
  }

  private getScenesList(): Array<{ id: string; name: string }> {
    if (!this.hass) return [];

    return Object.entries(this.hass.states)
      .filter(([entityId]) => entityId.startsWith('scene.'))
      .map(([entityId, state]) => ({
        id: entityId.replace('scene.', ''),
        name: state.attributes.friendly_name || entityId.replace('scene.', '')
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  private getAutomationsList(): Array<{ id: string; name: string }> {
    if (!this.hass) return [];

    return Object.entries(this.hass.states)
      .filter(([entityId]) => entityId.startsWith('automation.'))
      .map(([entityId, state]) => ({
        id: entityId.replace('automation.', ''),
        name: state.attributes.friendly_name || entityId.replace('automation.', '')
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  private renderItemEditor() {
    if (!this._selectedItem) return html``;
    const { button, type } = this._selectedItem;

    // Determine initial icon type if not set
    if (!this._selectedIconType) {
      if (button.svg) this._selectedIconType = IconType.svg;
      else if (button.icon) this._selectedIconType = IconType.mdi;
      else if (button.img) this._selectedIconType = IconType.img;
      else this._selectedIconType = IconType.svg;
    }

    return html`
      <div class="section-header">
        <h3>${type === ButtonType.shortcut ? 'Add Shortcut' : 'Add Button'}</h3>
        <div class="section-actions">
          <button @click=${() => {
        this.handleBack();
        this._activeTab = type === ButtonType.shortcut ? ButtonType.shortcut : ButtonType.button;
      }}>
            <ha-icon icon="mdi:arrow-left"></ha-icon>
          </button>
        </div>
      </div>
      
      <div class="editor-content">
        <!-- Type Selection -->
        <div class="form-group">
          <label class="form-group-label">Button Type:</label>
          <div class="radio-group">
            ${Object.values(ButtonAction).map(action => html`
              <label>
                <input type="radio" 
                  name="buttonType" 
                  value=${action}
                  ?checked=${button.action === action}
                  @change=${(e: Event) => this.handleButtonTypeChange(e, button)}
                >
                ${action.charAt(0).toUpperCase() + action.slice(1)}
              </label>
            `)}
          </div>
        </div>
  
        <!-- Action Selection based on type -->
        ${this.renderActionSelection(button)}
  
        <!-- Icon Selection -->
        <div class="form-group">
          <label class="form-group-label">Icon Type:</label>
          <div class="radio-group">
            <label>
              <input type="radio" 
                name="iconType" 
                value=${IconType.svg}
                ?checked=${this._selectedIconType === IconType.svg}
                @change=${this.handleIconTypeChange}
              >
              SVG URL
            </label>
            <label>
              <input type="radio" 
                name="iconType" 
                value=${IconType.mdi}
                ?checked=${this._selectedIconType === IconType.mdi}
                @change=${this.handleIconTypeChange}
              >
              MDI Icon
            </label>
            <label>
              <input type="radio" 
                name="iconType" 
                value=${IconType.img}
                ?checked=${this._selectedIconType === IconType.img}
                @change=${this.handleIconTypeChange}
              >
              Image URL
            </label>
            <label>
              <input type="radio" 
                name="iconType" 
                value=${IconType.none}
                ?checked=${this._selectedIconType === IconType.none}
                @change=${this.handleIconTypeChange}
              >
              None
            </label>
          </div>
        </div>
  
        <!-- Icon URL/Name input based on selected type -->
        ${this._selectedIconType === IconType.svg ? html`
          <div class="field-group">
            <label>SVG URL:</label>
            <input 
              type="text" 
              name="svg" 
              class="input-field"
              .value=${button.svg || ''} 
              @change=${this.handleItemUpdate}
              placeholder="https://example.com/icon.svg"
            />
            ${button.svg ? html`
              <div class="icon-preview">
                <img src="${button.svg}" alt="Icon preview" />
              </div>
            ` : ''}
          </div>
        ` : this._selectedIconType === IconType.mdi ? html`
          <div class="field-group">
            <label>MDI Icon Name:</label>
            <input 
              type="text" 
              name="icon" 
              class="input-field"
              .value=${button.icon || ''} 
              @change=${this.handleItemUpdate}
              placeholder="mdi:television"
            />
            ${button.icon ? html`
              <div class="icon-preview">
                <ha-icon icon="${button.icon}"></ha-icon>
              </div>
            ` : ''}
          </div>
        ` : this._selectedIconType === IconType.img ? html`
          <div class="field-group">
            <label>Image URL:</label>
            <input 
              type="text" 
              name="img" 
              class="input-field"
              .value=${button.img || ''} 
              @change=${this.handleItemUpdate}
              placeholder="https://example.com/image.png"
            />
            ${button.img ? html`
              <div class="icon-preview">
                <img src="${button.img}" alt="Icon preview" />
              </div>
            ` : ''}
          </div>
        ` : ''}
  
        <!-- Color settings -->
        ${this._selectedIconType !== IconType.none ? html`
          <div class="field-group">
            <label>Icon Color:</label>
            <div class="color-input-container">
              <input 
                type="color" 
                name="color"
                class="color-picker"
                .value=${button.color || '#000000'} 
                @change=${this.handleItemUpdate}
              />
              <input 
                type="text" 
                name="color"
                class="color-text input-field"
                .value=${button.color || ''} 
                @change=${this.handleItemUpdate}
                placeholder="#000000"
              />
              ${button.color ? html`
                <button class="clear-button" @click=${() => this.clearColor('color')}>
                  <ha-icon icon="mdi:close"></ha-icon>
                </button>
              ` : ''}
            </div>
          </div>
        ` : ''}
  
        <!-- Text fields -->
        <div class="field-group">
          <label>Display Text:</label>
          <input 
            type="text" 
            name="text" 
            class="input-field"
            .value=${button.text || ''} 
            @change=${this.handleItemUpdate}
            placeholder="Button text"
          />
        </div>
  
        <div class="field-group">
          <label>Text Color:</label>
          <div class="color-input-container">
            <input 
              type="color" 
              name="text_color"
              class="color-picker"
              .value=${button.text_color || '#000000'} 
              @change=${this.handleItemUpdate}
            />
            <input 
              type="text" 
              name="text_color"
              class="color-text input-field"
              .value=${button.text_color || ''} 
              @change=${this.handleItemUpdate}
              placeholder="#000000"
            />
            ${button.text_color ? html`
              <button class="clear-button" @click=${() => this.clearColor('text_color')}>
                <ha-icon icon="mdi:close"></ha-icon>
              </button>
            ` : ''}
          </div>
        </div>
  
        <div class="field-group">
          <label>Tooltip:</label>
          <input 
            type="text" 
            name="tooltip" 
            class="input-field"
            .value=${button.tooltip || ''} 
            @change=${this.handleItemUpdate}
            placeholder="Hover text"
          />
        </div>
      </div>
  
      <!-- Footer Actions -->
      <div class="editor-footer">
        <button class="delete-button" @click=${() => {
        if (confirm('Are you sure you want to delete this item?')) {
          this.handleDeleteItem(type, this._selectedItem!.index);
          this.handleBack();
        }
      }}>
          <ha-icon icon="mdi:delete"></ha-icon>
          Delete
        </button>
      </div>
    `;
  }

  // Add this helper method for clearing colors
  private clearColor(field: 'color' | 'text_color') {
    if (!this._selectedItem) return;

    const newConfig = structuredClone(this._config);
    const { type, index } = this._selectedItem;

    if (newConfig[type] && index !== -1) {
      delete newConfig[type][index][field];

      this._selectedItem = {
        ...this._selectedItem,
        button: newConfig[type][index]
      };

      this._config = newConfig;
      this.requestUpdate();

      this.dispatchEvent(new CustomEvent("config-changed", {
        detail: { config: newConfig },
        bubbles: true,
        composed: true,
      }));
    }
  }

  private handleActionSelect(ev: Event) {
    const target = ev.target as HTMLSelectElement;
    if (!this._selectedItem) return;

    const value = target.value;
    const newConfig = structuredClone(this._config);
    const { type, index } = this._selectedItem;

    if (newConfig[type] && index !== -1) {
      const button = newConfig[type][index];
      const [prefix, id] = value.split('.');

      // Clear previous action data
      delete button.script_id;
      delete button.scene_id;
      delete button.automation_id;
      delete button.name;
      delete button.data;

      // Set new data based on action type
      switch (button.action) {
        case ButtonAction.source:
          button.name = value;
          button.tooltip = value;
          break;
        case ButtonAction.script:
          button.script_id = id;
          button.data = {};
          button.tooltip = this.getScriptServices()[id]?.name || id;
          break;
        case ButtonAction.scene:
          button.scene_id = id;
          button.tooltip = this.hass.states[`scene.${id}`]?.attributes.friendly_name || id;
          break;
        case ButtonAction.automation:
          button.automation_id = id;
          button.tooltip = this.hass.states[`automation.${id}`]?.attributes.friendly_name || id;
          break;
      }

      this._selectedItem = {
        ...this._selectedItem,
        button: button
      };

      this._config = newConfig;
      this.requestUpdate();

      this.dispatchEvent(new CustomEvent("config-changed", {
        detail: { config: newConfig },
        bubbles: true,
        composed: true,
      }));
    }
  }

  private renderActionSelection(button: ButtonConfig): TemplateResult {
    const actionLabel = {
      [ButtonAction.source]: 'Source',
      [ButtonAction.script]: 'Script',
      [ButtonAction.scene]: 'Scene',
      [ButtonAction.automation]: 'Automation'
    }[button.action];

    let options: Array<{ value: string; label: string; selected: boolean }> = [];
    let currentValue = '';

    switch (button.action) {
      case ButtonAction.source:
        options = this.getSourceList().map(source => ({
          value: source,
          label: source,
          selected: button.name === source
        }));
        currentValue = button.name || '';
        break;

      case ButtonAction.script:
        options = this.getScriptsList().map(script => ({
          value: `script.${script.id}`,
          label: script.name,
          selected: button.script_id === script.id
        }));
        currentValue = button.script_id ? `script.${button.script_id}` : '';
        break;

      case ButtonAction.scene:
        options = this.getScenesList().map(scene => ({
          value: `scene.${scene.id}`,
          label: scene.name,
          selected: button.scene_id === scene.id
        }));
        currentValue = button.scene_id ? `scene.${button.scene_id}` : '';
        break;

      case ButtonAction.automation:
        options = this.getAutomationsList().map(automation => ({
          value: `automation.${automation.id}`,
          label: automation.name,
          selected: button.automation_id === automation.id
        }));
        currentValue = button.automation_id ? `automation.${button.automation_id}` : '';
        break;
    }

    return html`
      <div class="field-group">
        <label>${actionLabel}:</label>
        <select 
          class="select-item"
          @change=${this.handleActionSelect}
          .value=${currentValue}
        >
          <option value="" ?selected=${!currentValue}>Select a ${actionLabel.toLowerCase()}</option>
          ${options.map(option => html`
            <option 
              value="${option.value}"
              ?selected=${option.selected}
            >
              ${option.label}
            </option>
          `)}
        </select>
        ${button.action === ButtonAction.script && button.script_id ?
        this.renderScriptFields(button.script_id, button.data) : ''}
      </div>
    `;
  }

  private renderTypeSelection(button: ButtonConfig): TemplateResult {
    return html`
      <div class="form-group">
        <label class="form-group-label">Button Type:</label>
        <div class="radio-group">
          ${Object.values(ButtonAction).map(action => html`
            <label>
              <input type="radio" 
                name="buttonType" 
                value=${action}
                ?checked=${button.action === action}
                @change=${(e: Event) => this.handleButtonTypeChange(e, button)}
              >
              ${action.charAt(0).toUpperCase() + action.slice(1)}
            </label>
          `)}
        </div>
      </div>
      ${this.renderActionSelection(button)}
    `;
  }

  private handleReorder(type: ButtonType, index: number, direction: "up" | "down") {
    const newConfig = structuredClone(this._config);

    // Get the correct array based on the type
    const items = type === ButtonType.shortcut ?
      (newConfig.shortcuts || []) :
      (newConfig.buttons || []);

    if (!items || items.length < 2) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;

    // Check bounds
    if (newIndex < 0 || newIndex >= items.length) return;

    // Swap items
    [items[newIndex], items[index]] = [items[index], items[newIndex]];

    // Update the correct array in config
    if (type === ButtonType.shortcut) {
      newConfig.shortcuts = items;
    } else {
      newConfig.buttons = items;
    }

    // Update selected item index if it was moved
    if (this._selectedItem?.type === type && this._selectedItem?.index === index) {
      this._selectedItem.index = newIndex;
    } else if (this._selectedItem?.type === type && this._selectedItem?.index === newIndex) {
      this._selectedItem.index = index;
    }

    this._config = newConfig;
    this.requestUpdate();

    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    }));
  }

  private renderSection(type: ButtonType, buttons: ButtonConfig[]) {
    if (!buttons) return html``;

    return html`
      <div class="list-container">
        ${buttons.map((button: ButtonConfig, index: number) => html`
          <div class="list-item-wrapper">
            ${this.renderButtonItem(button, index, type)}
            <div class="item-actions">
              <ha-icon 
                  icon="mdi:arrow-up"
                  class="reorder ${index === 0 ? 'disabled' : ''}"
                  @click=${(e: Event) => {
        e.stopPropagation();
        if (index > 0) this.handleReorder(type, index, "up");
      }}
              ></ha-icon>
              <ha-icon 
                  icon="mdi:arrow-down"
                  class="reorder ${index === buttons.length - 1 ? 'disabled' : ''}"
                  @click=${(e: Event) => {
        e.stopPropagation();
        if (index < buttons.length - 1) this.handleReorder(type, index, "down");
      }}
              ></ha-icon>
              <ha-icon 
                  icon="mdi:delete"
                  class="trash" 
                  @click=${(e: Event) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this item?')) {
          this.handleDeleteItem(type, index);
        }
      }}
              ></ha-icon>
            </div>
          </div>
        `)}
      </div>
    `;
  }

  private renderAddButton(type: ButtonType, title: string, text?: string) {
    return html`
          <button
            title="${title}"
            @click=${() => this.handleAddItem(type)}>
            <ha-icon icon="mdi:plus"></ha-icon> 
            ${text}</button>`
  }
  private renderButtonsAndShortcutsEditor() {
    // Ensure arrays exist and are initialized
    const buttons = Array.isArray(this._config.buttons) ? this._config.buttons : [];
    const shortcuts = Array.isArray(this._config.shortcuts) ? this._config.shortcuts : [];

    return html`
      <div class="defined-buttons-list">
        <div class="tab-navigation">
          <button 
            class="tab-button ${this._activeTab === ButtonType.button ? 'active' : ''}"
            @click=${() => this.switchTab(ButtonType.button)}
            ?disabled=${this._isAddingNew}
          >
            <ha-icon icon="mdi:remote"></ha-icon>
            Buttons
          </button>
          <button 
            class="tab-button ${this._activeTab === ButtonType.shortcut ? 'active' : ''}"
            @click=${() => this.switchTab(ButtonType.shortcut)}
            ?disabled=${this._isAddingNew}
          >
            <ha-icon icon="mdi:gesture-tap-button"></ha-icon>
            Shortcuts
          </button>
        </div>
  
        ${this._isAddingNew ?
        this.renderItemEditor() :
        html`
            ${this._activeTab === ButtonType.button ? html`
              <div class="section-header">
                <h3>Buttons</h3>
                <div class="section-actions">
                  <button
                    title="Add Button"
                    @click=${() => this.handleAddItem(ButtonType.button)}>
                    <ha-icon icon="mdi:plus"></ha-icon>
                  </button>
                </div>
              </div>
              <div class="list-container">
                ${this.renderSection(ButtonType.button, buttons)}
              </div>
            ` : html`
              <div class="section-header">
                <h3>Shortcuts</h3>
                <div class="section-actions">
                  ${this.renderAddButton(ButtonType.shortcut, "Add Shortcut")}
                </div>
              </div>
              ${this.renderSection(ButtonType.shortcut, shortcuts)}
            `}
          `}
      </div>
    `;
  }


  private renderButtonItem(button: ButtonConfig, index: number, identifier: ButtonType) {
    return html`
      <div class="list-item ${this._selectedItem?.button === button ? 'selected' : ''}"
           @click=${() => this.handleItemSelect(button, index, identifier)}>
        <div class="item-preview">
          ${button.icon ? html`<ha-icon icon="${button.icon}"></ha-icon>` : ''}
          ${button.img ? html`<img src="${button.img}" alt="${button.tooltip || ''}" />` : ''}
          ${button.svg ? html`<img src="${button.svg}" alt="${button.tooltip || ''}" />` : ''}
        </div>
        <div class="item-info">
          <span>${button.tooltip || 'Unnamed Item'}</span>
          ${button.data ? html`
            <span class="item-data">
              ${Object.entries(button.data).map(([key, value]) => html`
                <span class="data-item">${key}: ${value}</span>
              `)}
            </span>
          ` : ''}
        </div>
      </div>
    `;
  }


  private renderBasicConfig() {
    return html`
        <ha-expansion-panel header="Basic Configuration">
            <div class="section-content">
                <div class="field-group">
                    <label class="field-label">LG Media Player Entity</label>
                    <div class="device-config">
                        <select name="entity" class="select-item" .value="${this._config.entity}"
                                @focusout=${this.configChanged}
                                @change=${this.configChanged}>
                            ${this._config.entity ? '' : html`<option value="" selected> - - - - </option>`}
                            ${getMediaPlayerEntitiesByPlatform(this.hass, 'webostv').map((eid) => html`
                                <option value="${eid}" ?selected=${eid === this._config.entity}>
                                    ${this.hass.states[eid].attributes.friendly_name || eid}
                                </option>
                            `)}
                        </select>
                    </div>
                </div>

                <div class="field-group">
                    <label class="field-label">MAC Address</label>
                    <input type="text" class="input-field" name="mac"
                           .value="${this._config.mac || '00:11:22:33:44:55'}"
                           @focusout=${this.configChanged}
                           @change=${this.configChanged}>
                </div>

                <div class="field-group">
                    <label class="field-label">Remote Control Name (optional)</label>
                    <input type="text" class="input-field" name="name"
                           .value="${this._config.name || ''}"
                           @input=${this.configChanged}>
                </div>
            </div>
        </ha-expansion-panel>
    `;
  }

  private renderAppearanceConfig() {
    const colors = this._config.colors || {};
    return html`
        <ha-expansion-panel header="Appearance Configuration">
            <div class="section-content">
                <div class="field-group">
                    <label class="field-label">Colors</label>
                    <div class="color-config">
                        <div class="color-item">
                            <span class="color-label">Buttons Color</span>
                            <div class="color-input-group">
                                <input type="color" class="color-input" name="buttons"
                                       .value="${colors.buttons || ''}"
                                       @input=${this.colorsConfigChanged}>
                                <ha-icon data-input-name="buttons" icon="mdi:trash-can-outline"
                                        @click=${this.colorsConfigChanged}></ha-icon>
                            </div>
                        </div>

                        <div class="color-item">
                            <span class="color-label">Text Color</span>
                            <div class="color-input-group">
                                <input type="color" class="color-input" name="text"
                                       .value="${colors.text || ''}"
                                       @input=${this.colorsConfigChanged}>
                                <ha-icon data-input-name="text" icon="mdi:trash-can-outline"
                                        @click=${this.colorsConfigChanged}></ha-icon>
                            </div>
                        </div>

                        <div class="color-item">
                            <span class="color-label">Background Color</span>
                            <div class="color-input-group">
                                <input type="color" class="color-input" name="background"
                                       .value="${colors.background || ''}"
                                       @input=${this.colorsConfigChanged}>
                                <ha-icon data-input-name="background" icon="mdi:trash-can-outline"
                                        @click=${this.colorsConfigChanged}></ha-icon>
                            </div>
                        </div>

                        <div class="color-item">
                            <span class="color-label">Border Color</span>
                            <div class="color-input-group">
                                <input type="color" class="color-input" name="border"
                                       .value="${colors.border || ''}"
                                       @input=${this.colorsConfigChanged}>
                                <ha-icon data-input-name="border" icon="mdi:trash-can-outline"
                                        @click=${this.colorsConfigChanged}></ha-icon>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="dimensions-group">
                    <div class="slider-group">
                        <div class="slider-label">
                            <span>Card Scale</span>
                            <span class="slider-value">${this._config.dimensions?.scale || 1}</span>
                        </div>
                        <input type="range" min="0.5" max="1.5" step="0.01"
                               .value="${this._config.dimensions?.scale || 1}"
                               name="scale"
                               @input=${this.dimensionsConfigChanged}>
                    </div>

                    <div class="slider-group">
                        <div class="slider-label">
                            <span>Border Width</span>
                            <span class="slider-value">${parseFloat(this._config.dimensions?.border_width || 1)}px</span>
                        </div>
                        <input type="range" min="1" max="5" step="1"
                               .value="${parseFloat(this._config.dimensions?.border_width || 1)}"
                               name="border_width"
                               @input=${this.dimensionsConfigChanged}>
                    </div>
                </div>
            </div>
        </ha-expansion-panel>
    `;
  }

  private renderAdvancedConfig() {
    return html`
        <ha-expansion-panel header="Advanced Configuration">
            <div class="section-content">
                <div class="field-group">
                    <label class="field-label">Display Color Buttons</label>
                    <select name="color_buttons" class="select-item"
                            .value=${String(this._config.color_buttons ?? false)}
                            @change=${this.configChangedBool}>
                        <option value="true" ?selected=${Boolean(this._config.color_buttons)}>On</option>
                        <option value="false" ?selected=${!Boolean(this._config.color_buttons)}>Off</option>
                    </select>
                </div>

                <div class="field-group">
                    <label class="field-label">Debug Mode</label>
                    <select name="debug" class="select-item"
                            .value=${String(this._config.debug ?? false)}
                            @change=${this.configChangedBool}>
                        <option value="true" ?selected=${Boolean(this._config.debug)}>On</option>
                        <option value="false" ?selected=${!Boolean(this._config.debug)}>Off</option>
                    </select>
                </div>

                <div class="field-group">
                    <label class="field-label">AV Receiver</label>
                    <div class="device-config">
                        <select name="av_receiver_family" class="select-item device-select"
                                .value=${this._config.av_receiver_family || ''}
                                @focusout=${this.configChanged}
                                @change=${this.configChanged}>
                            ${!this._config.av_receiver_family ? html`<option value="" selected> - - - - </option>` : ''}
                            ${[...AvReceiverdevicemap.entries()].map(([family, data]) => html`
                                <option value="${family}" ?selected=${family === this._config.av_receiver_family}>
                                    ${data.friendlyName}
                                </option>
                            `)}
                        </select>
                        ${this._config.av_receiver_family ? html`
                            <button class="clear-button" @click=${this._erase_av_receiver}>
                                <ha-icon icon="mdi:trash-can-outline"></ha-icon>
                            </button>
                        ` : ''}
                    </div>
                </div>

                ${this._config.av_receiver_family ? html`
                    <div class="field-group">
                        <label class="field-label">AV Receiver Entity</label>
                        <select name="ampli_entity" class="select-item"
                                .value=${this._config.ampli_entity || ''}
                                @focusout=${this.configChanged}
                                @change=${this.configChanged}>
                            ${!this._config.ampli_entity ? html`<option value="" selected> - - - - </option>` : ''}
                            ${getMediaPlayerEntitiesByPlatform(this.hass, this._config.av_receiver_family).map(eid => html`
                                <option value="${eid}" ?selected=${eid === this._config.ampli_entity}>
                                    ${this.hass.states[eid].attributes.friendly_name || eid}
                                </option>
                            `)}
                        </select>
                    </div>
                ` : ''}
            </div>
        </ha-expansion-panel>
    `;
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
            
            <!-- Buttons and Shortcuts Editor -->
            <ha-expansion-panel header="Buttons & Shortcuts">
                <div class="section-content">
                    ${this.renderButtonsAndShortcutsEditor()}
                </div>
            </ha-expansion-panel>

            <div style="margin-top: 16px;">
                <p>Other functionalities must be configured manually in code editor</p>
                <p>References to <a href="https://github.com/madmicio/LG-WebOS-Remote-Control">https://github.com/madmicio/LG-WebOS-Remote-Control</a></p>
            </div>
        </div>
    `;
  }

  private getScriptServices(): Record<string, any> {
    return this.hass?.services?.script || {};
  }

  private getScriptsList(): Array<{ id: string, name: string }> {
    const scripts = this.getScriptServices();
    return Object.entries(scripts).map(([id, service]) => ({
      id,
      name: service.name || id
    })).sort((a, b) => a.name.localeCompare(b.name));
  }

  private handleScriptSelect(ev: Event) {
    const target = ev.target as HTMLSelectElement;
    if (!this._selectedItem) return;

    const scriptId = target.value;
    const newConfig = structuredClone(this._config);
    const { type, index } = this._selectedItem;

    if (newConfig[type] && index !== -1) {
      // Update script_id and clear previous data
      newConfig[type][index].script_id = scriptId;
      newConfig[type][index].data = {};
      newConfig[type][index].tooltip = this.getScriptServices()[scriptId]?.name || scriptId;

      this._selectedItem = {
        ...this._selectedItem,
        button: newConfig[type][index]
      };

      this._config = newConfig;
      this.requestUpdate();

      this.dispatchEvent(new CustomEvent("config-changed", {
        detail: { config: newConfig },
        bubbles: true,
        composed: true,
      }));
    }
  }

  private renderScriptFields(scriptId: string, currentData: Record<string, any> = {}): TemplateResult | '' {
    if (!scriptId) return '';

    const scriptService = this.getScriptServices()[scriptId];
    if (!scriptService?.fields) return '';

    return html`
        ${Object.entries(scriptService.fields).map(([fieldName, field]: [string, any]) => html`
            <div class="field-group">
                <label>${field.name || fieldName}${field.required ? ' *' : ''}:</label>
                <input 
                    type="text" 
                    name="data.${fieldName}"
                    placeholder="${field.example || ''}"
                    .value=${currentData[fieldName] || ''}
                    @change=${(ev: Event) => this.handleScriptFieldUpdate(ev, fieldName)}
                />
                ${field.description ? html`
                    <div class="field-description">${field.description}</div>
                ` : ''}
            </div>
        `)}
    `;
  }

  private handleScriptFieldUpdate(ev: Event, fieldName: string) {
    if (!this._selectedItem) return;

    const target = ev.target as HTMLInputElement;
    const value = target.value;

    const newConfig = structuredClone(this._config);
    const { type, index } = this._selectedItem;

    if (newConfig[type] && index !== -1) {
      // Initialize data object if it doesn't exist
      if (!newConfig[type][index].data) {
        newConfig[type][index].data = {};
      }

      if (value) {
        newConfig[type][index].data[fieldName] = value;
      } else {
        delete newConfig[type][index].data[fieldName];
      }

      this._selectedItem = {
        ...this._selectedItem,
        button: newConfig[type][index]
      };

      this._config = newConfig;
      this.requestUpdate();

      this.dispatchEvent(new CustomEvent("config-changed", {
        detail: { config: newConfig },
        bubbles: true,
        composed: true,
      }));
    }
  }

  static get styles() {
    return css`
        /* Container and Layout Styles */
        .container {
            display: flex;
            flex-direction: column;
            gap: 16px;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
        }

        .card-content {
            display: flex;
            flex-direction: column;
            gap: 16px;
            padding: 16px;
        }

        .section-content {
            padding: 16px;
        }

        /* Field Styles */
        .field-row {
            display: flex;
            flex-direction: column;
            gap: 8px;
            width: 100%;
        }

        .field-group {
            display: flex;
            flex-direction: column;
            gap: 4px;
            margin-bottom: 16px;
            width: 100%;
        }

        .field-label {
            font-weight: 500;
            margin-bottom: 4px;
            color: var(--primary-text-color);
        }

        .field-description {
            font-size: 0.85em;
            color: var(--secondary-text-color);
            margin-top: 4px;
            font-style: italic;
        }

        /* Input Styles */
        .select-item {
            width: 100%;
            padding: 8px;
            border: 1px solid var(--divider-color, #e0e0e0);
            border-radius: 4px;
            background: var(--card-background-color, white);
            color: var(--primary-text-color);
            box-sizing: border-box;
        }

        .input-field {
            width: 100%;
            padding: 8px;
            border: 1px solid var(--divider-color, #e0e0e0);
            border-radius: 4px;
            background: var(--card-background-color, white);
            color: var(--primary-text-color);
            box-sizing: border-box;
        }

        /* Color Configuration Styles */
        .color-config {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            width: 100%;
        }

        .color-item {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .color-label {
            flex: 1;
        }

        .color-input-group {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .color-input {
            padding: 4px;
            border: 1px solid var(--divider-color, #e0e0e0);
            border-radius: 4px;
            width: 50px;
        }

        /* Toggle and Slider Styles */
        .toggle-group {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 8px 0;
        }

        .toggle-label {
            font-weight: 500;
        }

        .dimensions-group {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .slider-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .slider-label {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .slider-value {
            font-size: 0.9em;
            color: var(--secondary-text-color);
        }

        /* Device Configuration Styles */
        .device-config {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .device-select {
            flex: 1;
        }

        .clear-button {
            padding: 8px;
            border: none;
            border-radius: 4px;
            background: var(--error-color);
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .clear-button:hover {
            background: var(--error-color-darker, #c62828);
        }

        /* Icon Styles */
        ha-icon {
            --mdc-icon-size: 20px;
            color: var(--secondary-text-color);
        }

        /* Button Editor Styles */
        .editor-section {
            display: grid;
            grid-template-columns: 1fr;
            gap: 20px;
            margin: 20px 0;
            max-width: 100%;
        }

        .defined-buttons-list {
            border: 1px solid var(--divider-color, #e0e0e0);
            padding: 16px;
            border-radius: 4px;
            width: 100%;
            box-sizing: border-box;
            max-width: 100%;
            overflow: hidden;
        }

        .list-container {
            max-height: 400px;
            overflow-y: auto;
            width: 100%;
            box-sizing: border-box;
            padding-right: 4px;
        }

        /* Updated List Item Styles */
        .list-item-wrapper {
            position: relative;
            display: flex;
            align-items: center;
            width: 100%;
            box-sizing: border-box;
            padding-right: 8px;
        }

        .list-item {
            flex: 1;
            width: 100%;
            min-width: 0;
            padding: 8px;
            cursor: pointer;
            border-radius: 4px;
            margin: 4px 0;
            display: flex;
            align-items: center;
            box-sizing: border-box;
            overflow: hidden;
        }

        .list-item:hover {
            background-color: var(--secondary-background-color);
        }

        .list-item.selected {
            background-color: var(--primary-color);
            color: var(--text-primary-color);
        }

        .item-preview {
            width: 24px;
            height: 24px;
            margin-right: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .item-preview img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }

        .item-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
            min-width: 0;
            flex: 1;
            overflow: hidden;
        }

        .item-info span {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .item-data {
            font-size: 0.8em;
            color: var(--secondary-text-color);
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
        }

        .data-item {
            background: var(--secondary-background-color);
            padding: 2px 6px;
            border-radius: 4px;
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        /* Updated Action Button Styles */
        .item-actions {
            position: absolute;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
            display: none;
            gap: 4px;
            padding: 4px;
            background: var(--card-background-color);
            border-radius: 4px;
            box-shadow: var(--ha-card-box-shadow, 0 2px 2px 0 rgba(0, 0, 0, 0.14));
            z-index: 1;
        }

        .list-item-wrapper:hover .item-actions {
            display: flex;
        }

        .list-item.selected ~ .item-actions {
            display: flex;
        }

        .item-actions ha-icon {
            padding: 6px;
            border-radius: 4px;
            cursor: pointer;
            color: var(--primary-text-color);
            background: var(--card-background-color);
            transition: background-color 0.2s;
        }

        .item-actions ha-icon.trash {
            color: var(--error-color);
        }

        .item-actions ha-icon.reorder {
            color: var(--primary-text-color);
        }

        .item-actions ha-icon.reorder.disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .item-actions ha-icon:hover:not(.disabled) {
            background-color: var(--secondary-background-color);
        }

        /* Form and Radio Group Styles */
        .form-group {
            margin-bottom: 24px;
            width: 100%;
        }

        .form-group-label {
            display: block;
            font-weight: 500;
            margin-bottom: 8px;
            color: var(--primary-text-color);
        }

        .radio-group {
            display: flex;
            gap: 16px;
            padding: 8px;
            border: 1px solid var(--divider-color, #e0e0e0);
            border-radius: 4px;
            background: var(--secondary-background-color, #f5f5f5);
            flex-wrap: wrap;
        }

        .radio-group label {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
        }

        .radio-group input[type="radio"] {
            margin: 0;
        }

        /* Tab Navigation Styles */
        .tab-navigation {
            display: flex;
            gap: 8px;
            margin-bottom: 16px;
            border-bottom: 1px solid var(--divider-color, #e0e0e0);
            width: 100%;
            box-sizing: border-box;
        }

        .tab-button {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: transparent;
            border: none;
            border-bottom: 2px solid transparent;
            cursor: pointer;
            color: var(--primary-text-color);
            transition: all 0.2s ease;
        }

        .tab-button:hover {
            background-color: var(--secondary-background-color);
        }

        .tab-button.active {
            border-bottom-color: var(--primary-color);
            color: var(--primary-color);
        }

        .tab-button ha-icon {
            width: 20px;
            height: 20px;
        }

        /* Section Header Styles */
        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            width: 100%;
        }

        .section-header h3 {
            margin: 0;
            font-size: 1.1em;
            font-weight: 500;
        }

        .section-actions {
            display: flex;
            gap: 8px;
        }

        .section-actions button {
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 4px;
            background: transparent;
            border: 1px solid var(--divider-color, #e0e0e0);
            display: flex;
            align-items: center;
            gap: 4px;
            transition: background-color 0.2s;
        }

        .section-actions button:hover {
            background-color: var(--secondary-background-color);
        }

        /* Expansion Panel Styles */
        ha-expansion-panel {
            --expansion-panel-summary-padding: 0 16px;
            border-radius: 8px;
            overflow: hidden;
        }

        ha-expansion-panel[open] {
            margin-bottom: 16px;
        }

        /* Textarea Styles */
        textarea {
            width: 100%;
            min-height: 100px;
            padding: 8px;
            font-family: monospace;
            white-space: pre;
            border: 1px solid var(--divider-color, #e0e0e0);
            border-radius: 4px;
            box-sizing: border-box;
            background: var(--card-background-color);
            color: var(--primary-text-color);
        }

        /* Link Styles */
        a {
            color: var(--primary-color);
            text-decoration: none;
        }

        a:hover {
            text-decoration: underline;
        }

        /* Additional utility styles */
        input[type="range"] {
            width: 100%;
            -webkit-appearance: none;
            appearance: none;
            height: 6px;
            background: var(--primary-color);
            border-radius: 3px;
            cursor: pointer;
        }

        input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: var(--primary-color);
            border: 2px solid white;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        input[type="range"]::-moz-range-thumb {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: var(--primary-color);
            border: 2px solid white;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
    `;
  }
}
