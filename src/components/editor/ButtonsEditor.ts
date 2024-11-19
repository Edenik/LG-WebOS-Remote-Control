import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { getMdiIconsList } from '../../common/icons';
import { renderButtonMedia } from '../../common/media-renderer';
import { ButtonAction, ButtonConfig, ButtonType, IconType } from '../../types/buttons';
import { LGRemoteControlConfig } from '../../types/config';
import { HomeAssistantFixed } from '../../types/home-assistant';
import { ValidationContext } from '../../types/validation';
import { validateButtonConfig } from '../../utils/validation';

@customElement('buttons-editor')
export class ButtonsEditor extends LitElement {
    @property({ type: Object }) hass!: HomeAssistantFixed;
    @property({ type: Object }) config!: LGRemoteControlConfig;
    @property({ type: String }) activeTab: ButtonType = ButtonType.buttons;
    @property({ type: Object }) editingItem: { type: ButtonType; index: number; isNew: boolean } | null = null;
    @property({ type: String }) selectedIconType: IconType = IconType.mdi;
    @property({ type: Object }) validationContext!: ValidationContext;

    private _handleTabChange(tab: ButtonType) {
        this.dispatchEvent(new CustomEvent('tab-change', {
            detail: { tab },
            bubbles: true,
            composed: true,
        }));
    }

    private _handleAdd(type: ButtonType) {
        this.dispatchEvent(new CustomEvent('add-item', {
            detail: { type },
            bubbles: true,
            composed: true,
        }));
    }

    private _handleEdit(type: ButtonType, index: number) {
        this.dispatchEvent(new CustomEvent('edit-item', {
            detail: { type, index },
            bubbles: true,
            composed: true,
        }));
    }

    private _handleDelete(type: ButtonType, index: number) {
        if (confirm('Are you sure you want to delete this item?')) {
            this.dispatchEvent(new CustomEvent('delete-item', {
                detail: { type, index },
                bubbles: true,
                composed: true,
            }));
        }
    }

    protected render() {
        return html`
      <div class="buttons-editor">
        <div class="tabs">
          <button
            class="tab ${this.activeTab === ButtonType.buttons ? 'active' : ''}"
            @click=${() => this._handleTabChange(ButtonType.buttons)}
          >
            <ha-icon icon="mdi:remote"></ha-icon>
            Buttons
          </button>
          <button
            class="tab ${this.activeTab === ButtonType.shortcuts ? 'active' : ''}"
            @click=${() => this._handleTabChange(ButtonType.shortcuts)}
          >
            <ha-icon icon="mdi:gesture-tap-button"></ha-icon>
            Shortcuts
          </button>
        </div>

        ${this.editingItem ?
                this._renderEditor() :
                this._renderList()
            }
      </div>
    `;
    }

    private _renderList() {
        const items = this.config[this.activeTab] || [];

        return html`
      <div class="list-container">
        <div class="list-header">
          <h3>${this.activeTab === ButtonType.buttons ? 'Buttons' : 'Shortcuts'}</h3>
          <button @click=${() => this._handleAdd(this.activeTab)}>
            <ha-icon icon="mdi:plus"></ha-icon>
            Add
          </button>
        </div>

        <div class="items-list">
          ${items.map((item, index) => this._renderListItem(item, index))}
        </div>
      </div>
    `;
    }

    private _renderListItem(item: ButtonConfig, index: number) {
        return html`
      <div class="list-item">
        <div class="item-preview">
          ${renderButtonMedia(item)}
          <span class="item-name">${item.name || 'Unnamed'}</span>
        </div>
        
        <div class="item-actions">
          <button @click=${() => this._handleEdit(this.activeTab, index)}>
            <ha-icon icon="mdi:pencil"></ha-icon>
          </button>
          <button @click=${() => this._handleDelete(this.activeTab, index)}>
            <ha-icon icon="mdi:delete"></ha-icon>
          </button>
        </div>
      </div>
    `;
    }

