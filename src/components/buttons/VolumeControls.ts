import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { volumeControlStyles } from '../../styles/button-styles';

@customElement('volume-controls')
export class VolumeControls extends LitElement {
    @property({ type: Number }) volume = 0;
    @property({ type: Boolean }) isMuted = false;
    @property({ type: Boolean }) showVolumeText = false;

    private longPressTimer: any;
    private isLongPress = false;
    private valueDisplayTimeout: any;

    private handleVolumeAction(action: 'up' | 'down') {
        this.dispatchEvent(new CustomEvent('volume-change', {
            detail: { action },
            bubbles: true,
            composed: true
        }));
    }

    private handleMute() {
        this.dispatchEvent(new CustomEvent('volume-mute', {
            bubbles: true,
            composed: true
        }));
    }

    private handleHome() {
        this.dispatchEvent(new CustomEvent('home-click', {
            bubbles: true,
            composed: true
        }));
    }

    private handleChannel(direction: 'up' | 'down') {
        this.dispatchEvent(new CustomEvent('channel-change', {
            detail: { direction },
            bubbles: true,
            composed: true
        }));
    }

    private handleShowVolume() {
        this.showVolumeText = true;
        this.valueDisplayTimeout = setTimeout(() => {
            this.showVolumeText = false;
        }, 500);
    }

    render() {
        return html`
      <div class="grid-container-volume-channel-control">
        <button class="btn ripple" id="plusButton" 
          style="border-radius: 50% 50% 0px 0px; margin: 0px auto 0px auto; height: 100%;">
          <ha-icon icon="mdi:plus"/>
        </button>

        <button class="btn-flat flat-high ripple" id="homeButton" 
          style="margin-top: 0px; height: 50%;"
          @click=${() => this.handleHome()}>
          <ha-icon icon="mdi:home"></ha-icon>
        </button>

        <button class="btn ripple" 
          style="border-radius: 50% 50% 0px 0px; margin: 0px auto 0px auto; height: 100%;" 
          @click=${() => this.handleChannel('up')}>
          <ha-icon icon="mdi:chevron-up"/>
        </button>

        <button class="btn ripple" 
          @click=${() => this.handleShowVolume()}
          style="border-radius: 0px; cursor: default; margin: 0px auto 0px auto; height: 100%;">
          ${this.showVolumeText ? this.volume :
                html`<ha-icon icon="${this.isMuted ? 'mdi:volume-off' : 'mdi:volume-high'}"/>`}
        </button>

        <button class="btn ripple" 
          style="color:${this.isMuted ? 'red' : ''}; height: 100%;" 
          @click=${() => this.handleMute()}>
          <span class="${this.isMuted ? 'blink' : ''}">
            <ha-icon icon="mdi:volume-mute"/>
          </span>
        </button>

        <button class="btn" 
          style="border-radius: 0px; cursor: default; margin: 0px auto 0px auto; height: 100%;">
          <ha-icon icon="mdi:parking"/>
        </button>

        <button class="btn ripple" id="minusButton" 
          style="border-radius: 0px 0px 50% 50%; margin: 0px auto 0px auto; height: 100%;">
          <ha-icon icon="mdi:minus"/>
        </button>

        <button class="btn-flat flat-high ripple" 
          style="margin-bottom: 0px; height: 50%;" 
          @click=${() => this.dispatchEvent(new CustomEvent('info-click'))}>
          <ha-icon icon="mdi:information-variant"/>
        </button>

        <button class="btn ripple" 
          style="border-radius: 0px 0px 50% 50%; margin: 0px auto 0px auto; height: 100%;"  
          @click=${() => this.handleChannel('down')}>
          <ha-icon icon="mdi:chevron-down"/>
        </button>
      </div>
    `;
    }

    static styles = volumeControlStyles;

    firstUpdated() {
        this.setupVolumeListeners();
    }

    private setupVolumeListeners() {
        const plusButton = this.shadowRoot?.querySelector("#plusButton");
        const minusButton = this.shadowRoot?.querySelector("#minusButton");

        if (plusButton) {
            this.setupButtonListeners(plusButton, 'up');
        }

        if (minusButton) {
            this.setupButtonListeners(minusButton, 'down');
        }
    }

    private setupButtonListeners(button: Element, direction: 'up' | 'down') {
        const startHandler = () => {
            this.isLongPress = false;
            this.showVolumeText = true;
            this.longPressTimer = setTimeout(() => {
                this.isLongPress = true;
                this.handleVolumeAction(direction);
                this.longPressTimer = setInterval(() => this.handleVolumeAction(direction), 100);
            }, 500);
        };

        const endHandler = () => {
            clearTimeout(this.longPressTimer);
            if (!this.isLongPress) {
                this.handleVolumeAction(direction);
            }
            clearInterval(this.longPressTimer);
            this.valueDisplayTimeout = setTimeout(() => {
                this.showVolumeText = false;
            }, 500);
        };

        button.addEventListener("mousedown", startHandler);
        button.addEventListener("touchstart", (e) => {
            e.preventDefault();
            startHandler();
        });
        button.addEventListener("mouseup", endHandler);
        button.addEventListener("touchend", endHandler);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        clearTimeout(this.longPressTimer);
        clearTimeout(this.valueDisplayTimeout);
    }
}