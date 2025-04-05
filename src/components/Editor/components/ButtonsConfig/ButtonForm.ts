import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getMdiIconsList } from '../../../../common/icons';
import { renderIcon, renderImage, renderSvg } from '../../../../common/media-renderer';
import { capitalizeFirstLetter, pluralToSingular } from '../../../../common/utils';
import { ButtonAction, ButtonConfig, ButtonType, IconType, SelectedButton } from '../../../../types/buttons';
import { LGRemoteControlConfig } from '../../../../types/config';
import { HomeAssistantFixed } from '../../../../types/home-assistant';

@customElement('editor-button-form')
export class EditorButtonForm extends LitElement {
    @property({ type: Object }) public hass!: HomeAssistantFixed;
    @property({ type: Object }) public config!: LGRemoteControlConfig;
    @property({ type: Object }) public selectedButton!: SelectedButton;
    @property({ type: Object }) public type!: ButtonType;
    @property({ type: String }) public iconType!: IconType;

    @state() private parameters: Record<string, any> = {};

    protected firstUpdated() {
        this._updateActionParameters();
    }

    updated(changedProperties: Map<string, any>) {
        if (changedProperties.has('button') && this.selectedButton.button.action) {
            this._updateActionParameters();
        }
    }

    protected render() {
        return html`
      <div class="form-container">
        <!-- Name field -->
        <div class="field-group">
          <label>${capitalizeFirstLetter(pluralToSingular(this.type))} Name:</label>
          <input 
            type="name" 
            name="name" 
            class="input-field"
            .value=${this.selectedButton.button.name || ''} 
            @change=${this._handleInputChange}
            placeholder="Name for this button"
          />
        </div>

        <!-- Action Selection -->
        <div class="form-group">
          <label class="form-group-label">${capitalizeFirstLetter(pluralToSingular(this.type))} Action:</label>
          <div class="radio-group">
            ${Object.values(ButtonAction).map(action => html`
              <label>
                <input type="radio" 
                  name="buttonType" 
                  value=${action}
                  ?checked=${this.selectedButton.button.action === action}
                  @change=${this._handleActionChange}
                >
                  ${capitalizeFirstLetter(pluralToSingular(action))}
              </label>
            `)}
          </div>
        </div>

        <!-- Action-Specific Selection -->
        ${this._renderActionSelection()}

        <!-- Action Parameters -->
        ${this._renderActionParameters()}

        <!-- Text field -->
        <div class="field-group">
          <label>Text:</label>
          <input 
            type="text" 
            name="text" 
            class="input-field"
            .value=${this.selectedButton.button.text || ''} 
            @change=${this._handleInputChange}
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
            .value=${this.selectedButton.button.tooltip || ''} 
            @change=${this._handleInputChange}
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
                ?checked=${this.iconType === IconType.mdi}
                @change=${this._handleIconTypeChange}
              >
              MDI Icon
            </label>
            <label>
              <input type="radio" 
                name="iconType" 
                value=${IconType.svg}
                ?checked=${this.iconType === IconType.svg}
                @change=${this._handleIconTypeChange}
              >
              SVG URL
            </label>
            <label>
              <input type="radio" 
                name="iconType" 
                value=${IconType.img}
                ?checked=${this.iconType === IconType.img}
                @change=${this._handleIconTypeChange}
              >
              Image URL
            </label>
            <label>
              <input type="radio" 
                name="iconType" 
                value=${IconType.none}
                ?checked=${this.iconType === IconType.none}
                @change=${this._handleIconTypeChange}
              >
              None
            </label>
          </div>
        </div>
  
        <!-- Icon URL/Name input based on selected type -->
        ${this._renderIconInput()}

        <!-- Color Settings -->
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
                  .value=${this.selectedButton.button.text_color || '#000000'} 
                  @change=${this._handleInputChange}
                />
                ${this.selectedButton.button.text_color ? html`
                  <button class="clear-button" @click=${() => this._clearColor('text_color')}>
                    <ha-icon icon="mdi:close"></ha-icon>
                  </button>
                ` : ''}
              </div>
            </div>

            <!-- Icon Color -->
            ${[IconType.svg, IconType.mdi].includes(this.iconType) ? html`
              <div class="color-field-row">
                <label>Icon:</label>
                <div class="color-input-container">
                  <input 
                    type="color" 
                    name="color"
                    class="color-picker"
                    .value=${this.selectedButton.button.color || '#000000'} 
                    @change=${this._handleInputChange}
                  />
                  ${this.selectedButton.button.color ? html`
                    <button class="clear-button" @click=${() => this._clearColor('color')}>
                      <ha-icon icon="mdi:close"></ha-icon>
                    </button>
                  ` : ''}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
    }

