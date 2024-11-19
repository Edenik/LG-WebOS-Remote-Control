import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { LGRemoteControlConfig } from '../../../../types/config';
import { HomeAssistantFixed } from '../../../../types/home-assistant';

import { Components } from '../../../../constants/constants';
import "./AvRecieverConfig";
import "./DebugConfig";

@customElement(Components.EditorAdvancedConfig)
export class AdvancedConfig extends LitElement {
    @property({ type: Object }) public hass!: HomeAssistantFixed;
    @property({ type: Object }) public config!: LGRemoteControlConfig;

    protected render() {
        return html`
      <ha-expansion-panel header="Advanced Configuration">
        <div class="section-content">
          <editor-debug-config
            .config=${this.config}
            @config-changed=${this._handleConfigChange}
          ></editor-debug-config>

          <editor-av-receiver-config
            .hass=${this.hass}
            .config=${this.config}
            @config-changed=${this._handleConfigChange}
          ></editor-av-receiver-config>
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