import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { mediaControlStyles } from '../../styles/button-styles';

@customElement('media-controls')
export class MediaControls extends LitElement {
  private controls = [
    { command: "PLAY", service: "media.controls/play", icon: "mdi:play" },
    { command: "PAUSE", service: "media.controls/pause", icon: "mdi:pause" },
    { command: "STOP", service: "media.controls/stop", icon: "mdi:stop" },
    { command: "REWIND", service: "media.controls/rewind", icon: "mdi:skip-backward" },
    { command: "RECORD", service: "media.controls/Record", icon: "mdi:record", color: "red" },
    { command: "FAST_FOWARD", service: "media.controls/fastForward", icon: "mdi:skip-forward" }
  ];

  private handleCommand(command: string, service: string) {
    this.dispatchEvent(new CustomEvent('media-command', {
      detail: { command, service },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <div class="grid-container-media-control">
        ${this.controls.map(control => html`
          <button 
            class="btn-flat flat-low ripple" 
            style="${control.color ? `color: ${control.color};` : ''}"
            @click=${() => this.handleCommand(control.command, control.service)}>
            <ha-icon icon="${control.icon}"/>
          </button>
        `)}
      </div>
    `;
  }

  static styles = mediaControlStyles;
}