    private _renderIconInput() {
        switch (this.iconType) {
            case IconType.mdi:
                return html`
          <div class="field-group">
            <label>MDI Icon: ${this.selectedButton.button.icon ? renderIcon(this.selectedButton.button.icon, this.selectedButton.button.color) : ""}</label>
            <div class="icons-grid">
              ${getMdiIconsList().map(icon => html`
                <div 
                  class="icon-choice ${this.selectedButton.button.icon === icon.id ? 'selected' : ''}"
                  @click=${() => this._handleIconSelect(icon.id)}
                >
                  <ha-icon icon="${icon.id}"></ha-icon>
                  <span class="icon-label">${icon.name}</span>
                </div>
              `)}
            </div>
          </div>
        `;
            case IconType.svg:
                return html`
          <div class="field-group">
            <label>SVG URL: ${this.selectedButton.button.svg ? renderSvg(this.selectedButton.button.svg, this.selectedButton.button.color) : ""}</label>
            <input 
              type="text" 
              name="svg" 
              class="input-field"
              .value=${this.selectedButton.button.svg || ''} 
              @change=${this._handleInputChange}
              placeholder="https://example.com/icon.svg"
            />
          </div>
        `;
            case IconType.img:
                return html`
          <div class="field-group">
            <label>Image URL: ${this.selectedButton.button.img ? renderImage(this.selectedButton.button.img, this.selectedButton.button.color) : ''}</label>
            <input 
              type="text" 
              name="img" 
              class="input-field"
              .value=${this.selectedButton.button.img || ''} 
              @change=${this._handleInputChange}
              placeholder="https://example.com/image.png"
            />
          </div>
        `;
            default:
                return '';
        }
    }

    private _renderActionSelection() {
        if (!this.selectedButton.button.action) return '';

        const options = this._getActionOptions();
        const currentValue = this._getCurrentValue();
        const articleForAction = this.selectedButton.button.action === ButtonAction.automation ? "an" : "a";

        return html`
      <div class="field-group">
        <label>${capitalizeFirstLetter(pluralToSingular(this.selectedButton.button.action))}:</label>
        <select 
          class="select-item"
          @change=${this._handleActionSelect}
          .value=${currentValue}
        >
          <option value="" ?selected=${!Boolean(currentValue)}>
            Select ${articleForAction} ${pluralToSingular(this.selectedButton.button.action)}
          </option>
          ${options.map(option => html`
            <option 
              value="${option.value}"
              ?selected=${currentValue === this._fixSelectionValue(this.selectedButton.button.action, option.value)}
            >
              ${option.label}
            </option>
          `)}
        </select>
      </div>
    `;
    }

    private _renderActionParameters() {
        if (Object.keys(this.parameters).length === 0) {
            return html``;
        }

        return html`
      <div class="parameters-group">
        <label class="form-group-label">Parameters:</label>
        ${Object.entries(this.parameters).map(([key, field]: [string, any]) => html`
          <div class="field-group">
            <label>${field.name || key}${field.required ? ' *' : ''}:</label>
            <input 
              type="text" 
              name="data.${key}"
              class="input-field"
              placeholder="${field.example || ''}"
              .value=${(this.selectedButton.button.data && this.selectedButton.button.data[key]) || ''}
              @change=${this._handleParameterChange}
            />
            ${field.description ? html`
              <div class="field-description">${field.description}</div>
            ` : ''}
          </div>
        `)}
      </div>
    `;
    }

