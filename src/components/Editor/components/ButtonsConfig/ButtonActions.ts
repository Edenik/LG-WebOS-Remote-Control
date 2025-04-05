import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { capitalizeFirstLetter, pluralToSingular } from '../../../../common/utils';
import { ButtonAction, ButtonConfig } from '../../../../types/buttons';
import { LGRemoteControlConfig } from '../../../../types/config';
import { HomeAssistantFixed } from '../../../../types/home-assistant';

@customElement('editor-button-actions')
export class ButtonActions extends LitElement {
    @property({ type: Object }) public hass!: HomeAssistantFixed;
    @property({ type: Object }) public button!: ButtonConfig;
    @property({ type: Object }) public config!: LGRemoteControlConfig;

    protected render() {
        return html`
      <div class="form-group">
        <label class="form-group-label">Action Type:</label>
        <div class="radio-group">
          ${Object.values(ButtonAction).map(action => html`
            <label>
              <input 
                type="radio" 
                name="buttonType" 
                value=${action}
                ?checked=${this.button.action === action}
                @change=${this._handleActionTypeChange}
              >
              ${capitalizeFirstLetter(pluralToSingular(action))}
            </label>
          `)}
        </div>
      </div>

      ${this._renderActionSelector()}
      ${this._renderActionParameters()}
    `;
    }

    private _renderActionSelector() {
        const options = this._getActionOptions();
        const currentValue = this._getCurrentValue();
        const articleForAction = this.button.action === ButtonAction.automation ? "an" : "a";

        return html`
      <div class="field-group">
        <label>${capitalizeFirstLetter(pluralToSingular(this.button.action))}:</label>
        <select 
          class="select-item"
          @change=${this._handleActionSelect}
          .value=${currentValue}
        >
          <option value="" ?selected=${!Boolean(currentValue)}>
            Select ${articleForAction} ${pluralToSingular(this.button.action)}
          </option>
          ${options.map(option => html`
            <option 
              value="${option.value}"
              ?selected=${currentValue === this._fixSelectionValue(this.button.action, option.value)}
            >
              ${option.label}
            </option>
          `)}
        </select>
      </div>
    `;
    }