    private _renderEditor() {
        if (!this.editingItem) return '';

        const { type, index, isNew } = this.editingItem;
        const item = isNew ? this._getDefaultItem() : { ...this.config[type][index] };
        const errors = validateButtonConfig(item, this.validationContext);

        return html`
      <div class="editor-container">
        <div class="editor-header">
          <h3>${isNew ? 'Add' : 'Edit'} ${type === ButtonType.buttons ? 'Button' : 'Shortcut'}</h3>
          <div class="editor-actions">
            <button 
              class="validate-button ${errors.length ? 'has-errors' : ''}"
              title="${errors.length ? errors.map(e => e.message).join('\n') : 'Valid configuration'}"
            >
              ${errors.length ? errors.length : html`<ha-icon icon="mdi:check"></ha-icon>`}
            </button>
            ${this._renderEditorActions()}
          </div>
        </div>

        ${this._renderEditorForm(item)}
      </div>
    `;
    }

    private _renderEditorActions() {
        return html`
      <button @click=${this._handleCancel}>
        <ha-icon icon="mdi:close"></ha-icon>
      </button>
      <button @click=${this._handleSave} ?disabled=${this._hasValidationErrors()}>
        <ha-icon icon="mdi:content-save"></ha-icon>
      </button>
    `;
    }

    private _renderEditorForm(item: ButtonConfig) {
        return html`
      <div class="editor-form">
        <div class="form-row">
          <ha-textfield
            label="Name"
            .value=${item.name || ''}
            @change=${(e: Event) => this._updateItemField('name', (e.target as HTMLInputElement).value)}
          ></ha-textfield>
        </div>

        <div class="form-row">
          <label>Action Type</label>
          <div class="radio-group">
            ${Object.values(ButtonAction).map(action => html`
              <label>
                <input
                  type="radio"
                  name="action"
                  value=${action}
                  ?checked=${item.action === action}
                  @change=${(e: Event) => this._updateItemField('action', (e.target as HTMLInputElement).value)}
                >
                ${this._capitalizeFirst(action)}
              </label>
            `)}
          </div>
        </div>

        ${this._renderActionSpecificFields(item)}
        ${this._renderIconSelection(item)}
        ${this._renderStyleFields(item)}
      </div>
    `;
    }

    private _renderActionSpecificFields(item: ButtonConfig) {
        switch (item.action) {
            case ButtonAction.source:
                return this._renderSourceFields(item);
            case ButtonAction.script:
                return this._renderScriptFields(item);
            case ButtonAction.scene:
                return this._renderSceneFields(item);
            case ButtonAction.automation:
                return this._renderAutomationFields(item);
            default:
                return '';
        }
    }

    private _renderSourceFields(item: ButtonConfig) {
        const sources = this.hass.states[this.config.entity]?.attributes?.source_list || [];

        return html`
      <div class="form-row">
        <ha-select
          label="Source"
          .value=${item.source || ''}
          @selected=${(e: Event) => this._updateItemField('source', (e.target as HTMLSelectElement).value)}
        >
          ${sources.map(source => html`
            <mwc-list-item .value=${source}>${source}</mwc-list-item>
          `)}
        </ha-select>
      </div>
    `;
    }

    private _renderScriptFields(item: ButtonConfig) {
        const scripts = Object.keys(this.hass.services.script || {});

        return html`
      <div class="form-row">
        <ha-select
          label="Script"
          .value=${item.script_id || ''}
          @selected=${(e: Event) => this._updateItemField('script_id', (e.target as HTMLSelectElement).value)}
        >
          ${scripts.map(script => html`
            <mwc-list-item .value=${script}>${script}</mwc-list-item>
          `)}
        </ha-select>
      </div>
      ${this._renderDataFields(item)}
    `;
    }

    private _renderSceneFields(item: ButtonConfig) {
        const scenes = Object.entries(this.hass.states)
            .filter(([entityId]) => entityId.startsWith('scene.'))
            .map(([entityId, state]) => ({
                id: entityId.replace('scene.', ''),
                name: state.attributes.friendly_name || entityId
            }));

        return html`
      <div class="form-row">
        <ha-select
          label="Scene"
          .value=${item.scene_id || ''}
          @selected=${(e: Event) => this._updateItemField('scene_id', (e.target as HTMLSelectElement).value)}
        >
          ${scenes.map(scene => html`
            <mwc-list-item .value=${scene.id}>${scene.name}</mwc-list-item>
          `)}
        </ha-select>
      </div>
    `;
    }