    private _updateActionParameters() {
        if (!this.selectedButton.button.action) {
            this.parameters = {};
            return;
        }

        const id = this.selectedButton.button[`${this.selectedButton.button.action}_id`];
        if (!id) {
            this.parameters = {};
            return;
        }

        switch (this.selectedButton.button.action) {
            case ButtonAction.script:
                this.parameters = this.hass.services?.script?.[id]?.fields || {};
                break;
            case ButtonAction.scene:
                this.parameters = this.hass.states[`scene.${id}`]?.attributes?.parameters || {};
                break;
            case ButtonAction.automation:
                this.parameters = this.hass.states[`automation.${id}`]?.attributes?.parameters || {};
                break;
            default:
                this.parameters = {};
        }

        this.requestUpdate();
    }

    private _getActionOptions(): Array<{ value: string; label: string }> {
        switch (this.selectedButton.button.action) {
            case ButtonAction.source:
                return (this.hass.states[this.config.entity]?.attributes?.source_list || [])
                    .map(source => ({ value: source, label: source }));

            case ButtonAction.script:
                return Object.entries(this.hass.states)
                    .filter(([entityId]) => entityId.startsWith('script.'))
                    .map(([entityId, state]) => ({
                        value: entityId.replace('script.', ''),
                        label: state.attributes.friendly_name || entityId.replace('script.', '')
                    }))
                    .sort((a, b) => a.label.localeCompare(b.label));

            case ButtonAction.scene:
                return Object.entries(this.hass.states)
                    .filter(([entityId]) => entityId.startsWith('scene.'))
                    .map(([entityId, state]) => ({
                        value: entityId.replace('scene.', ''),
                        label: state.attributes.friendly_name || entityId.replace('scene.', '')
                    }))
                    .sort((a, b) => a.label.localeCompare(b.label));

            case ButtonAction.automation:
                return Object.entries(this.hass.states)
                    .filter(([entityId]) => entityId.startsWith('automation.'))
                    .map(([entityId, state]) => ({
                        value: entityId.replace('automation.', ''),
                        label: state.attributes.friendly_name || entityId.replace('automation.', '')
                    }))
                    .sort((a, b) => a.label.localeCompare(b.label));

            default:
                return [];
        }
    }

    private _getCurrentValue(): string {
        switch (this.selectedButton.button.action) {
            case ButtonAction.source:
                return this.selectedButton.button.source || '';
            case ButtonAction.script:
                return this.selectedButton.button.script_id ? this._fixSelectionValue(ButtonAction.script, this.selectedButton.button.script_id) : '';
            case ButtonAction.scene:
                return this.selectedButton.button.scene_id ? this._fixSelectionValue(ButtonAction.scene, this.selectedButton.button.scene_id) : '';
            case ButtonAction.automation:
                return this.selectedButton.button.automation_id ? this._fixSelectionValue(ButtonAction.automation, this.selectedButton.button.automation_id) : '';
            default:
                return '';
        }
    }

    private _fixSelectionValue(action: ButtonAction, value: string): string {
        if (!value) return value;
        if (action !== ButtonAction.source && !value.startsWith(action)) {
            return `${action}.${value}`;
        }
        return value;
    }

    private _handleActionChange(ev: Event) {
        const target = ev.target as HTMLInputElement;
        const newAction = target.value as ButtonAction;

        if (this.selectedButton.button.action === newAction) return;

        const changes: Partial<ButtonConfig> = {
            action: newAction,
            script_id: undefined,
            scene_id: undefined,
            automation_id: undefined,
            source: undefined,
            data: {}
        };

        this._emitChange(changes);
    }

