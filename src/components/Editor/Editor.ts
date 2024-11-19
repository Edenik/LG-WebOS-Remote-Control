import { css, html, LitElement, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { getMdiIconsList } from "../../common/icons";
import { renderButtonMedia, renderIcon, renderImage, renderSvg } from "../../common/media-renderer";
import { areObjectsEqual, capitalizeFirstLetter, getMediaPlayerEntitiesByPlatform, pluralToSingular } from "../../common/utils";
import { AvReceiverdevicemap, Components } from "../../constants/constants";
import { ButtonAction, ButtonConfig, ButtonType, IconType, SelectedButton } from "../../types/buttons";
import { LGRemoteControlConfig, SpotifyLocation } from "../../types/config";
import { HomeAssistantFixed } from "../../types/home-assistant";
import { formatValidationErrors, validateButtonConfig, ValidationError } from "../../utils/validation";

// import components
import "./components/BasicConfig/BasicConfig";
import "./components/BasicConfig/SpotifyConfig";

@customElement(Components.RemoteControlEditor)
export class LgRemoteControlEditor extends LitElement {
  private _config: LGRemoteControlConfig;
  private hass: HomeAssistantFixed;
  private _selectedItem: SelectedButton | null = null;
  private _originalItem: ButtonConfig | null = null;
  private _activeTab: ButtonType = ButtonType.buttons;
  private _isAddingNew: boolean = false;
  private _isEditing: boolean = false;
  private _isFormDirty: boolean = false;
  private _selectedIconType: IconType = IconType.mdi;

  static get properties() {
    return {
      hass: {},
      _config: {},
      _selectedItem: { type: Object },
      _activeTab: { type: String },
      _isAddingNew: { type: Boolean },
      _isFormDirty: { type: Boolean },
      _selectedIconType: { type: String },
      _isEditing: { type: Boolean },
    };
  }

  private switchTab(tab: ButtonType) {
    this._activeTab = tab;
    this.requestUpdate();
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

  configChangedBool(ev: Event) {
    const target = ev.target as HTMLInputElement
    const inputName = target.name;
    // Convert string 'true'/'false' to boolean
    const newValue = target.value === 'true';

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

  colorsConfigChanged(ev: Event) {
    // Controlla se l'evento è scatenato da un'icona
    const target = ev.target as HTMLInputElement
    if (target.tagName === "HA-ICON") {
      const inputName = target.getAttribute("data-input-name");
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
      _config["colors"][target.name.toString()] = target.value;
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

  dimensionsConfigChanged(ev: Event) {
    // Se l'evento non proviene da un'icona, gestisci la modifica dell'input come al solito
    const _config = Object.assign({}, this._config);
    _config["dimensions"] = { ...(_config["dimensions"] ?? {}) };
    const target = ev.target as HTMLInputElement

    if (target.name === 'border_width') {
      _config["dimensions"][target.name] = target.value + 'px';
    } else {
      _config["dimensions"][target.name] = target.value;
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

  debugLog(log: Record<string, any>) {
    if (this.isDebuggerEnabled()) {
      console.log({ ...log, file: "editor.ts" })
    }
  }

  isDebuggerEnabled() {
    // Use Boolean type coercion with default false
    return Boolean(this._config.debug ?? false);
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

  private handleEdit(type: ButtonType, index: number) {
    // Store the original item state
    const originalButton = this._config[type][index];
    this._originalItem = structuredClone(originalButton);

    // Set the selected item and display the edit form
    this._selectedItem = { button: originalButton, index, type };
    this._isFormDirty = false;
    this._activeTab = type;
    this._isEditing = true;

    // Determine initial icon type
    if (originalButton.svg) this._selectedIconType = IconType.svg;
    else if (originalButton.icon) this._selectedIconType = IconType.mdi;
    else if (originalButton.img) this._selectedIconType = IconType.img;
    else this._selectedIconType = IconType.none;

    // Force update
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
        if (field.startsWith('data.')) {
          // Handle nested data fields
          const dataField = field.split('.')[1];
          if (!newConfig[type][index].data) {
            newConfig[type][index].data = {};
          }
          newConfig[type][index].data[dataField] = value;
        } else {
          newConfig[type][index][field] = value;
        }

        this._selectedItem = {
          ...this._selectedItem,
          button: newConfig[type][index]
        };

        // Compare with original state to determine if there are actual changes
        if (this._originalItem) {
          this._isFormDirty = !areObjectsEqual(newConfig[type][index], this._originalItem);
        }

        // Always update the config
        this._config = newConfig;

        // Always dispatch config changes
        this.dispatchEvent(new CustomEvent("config-changed", {
          detail: { config: newConfig },
          bubbles: true,
          composed: true,
        }));

      } catch (error) {
        console.error(error);
      }
    }

    this.requestUpdate();
  }

  private handleAddItem(type: ButtonType) {
    const newConfig = structuredClone(this._config);

    // Ensure arrays exist
    if (!Array.isArray(newConfig.buttons)) newConfig.buttons = [];
    if (!Array.isArray(newConfig.shortcuts)) newConfig.shortcuts = [];

    const newButton: ButtonConfig = {
      name: "",
      tooltip: `New ${capitalizeFirstLetter(pluralToSingular(type))}`,
      action: ButtonAction.source,
      text: '',
      data: {}
    };

    // Add to the correct array
    if (type === ButtonType.buttons) {
      newConfig.buttons.push(newButton);
      this._selectedItem = {
        button: newButton,
        index: newConfig.buttons.length - 1,
        type: ButtonType.buttons
      };
    } else {
      newConfig.shortcuts.push(newButton);
      this._selectedItem = {
        button: newButton,
        index: newConfig.shortcuts.length - 1,
        type: ButtonType.shortcuts
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

  private handleButtonActionChange(ev: Event, button: ButtonConfig) {
    const target = ev.target as HTMLInputElement;
    const newAction = target.value as ButtonAction;

    if (button.action === newAction) return;

    const newConfig = structuredClone(this._config);
    const { type, index } = this._selectedItem!;

    console.log({ target, newAction, newConfig, type, index, selectedItem: this._selectedItem })
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

      // Update selected item with new button configuration
      this._selectedItem = {
        ...this._selectedItem!,
        button: buttonToUpdate
      };

      this._config = newConfig;

      // Force a re-render of the component
      this.requestUpdate();

      // Dispatch config change event
      this.dispatchEvent(new CustomEvent("config-changed", {
        detail: { config: newConfig },
        bubbles: true,
        composed: true,
      }));
    }
  }

  private handleBack() {
    if (!this._selectedItem) {
      this._resetEditorState();
      return;
    }

    const { type, index } = this._selectedItem;
    const currentItem: ButtonConfig = this._config[type][index];
    const errors: ValidationError[] = validateButtonConfig(currentItem, { hass: this.hass });

    // Determine if we're in add mode or edit mode with changes
    const isAddMode = this._isAddingNew;

    // If there are validation errors or unsaved changes
    if (errors.length > 0) {
      if (errors.length > 0) {
        // Case 1: Validation errors exist
        const validationMessage = formatValidationErrors(errors);
        const message = isAddMode
          ? `The following validation errors were found:\n\n${validationMessage}\n\nThis item will be deleted if you continue.`
          : `The following validation errors were found:\n\n${validationMessage}\n\nYour changes will be discarded if you continue.`;
        if (!window.confirm(message)) {
          // User clicked Cancel - stay on the edit form
          return;
        }
      }
    }

    // User either confirmed or there were no changes/errors
    this._handleBackConfirmed(errors);
  }

  private _handleBackConfirmed(errors: ValidationError[]) {
    const newConfig = structuredClone(this._config);
    const { type, index } = this._selectedItem!;

    if (this._isAddingNew) {
      // In add mode, only remove the item if there are validation errors
      if (errors.length > 0 && newConfig[type] && newConfig[type].length > index) {
        // Remove the invalid item
        newConfig[type].splice(index, 1);
        this._config = newConfig;

        // Dispatch config change event to remove invalid item
        this.dispatchEvent(new CustomEvent("config-changed", {
          detail: { config: newConfig },
          bubbles: true,
          composed: true,
        }));
      } else if (errors.length === 0) {
        // Item is valid, keep it and dispatch the config
        this._config = newConfig;
        this.dispatchEvent(new CustomEvent("config-changed", {
          detail: { config: newConfig },
          bubbles: true,
          composed: true,
        }));
      }
    } else if (this._isFormDirty && this._originalItem && this._selectedItem) {
      // In edit mode with changes, revert to original state only if there are errors
      if (errors.length > 0) {
        newConfig[type][index] = structuredClone(this._originalItem);
        this._config = newConfig;

        // Dispatch config change event with restored state
        this.dispatchEvent(new CustomEvent("config-changed", {
          detail: { config: newConfig },
          bubbles: true,
          composed: true,
        }));
      }
    }

    this._resetEditorState();
  }

  private _resetEditorState() {
    // Preserve the current tab when going back
    const currentTab = this._selectedItem?.type === ButtonType.shortcuts ? ButtonType.shortcuts : ButtonType.buttons;

    this._isAddingNew = false;
    this._isEditing = false;
    this._selectedItem = null;
    this._isFormDirty = false;
    this._activeTab = currentTab;
    this._selectedIconType = IconType.mdi;
    this._originalItem = null; // Clear the original item state

    this.requestUpdate();
  }

  private handleDeleteItem(type: ButtonType, index: number) {
    const newConfig = structuredClone(this._config);

    // Get the correct array based on the type
    const items = type === ButtonType.shortcuts ?
      (newConfig.shortcuts || []) :
      (newConfig.buttons || []);

    if (!items || index >= items.length) return;

    // Remove the item
    items.splice(index, 1);

    // Update the correct array in config
    if (type === ButtonType.shortcuts) {
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

  private onTrashClick(type: ButtonType) {
    this.handleDeleteItem(type, this._selectedItem!.index);
    this.handleBack();
    this._activeTab = type;
  }

  private renderItemEditor() {
    if (!this._selectedItem) return html``;
    const { button, type } = this._selectedItem;

    // Determine if we're editing or adding
    const isEditing = !this._isAddingNew;
    const headerText = isEditing ? `Edit ${pluralToSingular(type)}` : `Add ${pluralToSingular(type)}`;

    // Determine initial icon type if not set
    if (!this._selectedIconType) {
      if (button.svg) this._selectedIconType = IconType.svg;
      else if (button.icon) this._selectedIconType = IconType.mdi;
      else if (button.img) this._selectedIconType = IconType.img;
      else this._selectedIconType = IconType.svg;
    }

    const errors: ValidationError[] = validateButtonConfig(this._config[type][this._selectedItem.index], { hass: this.hass })

    return html`
      <div class="section-header">
        <h3>${headerText}</h3>
        <div class="section-actions">
          ${this.renderErrorsIcon(type, errors)}
          ${this.renderTrashButton(() => { this.onTrashClick(type) }, true)}
          ${this.renderBackButton(type)}
        </div>
      </div>
      
      <div class="editor-content">
        <!-- Name fields -->
        <div class="field-group">
          <label>${capitalizeFirstLetter(pluralToSingular(type))} Name:</label>
          <input 
            type="name" 
            name="name" 
            class="input-field"
            .value=${button.name || ''} 
            @change=${this.handleItemUpdate}
          />
        </div>

        <!-- Action Selection -->
        ${this.renderButtonActionSelection(button, type)}

        <!-- Text field -->
        <div class="field-group">
          <label>Text:</label>
          <input 
            type="text" 
            name="text" 
            class="input-field"
            .value=${button.text || ''} 
            @change=${this.handleItemUpdate}
            placeholder="Button text"
          />
        </div>

        <!-- Tooltip field -->
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

        <!-- Icon Selection -->
        <div class="form-group">
          <label class="form-group-label">Icon Type:</label>
          <div class="radio-group">
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
                value=${IconType.svg}
                ?checked=${this._selectedIconType === IconType.svg}
                @change=${this.handleIconTypeChange}
              >
              SVG URL
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
            <label>SVG URL:  ${button.svg ? renderSvg(button.svg, button.color) : ""}</label>
            <input 
              type="text" 
              name="svg" 
              class="input-field"
              .value=${button.svg || ''} 
              @change=${this.handleItemUpdate}
              placeholder="https://example.com/icon.svg"
            />
          </div>
        ` : this._selectedIconType === IconType.mdi ? html`
            <div class="field-group">
              <label>MDI Icon: ${button.icon ? renderIcon(button.icon, button.color) : ""}</label>
          <div class="icons-grid">
            ${getMdiIconsList().map(icon => html`
                  <div 
                    class="icon-choice ${button.icon === icon.id ? 'selected' : ''}"
                    @click=${() => { this.handleItemUpdate({ target: { name: 'icon', value: icon.id } } as any); }}>
                    <ha-icon icon="${icon.id}"></ha-icon>
                    <span class="icon-label">${icon.name}</span>
                  </div>
                `)
        }
    </div>
      </div>
        ` : this._selectedIconType === IconType.img ? html`
      <div class="field-group">
        <label>Image URL: ${button.img ? renderImage(button.img, button.color) : ''} </label>
          <input type="text" name="img" class="input-field" .value=${button.img || ''}
                 @change=${this.handleItemUpdate} placeholder="https://example.com/image.png"/>
      </div>` : ''}
  
        <!-- Color inputs section -->
        <div class="form-group">
        <label class="form-group-label">Colors:</label>

        <div class="color-fields">
            <!-- Text Color -->
            <div class="color-field-row">
              <label>Text:</label>
              <div class="color-input-container">
                <input 
                  type="color" 
                  name="text_color"
                  class="color-picker"
                  .value=${button.text_color || '#000000'} 
                  @change=${this.handleItemUpdate}
                />
                ${button.text_color ? html`
                  <button class="clear-button" @click=${() => this.clearColor('text_color')}>
                    <ha-icon icon="mdi:close"></ha-icon>
                  </button>
                ` : ''}
              </div>
            </div>

            <!-- Icon Color -->
            ${[IconType.svg, IconType.mdi].includes(this._selectedIconType) ?
        html`
                  <div class="color-field-row">
                    <label>Icon:</label>
                    <div class="color-input-container">
                      <input 
                        type="color" 
                        name="color"
                        class="color-picker"
                        .value=${button.color || '#000000'} 
                        @change=${this.handleItemUpdate}
                      />
                      ${button.color ? html`
                        <button class="clear-button" @click=${() => this.clearColor('color')}>
                          <ha-icon icon="mdi:close"></ha-icon>
                        </button>
                      ` : ''}
                    </div>
                  </div>
              ` : ""
      }
          </div>
        </div>
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

      // Clear previous action data and parameters
      delete button.script_id;
      delete button.scene_id;
      delete button.source;
      delete button.automation_id;
      delete button.data;

      // Set new data based on action type
      switch (button.action) {
        case ButtonAction.source:
          button.source = value;
          button.tooltip = `Choose source: ${value}`;
          break;
        case ButtonAction.script:
          button.script_id = value;
          button.data = {}; // Initialize empty parameters object
          button.tooltip = `Run script: ${this.getActionServices(ButtonAction.script)[value.replace("script.", "")]?.name || value}`;
          break;
        case ButtonAction.scene:
          button.scene_id = value;
          button.data = {}; // Initialize empty parameters object
          button.tooltip = `Run scene: ${this.hass.states[value]?.attributes.friendly_name || value}`;
          break;
        case ButtonAction.automation:
          button.automation_id = value;
          button.data = {}; // Initialize empty parameters object
          button.tooltip = `Run automation: ${this.hass.states[value]?.attributes.friendly_name || value}`;
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

  private fixSelectionValue(action: ButtonAction, value: string) {
    if (!value) return value;
    if (action !== ButtonAction.source && !value.startsWith(action)) return `${action}.${value}`;
    return `${value}`;
  }

  private getActionParameters(action: ButtonAction, id: string): Record<string, any> {
    switch (action) {
      case ButtonAction.script:
        const scriptService = this.getActionServices(ButtonAction.script)[id];
        return scriptService?.fields || {};

      case ButtonAction.scene:
        const sceneEntity = this.hass.states[`scene.${id}`];
        return sceneEntity?.attributes?.parameters || {};

      case ButtonAction.automation:
        const automationEntity = this.hass.states[`automation.${id}`];
        return automationEntity?.attributes?.parameters || {};

      default:
        return {};
    }
  }

  private renderActionParameters(button: ButtonConfig): TemplateResult {
    let parameters = {};

    if (button.action === ButtonAction.script && button.script_id) {
      parameters = this.getActionParameters(ButtonAction.script, button.script_id);
    } else if (button.action === ButtonAction.scene && button.scene_id) {
      parameters = this.getActionParameters(ButtonAction.scene, button.scene_id);
    } else if (button.action === ButtonAction.automation && button.automation_id) {
      parameters = this.getActionParameters(ButtonAction.automation, button.automation_id);
    }

    if (Object.keys(parameters).length === 0) {
      return html``;
    }

    return html`
      <div class="parameters-group">
        <label class="form-group-label">Parameters:</label>
        ${Object.entries(parameters).map(([key, field]: [string, any]) => html`
          <div class="field-group">
            <label>${field.name || key}${field.required ? ' *' : ''}:</label>
            <input 
              type="text" 
              name="data.${key}"
              class="input-field"
              placeholder="${field.example || ''}"
              .value=${(button.data && button.data[key]) || ''}
              @change=${this.handleItemUpdate}
            />
            ${field.description ? html`
              <div class="field-description">${field.description}</div>
            ` : ''}
          </div>
        `)}
      </div>
    `;
  }

  private renderActionSelection(button: ButtonConfig): TemplateResult {
    let options: Array<{ value: string; label: string; }> = [];
    let currentValue = '';

    switch (button.action) {
      case ButtonAction.source:
        options = this.getSourceList().map(source => ({
          value: source,
          label: source,
        }));
        currentValue = button.source || '';
        break;

      case ButtonAction.script:
        const scriptValue = button.script_id ? this.fixSelectionValue(ButtonAction.script, button.script_id) : '';
        options = this.getScriptsList().map(script => {
          const fullValue = this.fixSelectionValue(ButtonAction.script, script.id);
          return {
            value: fullValue,
            label: script.name,
          };
        });
        currentValue = scriptValue;
        break;

      case ButtonAction.scene:
        const sceneValue = button.scene_id ? this.fixSelectionValue(ButtonAction.scene, button.scene_id) : '';
        options = this.getScenesList().map(scene => {
          const fullValue = this.fixSelectionValue(ButtonAction.scene, scene.id);
          return {
            value: fullValue,
            label: scene.name,
          };
        });
        currentValue = sceneValue;
        break;

      case ButtonAction.automation:
        const automationValue = button.automation_id ? this.fixSelectionValue(ButtonAction.automation, button.automation_id) : '';
        options = this.getAutomationsList().map(automation => {
          return {
            value: this.fixSelectionValue(ButtonAction.automation, automation.id),
            label: automation.name,
          };
        });
        currentValue = automationValue;
        break;
    }

    const articleForAction: string = button.action === ButtonAction.automation ? "an" : "a";

    return html`
      <div class="field-group">
        <label>${capitalizeFirstLetter(pluralToSingular(button.action))}:</label>
        <select 
          class="select-item"
          @change=${this.handleActionSelect}
          .value=${currentValue}
        >
          <option value="" ?selected=${!Boolean(currentValue)}>Select ${articleForAction} ${pluralToSingular(button.action)}</option>
          ${options.map(option => html`
            <option 
              value="${option.value}"
              ?selected=${currentValue === this.fixSelectionValue(button.action, option.value)}>
              ${option.label}
            </option>
          `)}
        </select>
        ${this.renderActionFields(button.script_id || button.scene_id || button.automation_id, button.action, button.data)}
      </div>
    `;
  }

  private renderButtonActionSelection(button: ButtonConfig, type: ButtonType): TemplateResult {
    return html`
      <div class="form-group">
        <label class="form-group-label">${capitalizeFirstLetter(pluralToSingular(type))} Action:</label>
        <div class="radio-group">
          ${Object.values(ButtonAction).map(action => html`
            <label>
              <input type="radio" 
                name="buttonType" 
                value=${action}
                ?checked=${button.action === action}
                @change=${(e: Event) => this.handleButtonActionChange(e, button)}
              >
                ${capitalizeFirstLetter(pluralToSingular(action))}
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
    const items = type === ButtonType.shortcuts ?
      (newConfig.shortcuts || []) :
      (newConfig.buttons || []);

    if (!items || items.length < 2) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;

    // Check bounds
    if (newIndex < 0 || newIndex >= items.length) return;

    // Swap items
    [items[newIndex], items[index]] = [items[index], items[newIndex]];

    // Update the correct array in config
    if (type === ButtonType.shortcuts) {
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
            ${this.renderButtonItem(button)}
            <div class="item-actions">
              <ha-icon 
                icon="mdi:arrow-up"
                class="reorder ${index === 0 ? 'disabled' : ''}"
                @click=${(e: Event) => {
        e.stopPropagation();
        if (index > 0) this.handleReorder(type, index, "up");
      }}>
              </ha-icon>
              <ha-icon 
                icon="mdi:arrow-down"
                class="reorder ${index === buttons.length - 1 ? 'disabled' : ''}"
                @click=${(e: Event) => {
        e.stopPropagation();
        if (index < buttons.length - 1) this.handleReorder(type, index, "down");
      }}>
              </ha-icon>
              <ha-icon icon="mdi:pencil"
                @click=${(e: Event) => { this.handleEdit(type, index) }}>
              </ha-icon>
              ${this.renderTrashButton(() => { this.handleDeleteItem(type, index); })}
            </div>
          </div>
        `)}
      </div>
    `;
  }

  private renderBackButton(type: ButtonType) {
    return html`
     <button title="Back" @click=${() => { this.handleBack(); this._activeTab = type; }}>
        <ha-icon icon="mdi:arrow-right"></ha-icon>
     </button>`
  }

  private renderTrashButton(fn: Function, buttonWrapper: boolean = false) {
    const onClick = (e: Event) => {
      e.stopPropagation();
      if (confirm('Are you sure you want to delete this item?')) {
        fn()
      }
    };
    const iconHtml = html`
    <ha-icon 
    icon="mdi:delete"
    class="trash" 
    title="Delete"
    @click=${!buttonWrapper && onClick}
></ha-icon>
`
    if (buttonWrapper) {
      return html`<button title="Delete" @click=${onClick}>${iconHtml}</button>`
    }

    return iconHtml;
  }

  private renderErrorsIcon(type: ButtonType, errors: ValidationError[]) {
    return html`<button 
                  @click=${() => { this.handleBack(); this._activeTab = type; }}
                  ?disabled=${errors.length > 0}
                  class="errors-indicator ${errors.length ? 'has-error' : 'no-error'}" 
                  title="${formatValidationErrors(errors)}">
                  ${errors.length ? errors.length : html`<ha-icon icon="mdi:check-bold"></ha-icon>`}
                </button>`
  }

  private renderAddButton(type: ButtonType) {
    return html`
          <button
            title="${`Add ${pluralToSingular(type)}`}"
            @click=${() => this.handleAddItem(type)}>
            <ha-icon icon="mdi:plus"></ha-icon> 
          </button>`
  }

  private renderButtonsAndShortcutsEditor() {
    // Ensure arrays exist and are initialized
    const buttons = Array.isArray(this._config.buttons) ? this._config.buttons : [];
    const shortcuts = Array.isArray(this._config.shortcuts) ? this._config.shortcuts : [];

    return html`
      <div class="defined-buttons-list">
        <div class="tab-navigation">
          <button 
            class="tab-button ${this._activeTab === ButtonType.buttons ? 'active' : ''}"
            @click=${() => this.switchTab(ButtonType.buttons)}
            ?disabled=${this._isAddingNew || this._isEditing}
          >
            <ha-icon icon="mdi:remote"></ha-icon>
            Buttons
          </button>
          <button 
            class="tab-button ${this._activeTab === ButtonType.shortcuts ? 'active' : ''}"
            @click=${() => this.switchTab(ButtonType.shortcuts)}
            ?disabled=${this._isAddingNew || this._isEditing}
          >
            <ha-icon icon="mdi:gesture-tap-button"></ha-icon>
            Shortcuts
          </button>
        </div>
  
        ${(this._isAddingNew || this._isEditing) ?
        this.renderItemEditor() :
        html`
            ${this._activeTab === ButtonType.buttons ? html`
              <div class="section-header">
                <h3>Buttons</h3>
                <div class="section-actions">
                  ${this.renderAddButton(ButtonType.buttons)}
                </div>
              </div>
              <div class="list-container">
                ${this.renderSection(ButtonType.buttons, buttons)}
              </div>
            ` : html`
              <div class="section-header">
                <h3>Shortcuts</h3>
                <div class="section-actions">
                  ${this.renderAddButton(ButtonType.shortcuts)}
                </div>
              </div>
              ${this.renderSection(ButtonType.shortcuts, shortcuts)}
            `}
          `}
      </div>
    `;
  }

  private renderButtonItem(button: ButtonConfig) {
    return html`
      <div title="${button.tooltip}" class="list-item ${this._selectedItem?.button === button ? 'selected' : ''}">
        <div class="item-preview">
          ${renderButtonMedia(button)}
        </div>
        <div class="item-info">
          <span>${button.name || 'Unnamed Item'}</span>
          <span class="item-data">
              <span class="data-item">${capitalizeFirstLetter(button.action)}: ${button.action === "source" ? button.source : button[`${button.action}_id`]}</span>
              ${button.data ? html`
                ${Object.entries(button.data).map(([key, value]) => html`
                    <span class="data-item">${key}: ${value}</span>
                  `)}
          ` : ''}
          </span>
        </div>
      </div>
    `;
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
                            <span class="slider-value">${parseFloat(this._config.dimensions?.border_width || "1")}px</span>
                        </div>
                        <input type="range" min="1" max="5" step="1"
                               .value="${parseFloat(this._config.dimensions?.border_width || "1")}"
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
            <ha-expansion-panel header="Buttons & Shortcuts" expanded>
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

  private getActionServices(action: ButtonAction): Record<string, any> {
    return this.hass?.services[action] || {};
  }

  private getScriptsList(): Array<{ id: string, name: string }> {
    const scripts = this.getActionServices(ButtonAction.script);
    return Object.entries(scripts).map(([id, service]) => ({
      id,
      name: service.name || id
    })).sort((a, b) => a.name.localeCompare(b.name));
  }

  private renderActionFields(entityId: string, action: ButtonAction, data: Record<string, any> = {}): TemplateResult | '' {
    if (!entityId) return '';

    const scriptService = this.getActionServices(action)[entityId.replace(`${action}.`, "")];
    console.log({ scriptService, entityId, action, data, services: this.hass?.services, servicesItems: this.hass?.services[action] })
    if (!scriptService?.fields) return '';

    return html`
      <div class="parameters-section">
        <h3>Script Parameters</h3>
        ${Object.entries(scriptService.fields).map(([fieldName, field]: [string, any]) => html`
          <div class="field-group">
            <label>${field.name || fieldName}${field.required ? ' *' : ''}:</label>
            <input 
              class="input-field"
              type="text" 
              name="data.${fieldName}"
              placeholder="${field.example || ''}"
              .value=${data[fieldName] || ''}
              @change=${(ev: Event) => this.handleScriptFieldUpdate(ev, fieldName)}
            />
            ${field.description ? html`
              <div class="field-description">${field.description}</div>
            ` : ''}
          </div>
        `)}
      </div>
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

        .parameters-section {
          margin-top: 16px;
          padding: 16px;
          border: 1px solid var(--divider-color);
          border-radius: 4px;
          background: var(--secondary-background-color);
        }

        .parameters-section h3 {
          margin: 0 0 16px 0;
          font-size: 16px;
          color: var(--primary-text-color);
        }

        .field-description {
          font-size: 12px;
          color: var(--secondary-text-color);
          margin-top: 4px;
          font-style: italic;
        }
          
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

        .icons-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 8px;
          margin-top: 8px;
          max-height: 200px;
          overflow-y: auto;
          padding: 8px;
          border: 1px solid var(--divider-color);
          border-radius: 4px;
          background: var(--card-background-color);
        }

        .icon-choice {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .icon-choice:hover {
          background-color: var(--secondary-background-color);
        }

        .icon-choice.selected {
          background-color: var(--primary-color);
          color: var(--text-primary-color);
        }

        .icon-choice.selected ha-icon {
          color: var(--text-primary-color);
        }

        .icon-label {
          font-size: 0.9em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .icon-select {
          padding-right: 40px; /* Make room for the preview icon */
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
        .color-fields {
          display: flex;
          flex-direction: row;
          gap: 8px;
          margin-top: 4px;
        }

        .color-field-row {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
        }

        .color-field-row label {
          margin-right: 8px;
          font-weight: normal;
          color: var(--primary-text-color);
        }

        .color-input-container {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }

        .color-picker {
          padding: 4px;
          width: 50px;
          height: 32px;
          border: 1px solid var(--divider-color, #e0e0e0);
          border-radius: 4px;
          cursor: pointer;
        }

        .color-text {
          flex: 1;
        }

        .clear-button {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
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

        .clear-button ha-icon {
          --mdc-icon-size: 18px;
        }

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

        /* Color Input Container Styles */
        .color-input-container {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
        }

        .color-picker {
          padding: 4px;
          width: 50px;
          height: 32px;
          border: 1px solid var(--divider-color, #e0e0e0);
          border-radius: 4px;
          cursor: pointer;
        }

        .color-text {
          flex: 1;
          max-width: calc(100% - 90px); /* Accounts for color picker and clear button */
        }

        .clear-button {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
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

        .clear-button ha-icon {
          --mdc-icon-size: 18px;
        }

        /* Update the existing field-group styles */
        .field-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 16px;
          width: 100%;
        }

        /* Style specifically for color input groups */
        .field-group label {
          font-weight: 500;
          margin-bottom: 4px;
          color: var(--primary-text-color);
        }

        /* Make inputs consistent */
        .input-field {
          width: 100%;
          padding: 8px;
          border: 1px solid var(--divider-color, #e0e0e0);
          border-radius: 4px;
          background: var(--card-background-color, white);
          color: var(--primary-text-color);
          box-sizing: border-box;
          height: 32px;
          font-size: 0.9em;
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

        button.errors-indicator.has-error {
            background-color: var(--error-color);
        }

        button.errors-indicator.no-error {
            background-color: var(--success-color);
        }

        button.errors-indicator.no-error ha-icon {
            color: white;
        }

        button.errors-indicator {
            font-weight: bolder;
            color: var(--primary-text-color);
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
