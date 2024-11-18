import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { spotifyStyles } from '../../styles/component-styles';
import { SpotifyState } from '../../types/spotify';
import { isRTL } from '../../utils/text-helpers';

@customElement('spotify-display')
export class SpotifyDisplay extends LitElement {
  @property({ type: Object }) state!: SpotifyState;
  @property({ type: String }) title = '';

  render() {
    if (!this.title) return '';

    const _isRTL = isRTL(this.title);
    const isPaused = this.state?.state === "paused";

    return html`
      <div class="spotify-container">
        <div class="spotify-scroll ${_isRTL ? 'rtl' : 'ltr'}">
          <div class="spotify-text ${isPaused ? "paused" : ""} ${_isRTL ? 'rtl' : 'ltr'}">
            <ha-icon 
              class="spotify-icon" 
              icon="mdi:spotify" 
              style="color: #1DB954; margin: ${_isRTL ? '0 0 0 8px' : '0 8px 0 0'}"
            ></ha-icon>
            ${this.title}
            ${this.state?.attributes?.entity_picture ? html`
              <img 
                src="${this.state.attributes.entity_picture}" 
                class="album-art"
                style="margin: ${_isRTL ? '0 8px 0 0' : '0 0 0 8px'}"
              />
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  static styles = spotifyStyles;
}