    private _handleActionSelect(ev: Event) {
        const target = ev.target as HTMLSelectElement;
        const value = target.value;
        const changes: Partial<ButtonConfig> = {
            data: {},  // Clear previous parameters
        };

        switch (this.selectedButton.button.action) {
            case ButtonAction.source:
                changes.source = value;
                changes.tooltip = `Choose source: ${value}`;
                break;
            case ButtonAction.script:
                changes.script_id = value;
                changes.tooltip = `Run script: ${this.hass.states[`script.${value}`]?.attributes?.friendly_name || value}`;
                break;
            case ButtonAction.scene:
                changes.scene_id = value;
                changes.tooltip = `Run scene: ${this.hass.states[`scene.${value}`]?.attributes?.friendly_name || value}`;
                break;
            case ButtonAction.automation:
                changes.automation_id = value;
                changes.tooltip = `Run automation: ${this.hass.states[`automation.${value}`]?.attributes?.friendly_name || value}`;
                break;
        }

        this._emitChange(changes);
        this._updateActionParameters();
    }

    private _handleIconTypeChange(ev: Event) {
        const target = ev.target as HTMLInputElement;
        this.dispatchEvent(new CustomEvent('icon-type-change', {
            detail: {
                type: target.value,
                changes: {
                    svg: undefined,
                    icon: undefined,
                    img: undefined
                }
            },
            bubbles: true,
            composed: true,
        }));
    }

    private _handleIconSelect(iconId: string) {
        this._emitChange({
            icon: iconId
        });
    }

    private _handleInputChange(ev: Event) {
        const target = ev.target as HTMLInputElement;
        const name = target.name as keyof ButtonConfig;
        this._emitChange({
            [name]: target.value
        });
    }

    private _handleParameterChange(ev: Event) {
        const target = ev.target as HTMLInputElement;
        const key = target.name.replace('data.', '');
        const value = target.value;

        const newData = {
            ...this.selectedButton.button.data,
            [key]: value
        };

        this._emitChange({
            data: newData
        });
    }

    private _clearColor(field: 'color' | 'text_color') {
        this._emitChange({
            [field]: undefined
        });
    }

    private _emitChange(changes: Partial<ButtonConfig>) {
        this.dispatchEvent(new CustomEvent('button-change', {
            detail: { changes },
            bubbles: true,
            composed: true,
        }));
    }

    static styles = css`
            .form-container {
              display: flex;
              flex-direction: column;
              gap: 16px;
            }
        
            .field-group {
              display: flex;
              flex-direction: column;
              gap: 4px;
              margin-bottom: 16px;
              width: 100%;
            }
        
            .field-group label {
              font-weight: 500;
              margin-bottom: 4px;
              color: var(--primary-text-color);
            }
        
            .input-field {
              width: 100%;
              padding: 8px;
              border: 1px solid var(--divider-color);
              border-radius: 4px;
              background: var(--card-background-color);
              color: var(--primary-text-color);
              box-sizing: border-box;
              height: 32px;
              font-size: 0.9em;
            }
        
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
              border: 1px solid var(--divider-color);
              border-radius: 4px;
              background: var(--secondary-background-color);
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
        
            .color-fields {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 16px;
            }
        
            .color-field-row {
              display: flex;
              align-items: center;
              gap: 8px;
            }
        
            .color-field-row label {
              min-width: 80px;
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
              border: 1px solid var(--divider-color);
              border-radius: 4px;
              cursor: pointer;
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
        
            .parameters-group {
              margin-top: 16px;
              padding: 16px;
              border: 1px solid var(--divider-color);
              border-radius: 4px;
              background: var(--secondary-background-color);
            }
        
            .field-description {
              font-size: 12px;
              color: var(--secondary-text-color);
              margin-top: 4px;
              font-style: italic;
            }
        
            .select-item {
              width: 100%;
              padding: 8px;
              border: 1px solid var(--divider-color);
              border-radius: 4px;
              background: var(--card-background-color);
              color: var(--primary-text-color);
              box-sizing: border-box;
            }
        
            ha-icon {
              --mdc-icon-size: 20px;
              color: var(--secondary-text-color);
            }
        
            .field-group.has-error input,
            .field-group.has-error select {
              border-color: var(--error-color);
            }
        
            .field-group.has-error .field-description {
              color: var(--error-color);
            }
          `;
}