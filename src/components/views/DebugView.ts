import { HassEntity } from 'home-assistant-js-websocket';
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { renderShape } from '../../common/media-renderer';
import { decodeSupportedFeatures } from '../../common/utils';
import { debugViewStyles } from '../../styles/view-styles';
import { LGRemoteControlConfig } from '../../types/config';

@customElement('debug-view')
export class DebugView extends LitElement {
  @property({ type: Object }) config!: LGRemoteControlConfig;
  @property({ type: Object }) stateObj!: HassEntity;
  @property({ type: Array }) entities: HassEntity[] = [];

  private handleBack() {
    this.dispatchEvent(new CustomEvent('view-close'));
  }

  render() {
    return html`
      <div class="grid-container-input">
        ${renderShape("input")}
        <button class="ripple bnt-input-back" @click=${this.handleBack}>
          <ha-icon icon="mdi:undo-variant"/>
        </button>
        <p class="source_text"><b>DEBUG</b></p>
        <div class="grid-item-input debug-screen">
          ${this.renderConfig(this.config)}
          ${this.entities.map(entity => this.renderDebugInfo(entity))}
        </div>
      </div>
    `;
  }

  protected renderDebugInfo(entity: HassEntity) {
    return html`
      <ha-expansion-panel header="${entity.attributes.friendly_name ?? entity.entity_id}">
        <div class="debug-info">
          <div class="debug-section">
            <div class="debug-content">
              ${this.renderEntityBasics(entity)}
            </div>
          </div>
          <div class="debug-section">
            <div class="debug-header">
              <span class="debug-title">Attributes</span>
            </div>
            <div class="debug-content">
              ${this.renderAttributes(entity)}
            </div>
          </div>
        </div>
      </ha-expansion-panel>
    `;
  }

  private renderEntityBasics(stateObj: HassEntity) {
    return html`
      <div class="debug-row">
        <div class="debug-label">Entity ID</div>
        <div class="debug-value">${stateObj.entity_id}</div>
      </div>
      <div class="debug-row">
        <div class="debug-label">State</div>
        <div class="debug-value">${stateObj.state}</div>
      </div>
      <div class="debug-row">
        <div class="debug-label">Last Changed</div>
        <div class="debug-value">${stateObj.last_changed}</div>
      </div>
      <div class="debug-row">
        <div class="debug-label">Last Updated</div>
        <div class="debug-value">${stateObj.last_updated}</div>
      </div>
    `;
  }

  private renderAttributes(stateObj: HassEntity) {
    return Object.entries(stateObj.attributes).map(([key, value]) => {
      if (key === "supported_features" && stateObj.entity_id.startsWith("media_player.")) {
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
    });
  }

  private renderAttributeValue(value: any) {
    if (Array.isArray(value)) {
      return html`
        <div class="debug-list">
          ${value.map(item => html`<div class="debug-list-item">${item}</div>`)}
        </div>`;
    }
    if (typeof value === 'object' && value !== null) {
      return html`<pre class="debug-pre">${JSON.stringify(value, null, 2)}</pre>`;
    }
    return value;
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

  private renderConfig(config: LGRemoteControlConfig) {
    const sections = {
      'Basic Configuration': {
        type: config.type,
        entity: config.entity,
        mac: config.mac,
        name: config.name,
        av_receiver_family: config.av_receiver_family,
        debug: config.debug,
        ampli_entity: config.ampli_entity
      },
      'Shortcuts': config.shortcuts,
      'Buttons': config.buttons,
      'Replace Buttons': config.replace_buttons,
      'Debug Entities': config.debug_entities,
      'Dimensions': config.dimensions,
      'Colors': config.colors
    };

    return html`
      <ha-expansion-panel header="Remote Control Configuration">
        <div class="debug-info">
          ${Object.entries(sections).map(([title, data]) =>
      this.renderConfigSection(title, data)
    )}
        </div>
      </ha-expansion-panel>
    `;
  }

  static styles = debugViewStyles;
}