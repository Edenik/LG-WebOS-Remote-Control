import { HomeAssistant } from 'custom-card-helpers';
import { HassEntity } from 'home-assistant-js-websocket';
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { viewStyles } from '../../styles/view-styles';
import { LGRemoteControlConfig } from '../../types/config';
import '../buttons/ColorButtons';
import '../buttons/CustomButton';
import '../buttons/DirectionPad';
import '../buttons/MediaControls';
import '../buttons/VolumeControls';
import '../spotify/SpotifyDisplay';

@customElement('default-view')
export class DefaultView extends LitElement {
  @property({ type: Object }) config!: LGRemoteControlConfig;
  @property({ type: Object }) stateObj!: HassEntity;
  @property({ type: Boolean }) showKeypad = false;
  @property({ type: Boolean }) showSoundOutput = false;
  @property({ type: Object }) hass!: HomeAssistant;

  render() {
    if (this.showKeypad) {
      return html`<key-pad @number-click=${this.handleNumberClick}></key-pad>`;
    }

    if (this.showSoundOutput) {
      return html`
        <sound-view 
          .stateObj=${this.stateObj}
          @view-close=${() => this.showSoundOutput = false}
          @sound-select=${this.handleSoundSelect}>
        </sound-view>`;
    }

    return html`
      <direction-pad 
        backgroundColor=${this.config.colors?.background || 'var(--ha-card-background)'}
        @button-click=${this.handleDirectionClick}
        @sound-click=${() => this.showSoundOutput = true}
        @input-click=${this.handleInputClick}>
      </direction-pad>

      ${this.config.spotify_location === 'above_buttons' ? this.renderSpotifyDisplay() : ''}
      ${this.renderCustomButtons()}
      ${this.config.spotify_location === 'under_buttons' ? this.renderSpotifyDisplay() : ''}
      
      <color-buttons 
        .enabled=${this.config.color_buttons}
        @color-click=${this.handleColorClick}>
      </color-buttons>

      <volume-controls
        .volume=${this.stateObj.attributes.volume_level * 100}
        .isMuted=${this.stateObj.attributes.is_volume_muted}
        @volume-change=${this.handleVolumeChange}
        @volume-mute=${this.handleVolumeMute}
        @channel-change=${this.handleChannelChange}
        @home-click=${this.handleHomeClick}
        @info-click=${this.handleInfoClick}>
      </volume-controls>

      <media-controls
        @media-command=${this.handleMediaCommand}>
      </media-controls>
    `;
  }

  private renderSpotifyDisplay() {
    if (!this.config.spotify_entity) return '';

    return html`
      <spotify-display .state=${this.hass.states[this.config.spotify_entity]}>
      </spotify-display>
    `;
  }

  private renderCustomButtons() {
    if (!this.config.buttons) return '';

    return html`
      <div class="grid-container-source">
        ${this.config.buttons.map(button => html`
          <custom-button
            .button=${button}
            .isCurrentSource=${button.action === 'source' &&
      this.stateObj.attributes.source === button.source}
            @button-click=${this.handleCustomButtonClick}>
          </custom-button>
        `)}
        ${this.renderShortcutsButton()}
        ${this.renderDebugButton()}
      </div>
    `;
  }

  private renderShortcutsButton() {
    if (!this.config.shortcuts?.length) return '';

    return html`
      <button title="Shortcuts" class="btn_source ripple" 
        @click=${this.handleShortcutsClick}>
        <ha-icon icon="mdi:gesture-tap-button"/>
      </button>
    `;
  }

  private renderDebugButton() {
    if (!this.config.debug) return '';

    return html`
      <button title="Debug" class="btn_source ripple" 
        @click=${this.handleDebugClick}>
        <ha-icon icon="mdi:bug-check"/>
      </button>
    `;
  }

  // Event handlers...
  private handleDirectionClick(e: CustomEvent) {
    this.dispatchEvent(new CustomEvent('button-click', {
      detail: e.detail,
      bubbles: true,
      composed: true
    }));
  }

  private handleInputClick() {
    this.dispatchEvent(new CustomEvent('input-click'));
  }

  private handleColorClick(e: CustomEvent) {
    this.dispatchEvent(new CustomEvent('button-click', {
      detail: e.detail,
      bubbles: true,
      composed: true
    }));
  }

  private handleVolumeChange(e: CustomEvent) {
    this.dispatchEvent(new CustomEvent('volume-change', {
      detail: e.detail,
      bubbles: true,
      composed: true
    }));
  }

  private handleVolumeMute() {
    this.dispatchEvent(new CustomEvent('volume-mute'));
  }

  private handleChannelChange(e: CustomEvent) {
    this.dispatchEvent(new CustomEvent('channel-change', {
      detail: e.detail,
      bubbles: true,
      composed: true
    }));
  }

  private handleHomeClick() {
    this.dispatchEvent(new CustomEvent('button-click', {
      detail: { button: 'HOME' },
      bubbles: true,
      composed: true
    }));
  }

  private handleInfoClick() {
    this.dispatchEvent(new CustomEvent('button-click', {
      detail: { button: 'INFO' },
      bubbles: true,
      composed: true
    }));
  }

  private handleMediaCommand(e: CustomEvent) {
    this.dispatchEvent(new CustomEvent('media-command', {
      detail: e.detail,
      bubbles: true,
      composed: true
    }));
  }

  private handleCustomButtonClick(e: CustomEvent) {
    this.dispatchEvent(new CustomEvent('custom-button-click', {
      detail: e.detail,
      bubbles: true,
      composed: true
    }));
  }

  private handleShortcutsClick() {
    this.dispatchEvent(new CustomEvent('shortcuts-toggle'));
  }

  private handleDebugClick() {
    this.dispatchEvent(new CustomEvent('debug-toggle'));
  }

  private handleNumberClick(e: CustomEvent) {
    this.dispatchEvent(new CustomEvent('button-click', {
      detail: { button: e.detail.number.toString() },
      bubbles: true,
      composed: true
    }));
  }

  private handleSoundSelect(e: CustomEvent) {
    this.dispatchEvent(new CustomEvent('sound-select', {
      detail: e.detail,
      bubbles: true,
      composed: true
    }));
  }

  static styles = viewStyles;
}