    private _renderActionParameters() {
        const parameters = this._getActionParameters();

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
              name="${key}"
              class="input-field"
              placeholder="${field.example || ''}"
              .value=${(this.button.data && this.button.data[key]) || ''}
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

    private _getActionOptions(): Array<{ value: string, label: string }> {
        switch (this.button.action) {
            case ButtonAction.source:
                return this._getSourceOptions();
            case ButtonAction.script:
                return this._getScriptOptions();
            case ButtonAction.scene:
                return this._getSceneOptions();
            case ButtonAction.automation:
                return this._getAutomationOptions();
            default:
                return [];
        }
    }

    private _getSourceOptions(): Array<{ value: string, label: string }> {
        if (!this.hass || !this.hass.states[this.config.entity]) return [];
        return (this.hass.states[this.config.entity].attributes.source_list || [])
            .map(source => ({
                value: source,
                label: source,
            }));
    }

    private _getScriptOptions(): Array<{ value: string, label: string }> {
        return Object.entries(this.hass.states)
            .filter(([entityId]) => entityId.startsWith('script.'))
            .map(([entityId, state]) => ({
                value: entityId.replace('script.', ''),
                label: state.attributes.friendly_name || entityId.replace('script.', '')
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }

    private _getSceneOptions(): Array<{ value: string, label: string }> {
        return Object.entries(this.hass.states)
            .filter(([entityId]) => entityId.startsWith('scene.'))
            .map(([entityId, state]) => ({
                value: entityId.replace('scene.', ''),
                label: state.attributes.friendly_name || entityId.replace('scene.', '')
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }

    private _getAutomationOptions(): Array<{ value: string, label: string }> {
        return Object.entries(this.hass.states)
            .filter(([entityId]) => entityId.startsWith('automation.'))
            .map(([entityId, state]) => ({
                value: entityId.replace('automation.', ''),
                label: state.attributes.friendly_name || entityId.replace('automation.', '')
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }

    private _getCurrentValue(): string {
        switch (this.button.action) {
            case ButtonAction.source:
                return this.button.source || '';
            case ButtonAction.script:
                return this.button.script_id ? this._fixSelectionValue(ButtonAction.script, this.button.script_id) : '';
            case ButtonAction.scene:
                return this.button.scene_id ? this._fixSelectionValue(ButtonAction.scene, this.button.scene_id) : '';
            case ButtonAction.automation:
                return this.button.automation_id ? this._fixSelectionValue(ButtonAction.automation, this.button.automation_id) : '';
            default:
                return '';
        }
    }

    private _fixSelectionValue(action: ButtonAction, value: string) {
        if (!value) return value;
        if (action !== ButtonAction.source && !value.startsWith(action)) {
            return `${action}.${value}`;
        }
        return value;
    }

    private _getActionParameters(): Record<string, any> {
        if (!this.button.action) return {};

        switch (this.button.action) {
            case ButtonAction.script:
                return this._getServiceFields(ButtonAction.script, this.button.script_id);
            case ButtonAction.scene:
                return this._getServiceFields(ButtonAction.scene, this.button.scene_id);
            case ButtonAction.automation:
                return this._getServiceFields(ButtonAction.automation, this.button.automation_id);
            default:
                return {};
        }
    }

    private _getServiceFields(action: ButtonAction, id?: string): Record<string, any> {
        if (!id) return {};

        const serviceId = id.replace(`${action}.`, "");
        return (this.hass?.services[action]?.[serviceId]?.fields || {});
    }

    private _handleActionTypeChange(ev: Event) {
        const target = ev.target as HTMLInputElement;
        const newAction = target.value as ButtonAction;

        if (this.button.action === newAction) return;

        // Clear action-specific fields
        const changes: Partial<ButtonConfig> = {
            action: newAction,
            script_id: undefined,
            scene_id: undefined,
            automation_id: undefined,
            source: undefined,
            data: {},
        };

        this._emitChange(changes);
    }

    private _handleActionSelect(ev: Event) {
        const target = ev.target as HTMLSelectElement;
        const value = target.value;

        const changes: Partial<ButtonConfig> = {
            data: {}  // Clear previous parameters
        };

        switch (this.button.action) {
            case ButtonAction.source:
                changes.source = value;
                changes.tooltip = `Choose source: ${value}`;
                break;
            case ButtonAction.script:
                changes.script_id = value;
                changes.tooltip = `Run script: ${this._getDisplayName(value)}`;
                break;
            case ButtonAction.scene:
                changes.scene_id = value;
                changes.tooltip = `Run scene: ${this._getDisplayName(value)}`;
                break;
            case ButtonAction.automation:
                changes.automation_id = value;
                changes.tooltip = `Run automation: ${this._getDisplayName(value)}`;
                break;
        }

        this._emitChange(changes);
    }

    private _handleParameterChange(ev: Event) {
        const target = ev.target as HTMLInputElement;
        const field = target.name;
        const value = target.value;

        const newData = {
            ...this.button.data,
            [field]: value
        };

        this._emitChange({
            data: newData
        });
    }

    private _getDisplayName(value: string): string {
        const type = this.button.action;
        const entityId = value.includes('.') ? value : `${type}.${value}`;
        return this.hass.states[entityId]?.attributes?.friendly_name || value;
    }

    private _emitChange(changes: Partial<ButtonConfig>) {
        this.dispatchEvent(new CustomEvent('action-change', {
            detail: { changes },
            bubbles: true,
            composed: true,
        }));
    }

    static styles = css`
    .form-group {
      margin-bottom: 24px;
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

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 16px;
    }

    .field-group label {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .select-item {
      width: 100%;
      padding: 8px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--card-background-color);
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
    }

    .field-description {
      font-size: 12px;
      color: var(--secondary-text-color);
      margin-top: 4px;
      font-style: italic;
    }

    .parameters-group {
      margin-top: 16px;
      padding: 16px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--secondary-background-color);
    }
  `;
}