    private _renderAutomationFields(item: ButtonConfig) {
        const automations = Object.entries(this.hass.states)
            .filter(([entityId]) => entityId.startsWith('automation.'))
            .map(([entityId, state]) => ({
                id: entityId.replace('automation.', ''),
                name: state.attributes.friendly_name || entityId
            }));

        return html`
      <div class="form-row">
        <ha-select
          label="Automation"
          .value=${item.automation_id || ''}
          @selected=${(e: Event) => this._updateItemField('automation_id', (e.target as HTMLSelectElement).value)}
        >
          ${automations.map(automation => html`
            <mwc-list-item .value=${automation.id}>${automation.name}</mwc-list-item>
          `)}
        </ha-select>
      </div>
    `;
    }

    private _renderDataFields(item: ButtonConfig) {
        if (!item.data) return '';

        return html`
      <div class="form-row">
        <h4>Parameters</h4>
        ${Object.entries(item.data).map(([key, value]) => html`
          <ha-textfield
            label=${key}
            .value=${value}
            @change=${(e: Event) => this._updateDataField(key, (e.target as HTMLInputElement).value)}
          ></ha-textfield>
        `)}
        <button @click=${this._addDataField}>
          <ha-icon icon="mdi:plus"></ha-icon>
          Add Parameter
        </button>
      </div>
    `;
    }

    private _renderIconSelection(item: ButtonConfig) {
        return html`
      <div class="form-row">
        <label>Icon Type</label>
        <div class="radio-group">
          ${Object.values(IconType).map(type => html`
            <label>
              <input
                type="radio"
                name="iconType"
                value=${type}
                ?checked=${this.selectedIconType === type}
                @change=${(e: Event) => this._updateIconType(e)}
              >
              ${this._capitalizeFirst(type)}
            </label>
          `)}
        </div>
        
        ${this._renderIconTypeSpecificFields(item)}
      </div>
    `;
    }

    private _renderIconTypeSpecificFields(item: ButtonConfig) {
        switch (this.selectedIconType) {
            case IconType.mdi:
                return html`
          <div class="icon-grid">
            ${getMdiIconsList().map(icon => html`
              <div 
                class="icon-choice ${item.icon === icon.id ? 'selected' : ''}"
                @click=${() => this._updateItemField('icon', icon.id)}
              >
                <ha-icon icon="${icon.id}"></ha-icon>
                <span class="icon-label">${icon.name}</span>
              </div>
            `)}
          </div>
        `;
            case IconType.svg:
                return html`
          <div class="form-row">
            <ha-textfield
              label="SVG URL"
              .value=${item.svg || ''}
              @change=${(e: Event) => this._updateItemField('svg', (e.target as HTMLInputElement).value)}
            ></ha-textfield>
            ${item.svg ? html`<div class="icon-preview">${renderButtonMedia(item)}</div>` : ''}
          </div>
        `;
            case IconType.img:
                return html`
          <div class="form-row">
            <ha-textfield
              label="Image URL"
              .value=${item.img || ''}
              @change=${(e: Event) => this._updateItemField('img', (e.target as HTMLInputElement).value)}
            ></ha-textfield>
            ${item.img ? html`<div class="icon-preview">${renderButtonMedia(item)}</div>` : ''}
          </div>
        `;
            default:
                return '';
        }
    }

