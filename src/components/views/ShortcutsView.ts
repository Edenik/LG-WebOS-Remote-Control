import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { renderButtonMedia, renderShape } from '../../common/mediaRenderer';
import { shortcutsViewStyles } from '../../styles/view-styles';
import { ButtonConfig } from '../../types/buttons';
import { isRTL } from '../../utils/text-helpers';

@customElement('shortcuts-view')
export class ShortcutsView extends LitElement {
  @property({ type: Array }) shortcuts: ButtonConfig[] = [];

  private handleBack() {
    this.dispatchEvent(new CustomEvent('view-close'));
  }

  private handleShortcutClick(shortcut: ButtonConfig) {
    this.dispatchEvent(new CustomEvent('shortcut-click', {
      detail: { shortcut },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <div class="grid-container-input">
        ${renderShape("input")}
        <button class="ripple bnt-input-back" @click=${this.handleBack}>
          <ha-icon icon="mdi:undo-variant"/>
        </button>
        <p class="source_text"><b>Shortcuts</b></p>
        <div class="grid-item-input">
          <div>
            ${this.renderShortcutList()}
          </div>
        </div>
      </div>
    `;
  }

  private renderShortcutList() {
    return this.shortcuts.map(shortcut => {
      const willRenderText = Boolean(shortcut.text);
      const isRtl = willRenderText && isRTL(shortcut.text);

      return html`
        <button 
          class="btn-input ${isRtl ? 'rtl' : ''} ripple overlay"
          title="${shortcut.tooltip ?? ''}" 
          style="width: 95%; ${willRenderText ? `color: ${shortcut.text_color ?? ''};` : ''}"
          @click=${() => {
          this.handleShortcutClick(shortcut);
          this.handleBack();
        }}
        > 
          <span>
            ${renderButtonMedia(shortcut)}
            ${shortcut.text ?? ""}
          </span>
        </button>
      `;
    });
  }

  static styles = shortcutsViewStyles;
}