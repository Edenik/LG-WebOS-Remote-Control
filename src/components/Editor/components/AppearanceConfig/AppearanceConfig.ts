import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Components } from '../../../../constants/constants';
import { LGRemoteControlConfig } from '../../../../types/config';
import { HomeAssistantFixed } from '../../../../types/home-assistant';

import "./ColorsConfig";
import "./DimensionsConfig";

@customElement(Components.EditorAppearanceConfig)
export class EditorAppearanceConfig extends LitElement {
    @property({ type: Object }) public hass!: HomeAssistantFixed;
    @property({ type: Object }) public config!: LGRemoteControlConfig;

    protected render() {
        return html`
      <ha-expansion-panel header="Appearance Configuration">
        <div class="section-content">
          <editor-colors-config
            .config=${this.config}
            @config-changed=${this._handleConfigChange}
          ></editor-colors-config>

          <editor-dimensions-config
            .config=${this.config}
            @config-changed=${this._handleConfigChange}
          ></editor-dimensions-config>
        </div>
      </ha-expansion-panel>
    `;
    }

    private _handleConfigChange(ev: CustomEvent) {
        ev.stopPropagation();
        const newConfig = {
            ...this.config,
            ...ev.detail.config
        };

        this.dispatchEvent(new CustomEvent('config-changed', {
            detail: { config: newConfig },
            bubbles: true,
            composed: true,
        }));
    }

    static styles = css`
    .section-content {
      padding: 16px;
    }
  `;
}