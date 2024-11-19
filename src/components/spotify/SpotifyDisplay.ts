import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Components } from '../../constants/constants';
import { SpotifyState } from '../../types/spotify';
import { isRTL } from '../../utils/text-helpers';
import { getSpotifyTitleFromEntity } from './helpers';

@customElement(Components.SpotifyDisplay)
export class SpotifyDisplay extends LitElement {
  @property({ type: Object }) state!: SpotifyState;

  render() {
    const title: string = getSpotifyTitleFromEntity(this.state);
    if (!title) {
      return html``;
    }

    const _isRTL: boolean = isRTL(this.title);
    const isPaused: boolean = this.state?.state === "paused";

    return html`
      <div class="spotify-container">
        <div class="spotify-scroll ${_isRTL ? 'rtl' : 'ltr'}">
          <div class="spotify-text ${isPaused ? "paused" : ""} ${_isRTL ? 'rtl' : 'ltr'}">
            <ha-icon 
              class="spotify-icon" 
              icon="mdi:spotify" 
              style="color: #1DB954; margin: ${_isRTL ? '0 0 0 8px' : '0 8px 0 0'}"
            ></ha-icon>
            ${title}
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

  static get styles() {
    return css`
      .spotify-container {
        width: calc(var(--remotewidth) - 20px);
        margin: 8px 0;
        padding: 8px;
        background: rgba(0, 0, 0, 0.05);
        border-radius: 8px;
        overflow: hidden;
      }
      
      .spotify-scroll {
        width: 100%;
        overflow: hidden;
        position: relative;
      }
      
      .spotify-scroll.rtl {
        direction: rtl;
      }
      
      .spotify-scroll.ltr {
        direction: ltr;
      }
      
      .spotify-text {
        display: flex;
        align-items: center;
        white-space: nowrap;
        animation: marquee 20s linear infinite;
        padding: 0 4px;
      }
      
      .spotify-text.rtl {
        direction: rtl;
      }
      
      .spotify-text.ltr {
        direction: ltr;
      }
      
      .spotify-icon {
        flex-shrink: 0;
      }
      
      .album-art {
        width: 24px;
        height: 24px;
        border-radius: 4px;
        flex-shrink: 0;
      }
      
      @keyframes marquee {
        0% {
          transform: translateX(100%);
        }
        100% {
          transform: translateX(-100%);
        }
      }
      
      @keyframes marquee-rtl {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(100%);
        }
      }
      
      .spotify-scroll.rtl .spotify-text {
        animation-name: marquee-rtl;
      }

      /* Stop animation when media is not playing */
      .spotify-text.paused {
        animation-play-state: paused;
      }
    `
  };
}