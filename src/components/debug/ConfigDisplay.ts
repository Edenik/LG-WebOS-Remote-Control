import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { debugStyles } from '../../styles/component-styles';
import { LGRemoteControlConfig } from '../../types/config';

@customElement('config-display')
export class ConfigDisplay extends LitElement {
    @property({ type: Object }) config!: LGRemoteControlConfig;

    render() {
        return html`
      <ha-expansion-panel header="Remote Control Configuration">
        <div class="debug-info">
          ${this.renderConfigSections()}
        </div>
      </ha-expansion-panel>
    `;
    }

    private renderConfigSections() {
        const sections = {
            'Basic Configuration': {
                type: this.config.type,
                entity: this.config.entity,
                mac: this.config.mac,
                name: this.config.name,
                av_receiver_family: this.config.av_receiver_family,
                debug: this.config.debug,
                ampli_entity: this.config.ampli_entity
            },
            'Shortcuts': this.config.shortcuts,
            'Buttons': this.config.buttons,
            'Replace Buttons': this.config.replace_buttons,
            'Debug Entities': this.config.debug_entities,
            'Dimensions': this.config.dimensions,
            'Colors': this.config.colors
        };

        return Object.entries(sections).map(([title, data]) =>
            this.renderConfigSection(title, data)
        );
    }

    private renderConfigSection(title: string, data: any) {
        if (!data || (Array.isArray(data) && data.length === 0)) return '';

        return html`
      <div class="debug-section">
        <div class="debug-header">
          <span class="debug-title">${title}</span>
        </div>
        <div class="debug-content">
          ${this.renderConfigContent(data)}
        </div>
      </div>
    `;
    }

    private renderConfigContent(data: any) {
        if (Array.isArray(data)) {
            return data.map(item => html`
        <div class="debug-row">
          <div class="debug-label">${item.name || item.text || item.button_name || 'Item'}</div>
          <div class="debug-value">
            <pre class="debug-pre">${JSON.stringify(item, null, 2)}</pre>
          </div>
        </div>
      `);
        }

        return Object.entries(data).map(([key, value]) => html`
      <div class="debug-row">
        <div class="debug-label">${key}</div>
        <div class="debug-value">
          ${typeof value === 'object'
                ? html`<pre class="debug-pre">${JSON.stringify(value, null, 2)}</pre>`
                : value}
        </div>
      </div>
    `);
    }

    static styles = debugStyles;
}