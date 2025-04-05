import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { pluralToSingular } from '../../../../common/utils';
import { ButtonConfig, IconType, SelectedButton } from '../../../../types/buttons';
import { LGRemoteControlConfig } from '../../../../types/config';
import { HomeAssistantFixed } from '../../../../types/home-assistant';
import { formatValidationErrors, validateButtonConfig, ValidationError } from '../../../../utils/validation';

import "./ButtonActions";
import "./ButtonForm";

@customElement('editor-button-editor')
export class ButtonEditor extends LitElement {
    @property({ type: Object }) public hass!: HomeAssistantFixed;
    @property({ type: Object }) public config!: LGRemoteControlConfig;
    @property({ type: Object }) public selectedItem!: SelectedButton;
    @property({ type: Boolean }) public isAddingNew: boolean = false;

    @state() private _selectedIconType: IconType = IconType.mdi;
    @state() private _isFormDirty: boolean = false;
    @state() private _originalItem: ButtonConfig | null = null;

    protected firstUpdated() {
        // Store original state for comparison
        this._originalItem = structuredClone(this.selectedItem.button);

        // Set initial icon type
        if (this.selectedItem.button.svg) this._selectedIconType = IconType.svg;
        else if (this.selectedItem.button.icon) this._selectedIconType = IconType.mdi;
        else if (this.selectedItem.button.img) this._selectedIconType = IconType.img;
        else this._selectedIconType = IconType.none;
    }

    protected render() {
        const { type } = this.selectedItem;
        const button = this.selectedItem.button;
        const headerText = this.isAddingNew ?
            `Add ${pluralToSingular(type)}` :
            `Edit ${pluralToSingular(type)}`;

        const errors: ValidationError[] = validateButtonConfig(button, { hass: this.hass });

        return html`
      <div class="section-header">
        <h3>${headerText}</h3>
        <div class="section-actions">
          ${this._renderErrorsIndicator(errors)}
          ${this._renderDeleteButton()}
          ${this._renderBackButton()}
        </div>
      </div>
      
      <div class="editor-content">
        <editor-button-form
          .hass=${this.hass}
          .selectedButton=${this.selectedItem}
          .config=${this.config}
          .iconType=${this._selectedIconType}
          @icon-type-change=${this._handleIconTypeChange}
          @button-change=${this._handleButtonChange}
        ></editor-button-form>

        <editor-button-actions
          .hass=${this.hass}
          .config=${this.config}
          .button=${button}
          @action-change=${this._handleActionChange}
        ></editor-button-actions>
      </div>
    `;
    }

    private _renderErrorsIndicator(errors: ValidationError[]) {
        return html`
      <button 
        ?disabled=${errors.length > 0}
        class="errors-indicator ${errors.length ? 'has-error' : 'no-error'}" 
        title="${formatValidationErrors(errors)}"
      >
        ${errors.length ? errors.length : html`<ha-icon icon="mdi:check-bold"></ha-icon>`}
      </button>
    `;
    }

    private _renderDeleteButton() {
        if (this.isAddingNew) return '';

        return html`
      <button title="Delete" @click=${this._handleDelete}>
        <ha-icon icon="mdi:delete"></ha-icon>
      </button>
    `;
    }

    private _renderBackButton() {
        return html`
      <button title="Back" @click=${this._handleBack}>
        <ha-icon icon="mdi:arrow-right"></ha-icon>
      </button>
    `;
    }

    private _handleIconTypeChange(ev: CustomEvent) {
        this._selectedIconType = ev.detail.type;
        this._updateButton(ev.detail.changes);
    }

    private _handleButtonChange(ev: CustomEvent) {
        this._updateButton(ev.detail.changes);
    }

    private _handleActionChange(ev: CustomEvent) {
        this._updateButton(ev.detail.changes);
    }

    private _updateButton(changes: Partial<ButtonConfig>) {
        const newConfig = structuredClone(this.config);
        const { type, index } = this.selectedItem;

        if (newConfig[type] && index !== -1) {
            newConfig[type][index] = {
                ...newConfig[type][index],
                ...changes
            };

            // Compare with original state to determine if there are actual changes
            if (this._originalItem) {
                this._isFormDirty = JSON.stringify(newConfig[type][index]) !== JSON.stringify(this._originalItem);
            }

            this._emitConfigChange(newConfig);
        }
    }

    private _handleDelete() {
        if (!confirm('Are you sure you want to delete this item?')) return;

        const newConfig = structuredClone(this.config);
        const { type, index } = this.selectedItem;

        if (newConfig[type] && index !== -1) {
            newConfig[type].splice(index, 1);
            this._emitConfigChange(newConfig);
        }

        this._handleBack();
    }

    private _handleBack() {
        const { type, index } = this.selectedItem;
        const currentItem: ButtonConfig = this.config[type][index];
        const errors: ValidationError[] = validateButtonConfig(currentItem, { hass: this.hass });

        if (errors.length > 0) {
            const message = this.isAddingNew ?
                `Validation errors found:\n\n${formatValidationErrors(errors)}\n\nThis item will be deleted if you continue.` :
                `Validation errors found:\n\n${formatValidationErrors(errors)}\n\nYour changes will be discarded if you continue.`;

            if (!confirm(message)) return;
        }

        this.dispatchEvent(new CustomEvent('back'));
    }

    private _emitConfigChange(config: LGRemoteControlConfig) {
        this.dispatchEvent(new CustomEvent('config-changed', {
            detail: { config },
            bubbles: true,
            composed: true,
        }));
    }

    static styles = css`
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
      border: 1px solid var(--divider-color);
      display: flex;
      align-items: center;
      gap: 4px;
      transition: background-color 0.2s;
    }

    .section-actions button:hover:not([disabled]) {
      background-color: var(--secondary-background-color);
    }

    button.errors-indicator.has-error {
      background-color: var(--error-color);
      color: white;
    }

    button.errors-indicator.no-error {
      background-color: var(--success-color);
      color: white;
    }

    .editor-content {
      padding: 16px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      margin-top: 16px;
    }
  `;
}