// Create and register the card editor
import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

import { EDITOR_CARD_TAG_NAME } from "./const";
import { Button, HomeAssistantFixed, SelectedButton } from "./types";
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


@customElement(EDITOR_CARD_TAG_NAME)
class LgRemoteControlEditor extends LitElement {
  private _config: any;
  private hass: HomeAssistantFixed;
  private _selectedItem: SelectedButton | null = null;
  private _activeTab: "buttons" | "shortcuts" = "buttons";

  static get properties() {
    return {
      hass: {},
      _config: {},
      _selectedItem: { type: Object },
      _activeTab: { type: String },  // Add this line
    };
  }

  private switchTab(tab: 'buttons' | 'shortcuts') {
    this._activeTab = tab;
    this.requestUpdate();
  }

  // setConfig works the same way as for the card itself
  setConfig(config) {
    this._config = config;
    this._activeTab = "buttons";
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


  private handleItemSelect(button: Button, index: number, type: "sources" | "scripts" | "shortcuts") {
    this._selectedItem = { button, index, type };
    this.requestUpdate();
  }

  private handleItemUpdate(ev: Event) {
    if (!this._selectedItem) return;
    const { type, index } = this._selectedItem;
    const target = ev.target as HTMLInputElement;
    const field = target.name;
    const value = target.value;

    // Create a copy of the current config
    const newConfig = structuredClone(this._config);

    console.log({ newConfig })
    if (newConfig[type]) {
      if (index !== -1) {
        try {
          console.log({ type, index, field, value, newConfig })
          newConfig[type][index][field] = value;
          // Update the selected item reference
          this._selectedItem.button = newConfig[type][index];
        } catch (error) {
          console.error(error)
        }
      }
    }

    // Dispatch config changed event
    this._config = newConfig;
    const event = new CustomEvent("config-changed", {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    });

    this.debugLog({ hass: this.hass, event, fn: "handleItemUpdate" })
    this.dispatchEvent(event);
  }

  private handleAddItem(type: "sources" | "scripts" | "shortcuts") {
    const newConfig = structuredClone(this._config);

    console.log(`clicked add item with type: ${type}`)
    // Initialize array if it doesn't exist
    if (!newConfig[type]) {
      newConfig[type] = [];
    }

    // Create new blank button based on type
    const newButton: Button = {
      tooltip: `New ${type.slice(0, -1)}`,  // Remove 's' from end
    };

    // Add specific defaults based on type
    if (type === "shortcuts") {
      newButton.script_id = "";
      newButton.data = {};
    }

    newConfig[type].push(newButton);

    // Update config and trigger refresh
    this._selectedItem = {
      button: newButton,
      index: newConfig[type].length - 1,
      type: type
    }
    this._config = newConfig;
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    }));
  }

  private handleDeleteItem(type: "sources" | "scripts" | "shortcuts", index: number) {
    const newConfig = structuredClone(this._config);

    if (newConfig[type] && newConfig[type].length > index) {
      newConfig[type].splice(index, 1);

      // Clear selection if deleted item was selected
      if (this._selectedItem?.type === type && this._selectedItem?.index === index) {
        this._selectedItem = null;
      }

      // Update indices for remaining selected items
      if (this._selectedItem?.type === type && this._selectedItem?.index > index) {
        this._selectedItem.index--;
      }
    }

    this._config = newConfig;
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    }));
  }

  private renderItemEditor() {
    if (!this._selectedItem) return html``;
    const { button, type } = this._selectedItem;

    return html`
      <div class="item-editor">
        <h3>Edit ${button.tooltip || 'Item'}</h3>
        <div class="field-group">
          <label>Name/Tooltip:</label>
          <input 
            type="text" 
            name="tooltip" 
            .value=${button.tooltip || ''} 
            @change=${this.handleItemUpdate}
          />
        </div>
        
        <div class="field-group">
          <label>Icon:</label>
          <input 
            type="text" 
            name="icon" 
            .value=${button.icon || ''} 
            @change=${this.handleItemUpdate}
          />
        </div>
  
        <div class="field-group">
          <label>Color:</label>
          <input 
            type="color" 
            name="color" 
            .value=${button.color || '#000000'} 
            @change=${this.handleItemUpdate}
          />
        </div>
  
        <div class="field-group">
          <label>Image URL:</label>
          <input 
            type="text" 
            name="img" 
            .value=${button.img || ''} 
            @change=${this.handleItemUpdate}
          />
        </div>
  
        <div class="field-group">
          <label>SVG URL:</label>
          <input 
            type="text" 
            name="svg" 
            .value=${button.svg || ''} 
            @change=${this.handleItemUpdate}
          />
        </div>
  
        <div class="field-group">
          <label>Text:</label>
          <input 
            type="text" 
            name="text" 
            .value=${button.text || ''} 
            @change=${this.handleItemUpdate}
          />
        </div>
  
        <div class="field-group">
          <label>Text Color:</label>
          <input 
            type="color" 
            name="text_color" 
            .value=${button.text_color || '#000000'} 
            @change=${this.handleItemUpdate}
          />
        </div>
  
        ${button.script_id ? html`
          <div class="field-group">
            <label>Script ID:</label>
            <input 
              type="text" 
              name="script_id" 
              .value=${button.script_id} 
              @change=${this.handleItemUpdate}
            />
          </div>
        ` : ''}
  
        ${type === 'shortcuts' ? html`
          <div class="field-group">
            <label>Data (JSON):</label>
            <textarea
              name="data"
              .value=${button.data ? JSON.stringify(button.data, null, 2) : ''}
              @change=${this.handleItemUpdate}
            ></textarea>
          </div>
        ` : ''}
      </div>
    `;
  }

  private renderSection(type: "sources" | "scripts" | "shortcuts", buttons: Button[], title: string) {
    return html`
      <div class="list-container">
        ${buttons.map((button: Button, index: number) => html`
          <div class="list-item-wrapper">
            ${this.renderButtonItem(button, index, type)}
            <ha-icon 
              icon="mdi:delete"
              class="trash" 
              @click=${(e: Event) => {
        e.stopPropagation();
        this.handleDeleteItem(type, index);
      }}
            ></ha-icon>
          </div>
        `)}
      </div>
    `;
  }

  private renderAddButton(type: "sources" | "shortcuts" | "scripts", title: string, text?: string) {
    return html`
          <button
            title="${title}"
            @click=${() => this.handleAddItem(type)}>
            <ha-icon icon="mdi:plus"></ha-icon> 
            ${text}</button>`
  }

  // Updated main render method
  private renderButtonsAndShortcutsEditor() {
    const sources = this._config.sources || [];
    const scripts = this._config.scripts || [];
    const shortcuts = this._config.shortcuts || [];

    return html`
      <div class="defined-buttons-list">
        <div class="tab-navigation">
          <button 
            class="tab-button ${this._activeTab === 'buttons' ? 'active' : ''}"
            @click=${() => this.switchTab('buttons')}
          >
            <ha-icon icon="mdi:remote"></ha-icon>
            Buttons
          </button>
          <button 
            class="tab-button ${this._activeTab === 'shortcuts' ? 'active' : ''}"
            @click=${() => this.switchTab('shortcuts')}
          >
            <ha-icon icon="mdi:gesture-tap-button"></ha-icon>
            Shortcuts
          </button>
        </div>
  
        ${this._activeTab === 'buttons' ? html`
          <div class="section-header">
            <h3>Buttons</h3>
            <div class="section-actions">
              ${this.renderAddButton("sources", "Add Source", "Source")}
              ${this.renderAddButton("scripts", "Add Script", "Script")}
            </div>
          </div>
          <div class="list-container">
            ${this.renderSection("sources", sources, "")}
            ${this.renderSection("scripts", scripts, "")}
          </div>
        ` : html`
          <div class="section-header">
            <h3>Shortcuts</h3>
            <div class="section-actions">
              ${this.renderAddButton("shortcuts", "Add Shortcut")}
            </div>
          </div>
          ${this.renderSection("shortcuts", shortcuts, "Shortcuts")}
        `}
      </div>
    `;
  }

  private renderButtonItem(button: Button, index: number, identifier: "sources" | "scripts" | "shortcuts") {
    return html`
      <div 
        class="list-item ${this._selectedItem?.button === button ? 'selected' : ''}"
        @click=${() => this.handleItemSelect(button, index, identifier)}
      >
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

  // Modify the existing render method to include the new components
  render() {
    if (!this.hass || !this._config) {
      return html``;
    }

    return html`
    ${this.getLgTvEntityDropdown(this._config.entity)}
    ${this.selectMac(this._config.mac)}
    ${this.setRemoteName(this._config.name)}
    ${this.selectColors(this._config)}
    ${this.colorButtonsConfig()}
    ${this.debugConfig()}
    ${this.getDeviceAVReceiverDropdown(this._config.av_receiver_family)}
    ${this.getMediaPlayerEntityDropdown(this._config.av_receiver_family)}
    ${this.setDimensions(this._config.dimensions ?? {})}
    
    <!-- Add new components here -->
    <div class="editor-section">
      ${this.renderButtonsAndShortcutsEditor()}
      ${this.renderItemEditor()}
    </div>

    <br>
    <p>Other functionalities must be configured manually in code editor</p>
    <p>references to <a href="https://github.com/madmicio/LG-WebOS-Remote-Control">https://github.com/madmicio/LG-WebOS-Remote-Control</a></p>
    <div class="donations" style="display: flex">
      <!-- Donations section unchanged -->
    </div>
  `;
  }

  // Add these styles to the existing styles
  static get styles() {
    return css`

    .editor-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 20px 0;
    }

    .defined-buttons-list {
      border: 1px solid var(--divider-color, #e0e0e0);
      padding: 16px;
      border-radius: 4px;
      width: 26rem;
    }

    .list-container {
      max-height: 400px;
      overflow-y: auto;
    }

    .list-item {
      display: flex;
      align-items: center;
      padding: 8px;
      cursor: pointer;
      border-radius: 4px;
      margin: 4px 0;
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
    }

    .item-preview img {
      max-width: 100%;
      max-height: 100%;
    }

    .item-editor {
      border: 1px solid var(--divider-color, #e0e0e0);
      padding: 16px;
      border-radius: 4px;
    }

    .field-group {
      margin-bottom: 16px;
    }

    .field-group label {
      display: block;
      margin-bottom: 4px;
    }

    .field-group input {
      width: 100%;
      padding-block: 8px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 4px;
    }


    .divider {
      margin: 24px 0;
      border: none;
      border-top: 1px solid var(--divider-color, #e0e0e0);
    }

    .item-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
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
    }

    textarea {
      width: 100%;
      min-height: 100px;
      padding: 8px;
      font-family: monospace;
      white-space: pre;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 4px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .section-header h3 {
      margin: 0px;
    }

    .section-actions {
      display: flex;
      gap: 8px;
    }

    .section-actions button {
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      background: transparent;
      border: 0;
    }

    .section-actions button:hover {
      background-color: var(--secondary-background-color);
    }

    .list-item-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .list-item-wrapper .list-item {
      flex: 1;
    }

    .list-item-wrapper ha-icon.trash {
      opacity: 0;
      cursor: pointer;
      color: var(--error-color);
      padding: 4px;
      border-radius: 4px;
    }

    .list-item-wrapper:hover ha-icon.trash {
      opacity: 1;
    }

    .list-item-wrapper ha-icon.trash:hover {
      background-color: var(--secondary-background-color);
    }

    .tab-navigation {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      border-bottom: 1px solid var(--divider-color, #e0e0e0);
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
  `;
  }
}
