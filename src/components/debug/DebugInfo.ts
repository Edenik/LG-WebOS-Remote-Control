import { HassEntity } from 'home-assistant-js-websocket';
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { debugStyles } from '../../styles/component-styles';
import { decodeSupportedFeatures } from '../../utils/state-handlers';

@customElement('debug-info')
export class DebugInfo extends LitElement {
    @property({ type: Object }) entity!: HassEntity;

    render() {
        return html`
      <ha-expansion-panel header="${this.entity.attributes.friendly_name ?? this.entity.entity_id}">
        <div class="debug-info">
          ${this.renderBasicInfo()}
          ${this.renderAttributes()}
        </div>
      </ha-expansion-panel>
    `;
    }

    private renderBasicInfo() {
        return html`
      <div class="debug-section">
        <div class="debug-content">
          <div class="debug-row">
            <div class="debug-label">Entity ID</div>
            <div class="debug-value">${this.entity.entity_id}</div>
          </div>
          <div class="debug-row">
            <div class="debug-label">State</div>
            <div class="debug-value">${this.entity.state}</div>
          </div>
          <div class="debug-row">
            <div class="debug-label">Last Changed</div>
            <div class="debug-value">${this.entity.last_changed}</div>
          </div>
          <div class="debug-row">
            <div class="debug-label">Last Updated</div>
            <div class="debug-value">${this.entity.last_updated}</div>
          </div>
        </div>
      </div>
    `;
    }

    private renderAttributes() {
        return html`
      <div class="debug-section">
        <div class="debug-header">
          <span class="debug-title">Attributes</span>
        </div>
        <div class="debug-content">
          ${Object.entries(this.entity.attributes).map(([key, value]) => {
            if (key === "supported_features" && this.entity.entity_id.startsWith("media_player.")) {
                value = [value, "Decoded:", ...decodeSupportedFeatures(value as number)];
            }

            return html`
              <div class="debug-row">
                <div class="debug-label">${key}</div>
                <div class="debug-value">
                  ${this.renderAttributeValue(value)}
                </div>
              </div>
            `;
        })}
        </div>
      </div>
    `;
    }

    private renderAttributeValue(value: any) {
        if (Array.isArray(value)) {
            return html`
        <div class="debug-list">
          ${value.map(item => html`<div class="debug-list-item">${item}</div>`)}
        </div>
      `;
        }
        if (typeof value === 'object' && value !== null) {
            return html`<pre class="debug-pre">${JSON.stringify(value, null, 2)}</pre>`;
        }
        return value;
    }

    static styles = debugStyles;
}