    private _renderStyleFields(item: ButtonConfig) {
        return html`
      <div class="form-row">
        <label>Appearance</label>
        <div class="style-fields">
          <ha-textfield
            label="Text"
            .value=${item.text || ''}
            @change=${(e: Event) => this._updateItemField('text', (e.target as HTMLInputElement).value)}
          ></ha-textfield>

          <div class="color-field">
            <label>Text Color:</label>
            <div class="color-input-container">
              <input 
                type="color"
                .value=${item.text_color || '#000000'}
                @change=${(e: Event) => this._updateItemField('text_color', (e.target as HTMLInputElement).value)}
              />
              <ha-icon-button
                @click=${() => this._updateItemField('text_color', undefined)}
                .path=${'M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z'}
              ></ha-icon-button>
            </div>
          </div>

          <div class="color-field">
            <label>Icon Color:</label>
            <div class="color-input-container">
              <input 
                type="color"
                .value=${item.color || '#000000'}
                @change=${(e: Event) => this._updateItemField('color', (e.target as HTMLInputElement).value)}
              />
              <ha-icon-button
                @click=${() => this._updateItemField('color', undefined)}
                .path=${'M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z'}
              ></ha-icon-button>
            </div>
          </div>

          <ha-textfield
            label="Tooltip"
            .value=${item.tooltip || ''}
            @change=${(e: Event) => this._updateItemField('tooltip', (e.target as HTMLInputElement).value)}
          ></ha-textfield>
        </div>
      </div>
    `;
    }

    private _updateItemField(field: string, value: any) {
        if (!this.editingItem) return;

        const { type, index } = this.editingItem;
        const item = this._getCurrentItem();

        if (value === undefined || value === '') {
            delete item[field];
        } else {
            item[field] = value;
        }

        this._updateCurrentItem(item);
    }

    private _updateDataField(key: string, value: string) {
        if (!this.editingItem) return;

        const item = this._getCurrentItem();
        if (!item.data) item.data = {};

        if (value === '') {
            delete item.data[key];
        } else {
            item.data[key] = value;
        }

        this._updateCurrentItem(item);
    }

    private _addDataField() {
        const key = prompt('Enter parameter name:');
        if (!key) return;

        const item = this._getCurrentItem();
        if (!item.data) item.data = {};
        item.data[key] = '';

        this._updateCurrentItem(item);
    }

    private _updateIconType(e: Event) {
        const value = (e.target as HTMLInputElement).value as IconType;
        this.dispatchEvent(new CustomEvent('icon-type-change', {
            detail: { type: value },
            bubbles: true,
            composed: true,
        }));
    }

    private _getCurrentItem(): ButtonConfig {
        if (!this.editingItem) return this._getDefaultItem();

        const { type, index, isNew } = this.editingItem;
        return isNew ? this._getDefaultItem() : { ...this.config[type][index] };
    }

    private _updateCurrentItem(item: ButtonConfig) {
        this.dispatchEvent(new CustomEvent('item-update', {
            detail: { item },
            bubbles: true,
            composed: true,
        }));
    }

    private _getDefaultItem(): ButtonConfig {
        return {
            name: '',
            action: ButtonAction.source,
            text: ''
        };
    }

    private _handleCancel() {
        this.dispatchEvent(new CustomEvent('cancel-edit'));
    }

    private _handleSave() {
        if (this._hasValidationErrors()) return;

        const item = this._getCurrentItem();
        this.dispatchEvent(new CustomEvent('save-item', {
            detail: {
                item,
                type: this.editingItem?.type,
                index: this.editingItem?.index
            },
            bubbles: true,
            composed: true,
        }));
    }

    private _hasValidationErrors(): boolean {
        const item = this._getCurrentItem();
        const errors = validateButtonConfig(item, this.validationContext);
        return errors.length > 0;
    }

    private _capitalizeFirst(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    static styles = css`
    .buttons-editor {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .tabs {
      display: flex;
      gap: 8px;
      border-bottom: 1px solid var(--divider-color);
    }

    .tab {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border: none;
      background: none;
      border-bottom: 2px solid transparent;
      cursor: pointer;
    }

    .tab.active {
      border-bottom-color: var(--primary-color);
      color: var(--primary-color);
    }

    .list-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .list-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
    }

    .item-preview {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .item-actions {
      display: flex;
      gap: 8px;
    }

    .editor-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .editor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .editor-actions {
      display: flex;
      gap: 8px;
    }

    .validate-button {
      min-width: 32px;
      height: 32px;
      border-radius: 16px;
    }

    .validate-button.has-errors {
      background-color: var(--error-color);
      color: white;
    }

    .editor-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-row {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .radio-group {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
  `;
}