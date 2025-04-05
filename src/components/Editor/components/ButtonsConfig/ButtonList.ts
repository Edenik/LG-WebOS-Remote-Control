import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { renderButtonMedia } from '../../../../common/media-renderer';
import { capitalizeFirstLetter } from '../../../../common/utils';
import { Components } from '../../../../constants/constants';
import { ButtonAction, ButtonConfig, ButtonType } from '../../../../types/buttons';
import { LGRemoteControlConfig } from '../../../../types/config';
import { HomeAssistantFixed } from '../../../../types/home-assistant';

@customElement(Components.EditorButtonList)
export class ButtonList extends LitElement {
    @property({ type: Object }) public hass!: HomeAssistantFixed;
    @property({ type: Object }) public config!: LGRemoteControlConfig;
    @property({ type: String }) public activeTab!: ButtonType;

    private get items(): ButtonConfig[] {
        return this.activeTab === ButtonType.buttons ?
            this.config.buttons || [] :
            this.config.shortcuts || [];
    }

    protected render() {
        return html`
      <div class="section-header">
        <h3>${this.activeTab === ButtonType.buttons ? 'Buttons' : 'Shortcuts'}</h3>
        <div class="section-actions">
          <button title="Add ${this.activeTab}" @click=${this._handleAdd}>
            <ha-icon icon="mdi:plus"></ha-icon>
          </button>
        </div>
      </div>

      <div class="list-container">
        ${this.items.map((item, index) => this._renderItem(item, index))}
      </div>
    `;
    }

    private _renderItem(item: ButtonConfig, index: number) {
        const actionDisplay = item.action === ButtonAction.source ?
            item.source :
            item[`${item.action}_id`];

        return html`
      <div class="list-item-wrapper">
        <div class="list-item" @click=${() => this._handleEdit(item, index)}>
          <div class="item-preview">
            ${renderButtonMedia(item)}
          </div>
          <div class="item-info">
            <span>${item.name || 'Unnamed Item'}</span>
            <span class="item-data">
              <span class="data-item">${capitalizeFirstLetter(item.action)}: ${actionDisplay}</span>
              ${item.data ? html`
                ${Object.entries(item.data).map(([key, value]) => html`
                  <span class="data-item">${key}: ${value}</span>
                `)}
              ` : ''}
            </span>
          </div>
        </div>
        <div class="item-actions">
          ${this._renderReorderButtons(index)}
          <ha-icon 
            icon="mdi:pencil"
            @click=${() => this._handleEdit(item, index)}
          ></ha-icon>
          <ha-icon 
            icon="mdi:delete"
            class="delete"
            @click=${() => this._handleDelete(index)}
          ></ha-icon>
        </div>
      </div>
    `;
    }

    private _renderReorderButtons(index: number) {
        return html`
      <ha-icon 
        icon="mdi:arrow-up"
        class="reorder ${index === 0 ? 'disabled' : ''}"
        @click=${(e: Event) => {
                e.stopPropagation();
                if (index > 0) this._handleReorder(index, "up");
            }}>
      </ha-icon>
      <ha-icon 
        icon="mdi:arrow-down"
        class="reorder ${index === this.items.length - 1 ? 'disabled' : ''}"
        @click=${(e: Event) => {
                e.stopPropagation();
                if (index < this.items.length - 1) this._handleReorder(index, "down");
            }}>
      </ha-icon>
    `;
    }

    private _handleAdd() {
        const newButton: ButtonConfig = {
            name: "",
            tooltip: `New ${capitalizeFirstLetter(this.activeTab.slice(0, -1))}`,
            action: ButtonAction.source,
            text: '',
            data: {}
        };

        this.dispatchEvent(new CustomEvent('add', {
            detail: {
                item: {
                    button: newButton,
                    index: this.items.length,
                    type: this.activeTab
                }
            },
            bubbles: true,
            composed: true,
        }));
    }

    private _handleEdit(item: ButtonConfig, index: number) {
        this.dispatchEvent(new CustomEvent('edit', {
            detail: {
                item: {
                    button: item,
                    index,
                    type: this.activeTab
                }
            },
            bubbles: true,
            composed: true,
        }));
    }

    private _handleDelete(index: number) {
        if (!confirm('Are you sure you want to delete this item?')) {
            return;
        }

        const newConfig = structuredClone(this.config);
        const items = this.activeTab === ButtonType.buttons ?
            newConfig.buttons || [] :
            newConfig.shortcuts || [];

        items.splice(index, 1);

        if (this.activeTab === ButtonType.buttons) {
            newConfig.buttons = items;
        } else {
            newConfig.shortcuts = items;
        }

        this._emitConfigChange(newConfig);
    }

    private _handleReorder(index: number, direction: "up" | "down") {
        const newConfig = structuredClone(this.config);
        const items = this.activeTab === ButtonType.buttons ?
            newConfig.buttons || [] :
            newConfig.shortcuts || [];

        const newIndex = direction === "up" ? index - 1 : index + 1;
        [items[index], items[newIndex]] = [items[newIndex], items[index]];

        if (this.activeTab === ButtonType.buttons) {
            newConfig.buttons = items;
        } else {
            newConfig.shortcuts = items;
        }

        this._emitConfigChange(newConfig);
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

    .section-actions button:hover {
      background-color: var(--secondary-background-color);
    }

    .list-container {
      max-height: 400px;
      overflow-y: auto;
      width: 100%;
      box-sizing: border-box;
      padding-right: 4px;
    }

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

    .item-preview {
      width: 24px;
      height: 24px;
      margin-right: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
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

    .item-actions ha-icon {
      padding: 6px;
      border-radius: 4px;
      cursor: pointer;
      color: var(--primary-text-color);
      background: var(--card-background-color);
      transition: background-color 0.2s;
    }

    .item-actions ha-icon.delete {
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
  `;
}