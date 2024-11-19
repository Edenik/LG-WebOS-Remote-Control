import { HassEntity } from 'home-assistant-js-websocket';
import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  arcIcon, lineOutIcon,
  opticIcon,
  tvHeadphonesIcon,
  tvOpticIcon
} from '../../common/icons';
import { renderShape } from '../../common/media-renderer';
import { soundViewStyles } from '../../styles/view-styles';
import { SoundButton } from '../../types/buttons';

@customElement('sound-view')
export class SoundView extends LitElement {
  @property({ type: Object }) stateObj!: HassEntity;
  @state() private showText = false;

  private soundButtons: SoundButton[] = [
    { output: "tv_speaker", text: "TV Speaker", icon: "mdi:television-classic", class: "tv" },
    { output: "tv_external_speaker", text: "TV + Optic", icon: tvOpticIcon(), class: "tv-opt" },
    { output: "tv_speaker_headphone", text: "TV + H-Phone", icon: tvHeadphonesIcon(), class: "tv-phone" },
    { output: "external_optical", text: "Optical", icon: opticIcon(), class: "opt" },
    { output: "external_arc", text: "HDMI", icon: arcIcon(), class: "hdmi" },
    { output: "lineout", text: "Lineout", icon: lineOutIcon(), class: "line" },
    { output: "headphone", text: "HeadPhone", icon: "mdi:headphones", class: "phone" },
    { output: "bt_soundbar", text: "Bluetooth", icon: "mdi:bluetooth", class: "bluetooth" }
  ];

  private handleBack() {
    this.dispatchEvent(new CustomEvent('view-close'));
  }

  private handleSoundOutput(output: string) {
    this.dispatchEvent(new CustomEvent('sound-select', {
      detail: { output },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <div class="grid-container-sound">
        ${renderShape("sound")}
        <button class="bnt-sound-back ripple" @click=${this.handleBack}>
          <ha-icon icon="mdi:undo-variant"/>
        </button>
        ${this.showText ? this.renderSoundText() : this.renderSoundIcons()}
      </div>
    `;
  }

  private renderSoundText() {
    return html`
      <button class="btn_soundoutput ripple" @click=${() => this.showText = false}>SOUND</button>
      ${this.renderSoundButtons(true)}
    `;
  }

  private renderSoundIcons() {
    return html`
      <button class="sound_icon_text ripple" @click=${() => this.showText = true}>
        <ha-icon style="height: calc(var(--remotewidth) / 6); width: calc(var(--remotewidth) / 6);" icon="mdi:speaker">
      </button>
      ${this.renderSoundButtons(false)}
    `;
  }

  private renderSoundButtons(isText: boolean) {
    return this.soundButtons.map(button => this.renderSoundButton(button, isText));
  }

  private renderSoundButton(button: SoundButton, isText: boolean) {
    const isActive = this.stateObj.attributes.sound_output === button.output;
    const baseClass = isActive ? 'btn_sound_on' : 'btn_sound_off';
    const widthClass = isText ? 'bnt_sound_text_width' : 'bnt_sound_icon_width';

    return html`
      <button 
        class="${baseClass} ${button.class} ${widthClass} ${!isActive ? 'ripple overlay' : ''}"
        @click=${() => this.handleSoundOutput(button.output)}
      >
        ${isText ? button.text : (typeof button.icon === 'string'
        ? html`<ha-icon class="icon_source" icon="${button.icon}">`
        : button.icon)}
      </button>
    `;
  }

  static styles = soundViewStyles;
}