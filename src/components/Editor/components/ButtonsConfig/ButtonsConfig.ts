import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Components } from '../../../../constants/constants';
import { ButtonType, SelectedButton } from '../../../../types/buttons';
import { LGRemoteControlConfig } from '../../../../types/config';
import { HomeAssistantFixed } from '../../../../types/home-assistant';

import "./ButtonEditor";
import "./ButtonList";

@customElement(Components.EditorButtonsConfig)
export class ButtonsConfig extends LitElement {
    @property({ type: Object }) public hass!: HomeAssistantFixed;
    @property({ type: Object }) public config!: LGRemoteControlConfig;

    @state() private _activeTab: ButtonType = ButtonType.buttons;
    @state() private _selectedItem: SelectedButton | null = null;
    @state() private _isAddingNew: boolean = false;
    @state() private _isEditing: boolean = false;

    protected render() {
        return html`
      <ha-expansion-panel header="Buttons & Shortcuts" expanded>
        <div class="section-content">
          <div class="defined-buttons-list">
            <div class="tab-navigation">
              <button 
                class="tab-button ${this._activeTab === ButtonType.buttons ? 'active' : ''}"
                @click=${() => this._switchTab(ButtonType.buttons)}
                ?disabled=${this._isAddingNew || this._isEditing}
              >
                <ha-icon icon="mdi:remote"></ha-icon>
                Buttons
              </button>
              <button 
                class="tab-button ${this._activeTab === ButtonType.shortcuts ? 'active' : ''}"
                @click=${() => this._switchTab(ButtonType.shortcuts)}
                ?disabled=${this._isAddingNew || this._isEditing}
              >
                <ha-icon icon="mdi:gesture-tap-button"></ha-icon>
                Shortcuts
              </button>
            </div>

            ${(this._isAddingNew || this._isEditing) ?
                html`<editor-button-editor
                .hass=${this.hass}
                .config=${this.config}
                .selectedItem=${this._selectedItem}
                .isAddingNew=${this._isAddingNew}
                @back=${this._handleBack}
                @config-changed=${this._handleConfigChange}
              ></editor-button-editor>` :
                html`<editor-button-list
                .hass=${this.hass}
                .config=${this.config}
                .activeTab=${this._activeTab}
                @add=${this._handleAdd}
                @edit=${this._handleEdit}
                @config-changed=${this._handleConfigChange}
              ></editor-button-list>`
            }
          </div>
        </div>
      </ha-expansion-panel>
    `;
    }

    private _switchTab(tab: ButtonType) {
        this._activeTab = tab;
    }

    private _handleAdd(ev: CustomEvent) {
        this._isAddingNew = true;
        this._selectedItem = ev.detail.item;
    }

    private _handleEdit(ev: CustomEvent) {
        this._isEditing = true;
        this._selectedItem = ev.detail.item;
    }

    private _handleBack() {
        this._isAddingNew = false;
        this._isEditing = false;
        this._selectedItem = null;
    }

    private _handleConfigChange(ev: CustomEvent) {
        ev.stopPropagation();
        this.dispatchEvent(new CustomEvent('config-changed', {
            detail: { config: ev.detail.config },
            bubbles: true,
            composed: true,
        }));
    }

    static styles = css`
    .section-content {
      padding: 16px;
    }

    .defined-buttons-list {
      border: 1px solid var(--divider-color);
      padding: 16px;
      border-radius: 4px;
    }

    .tab-navigation {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      border-bottom: 1px solid var(--divider-color);
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

    .tab-button[disabled] {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;
}