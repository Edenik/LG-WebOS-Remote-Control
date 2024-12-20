import { css } from "lit";

export const globalStyles = css`
@keyframes blinker {
  50% {
    opacity: 0;
  }
}
.tv_title {
  width: fit-content;
  alig: -webkit-center;
  display: block;
  margin: auto;
  padding: calc(var(--remotewidth)/52) calc(var(--remotewidth)/26);
  border-radius: calc(var(--remotewidth)/10);
  background-color: var(--remote-button-color);
}
button:focus {
  outline: 0;
}
.ripple {
  position: relative;
  overflow: hidden;
  transform: translate3d(0, 0, 0);
}
.ripple:after {
  content: "";
  display: block;
  position: absolute;
  border-radius: 50%;
  top: 0;
  left: 0;
  pointer-events: none;
  background-image: radial-gradient(circle, #7a7f87 2%, transparent 10.01%);
  background-repeat: no-repeat;
  background-position: 50%;
  transform: scale(10, 10);
  opacity: 0;
  transition: transform .5s, opacity 1s;
}
.ripple:active:after {
  transform: scale(0, 0);
  opacity: .3;
  transition: 0s;
}
.blink {
  animation: blinker 1.5s linear infinite;
  color: red;
}
.card, .ripple:after {
  width: 100%;
  height: 100%}
.card {
  display: flex;
  justify-content: center;
}
.page {
  background-color: var(--remote-color);
  height: 100%;
  display: inline-block;
  flex-direction: row;
  border: var(--main-border-width) solid var(--main-border-color);
  border-radius: calc(var(--remotewidth)/7.5);
  padding: calc(var(--remotewidth)/37.5) calc(var(--remotewidth)/15.2) calc(var(--remotewidth)/11);
}
.grid-container-power {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr;
  background-color: transparent;
  overflow: hidden;
  width: var(--remotewidth);
  height: calc(var(--remotewidth)/3);
}
.grid-container-cursor, .grid-container-keypad {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  overflow: hidden;
  height: var(--remotewidth);
}
.grid-container-cursor {
  grid-template-rows: 1fr 1fr 1fr;
  width: var(--remotewidth);
  grid-template-areas: "sound up input""left ok right""back down exit"}
.grid-container-keypad {
  grid-template-rows: 1fr 1fr 1fr 1fr;
  background-color: transparent;
  background-color: var(--remote-button-color);
  border-radius: 35px;
  width: calc(var(--remotewidth) - 10%);
  margin: auto;
}
.grid-container-input, .grid-container-sound {
  display: grid;
  background-color: transparent;
  overflow: hidden;
  width: var(--remotewidth);
}
.grid-container-input {
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: calc(var(--remotewidth)/2) calc(var(--remotewidth)/.5115);
}
.grid-container-sound {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 28% 6% 16% 16% 16% 16% 6%;
  height: var(--remotewidth);
  grid-template-areas: "bnt title"". .""tv tv-opt""tv-phone opt""hdmi line""phone bluetooth"
}
.grid-container-color_btn, .grid-container-source {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem; /* Adjust gap size as needed */
  width: calc(var(--remotewidth)/1.03);
  overflow: hidden;
  margin: auto;
  padding-block: 1rem;
}

.grid-container-source > * {
  flex: 0 0 auto;
}

.grid-container-color_btn {
  height: calc(var(--remotewidth)/10);
}
.grid-container-media-control, .grid-container-volume-channel-control {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  background-color: transparent;
  width: var(--remotewidth);
  height: calc(var(--remotewidth)/1.4);
  overflow: hidden;
  margin-top: calc(var(--remotewidth)/12);
}
.grid-container-media-control {
  grid-template-rows: 1fr 1fr;
  height: calc(var(--remotewidth)/2.85);
}
.grid-item-input {
  grid-column-start: 1;
  grid-column-end: 4;
  grid-row-start: 1;
  grid-row-end: 3;
  display: grid;
  grid-template-columns: auto;
  background-color: var(--remote-button-color);
  margin: auto;
  margin-top: calc(var(--remotewidth)/2.6);
  overflow: scroll;
  height: calc(var(--remotewidth)*2.01);
  width: calc(var(--remotewidth) - 9%);
  border-radius: calc(var(--remotewidth)/12);
}

.grid-item-input.debug-screen {
  display: unset !important;
}

.grid-item-input::-webkit-scrollbar {
  display: none;
  -ms-overflow-style: none;
}
.shape, .shape-input, .shape-sound, .source_text {
  grid-column-start: 1;
  grid-column-end: 4;
  grid-row-start: 1;
}
.shape {
  grid-row-end: 4;
  padding: 5px;
}
.shape-input, .shape-sound, .source_text {
  grid-row-end: 3;
}
.shape-sound, .source_text {
  grid-column-end: 5;
  grid-row-end: 6;
}
.source_text {
  grid-column-end: 3;
  grid-row-end: 2;
  text-align: center;
  margin-top: calc(var(--remotewidth)/6);
  font-size: calc(var(--remotewidth)/10);
  opacity: .3;
}
.btn_soundoutput, .sound_icon_text {
  width: 70%;
  height: 70%;
  border-width: 0;
  margin: auto auto 0 0;
  cursor: pointer;
  background-color: transparent;
  grid-area: title;
}
.sound_icon_text {
  color: var(--remote-text-color);
  font-size: calc(var(--remotewidth)/18.75);
  overflow: hidden;
}
.btn_soundoutput {
  font-size: calc(var(--remotewidth)/12.5);
  display: block;
  opacity: .4;
  color: var(--remote-text-color);
  font-weight: bold;
}
.tv {
  grid-area: tv;
}
.tv-opt {
  grid-area: tv-opt;
}
.tv-phone {
  grid-area: tv-phone;
}
.opt {
  grid-area: opt;
}
.hdmi {
  grid-area: hdmi;
}
.phone {
  grid-area: phone;
}
.line {
  grid-area: line;
}
.bluetooth {
  grid-area: bluetooth;
}
.item_sound {
  grid-area: sound;
}
.item_up {
  grid-area: up;
}
.item_input {
  grid-area: input;
}
.item_2_sx {
  grid-area: left;
}
.item_2_c {
  grid-area: ok;
}
.item_right {
  grid-area: right;
}
.item_back {
  grid-area: back;
}
.item_down {
  grid-area: down;
}
.item_exit {
  grid-area: exit;
}
ha-icon {
  width: calc(var(--remotewidth)/10.8);
  height: calc(var(--remotewidth)/10.8);
}
.bnt-input-back, .bnt-sound-back, .btn {
  font-size: calc(var(--remotewidth)/18.75);
  border-radius: 50%;
  place-items: center;
  display: inline-block;
  cursor: pointer;
}
.btn {
  background-color: var(--remote-button-color);
  color: var(--remote-text-color);
  width: 70%;
  height: 70%;
  border-width: 0;
  margin: auto;
}
.bnt-input-back, .bnt-sound-back {
  background-color: transparent;
  margin-top: calc(var(--remotewidth)/21);
}
.bnt-input-back {
  grid-column-start: 3;
  grid-column-end: 4;
  grid-row-start: 1;
  grid-row-end: 2;
  color: var(--remote-text-color);
  width: 70%;
  height: 50%;
  border-width: 0;
  margin-left: calc(var(--remotewidth)/21);
}
.bnt-sound-back {
  margin-left: 0;
  grid-area: bnt;
  width: 45%;
  height: 83%;
  margin-left: calc(var(--remotewidth)/18);
}
.bnt-sound-back, .btn-color, .btn-keypad, .btn_source {
  color: var(--remote-text-color);
  border-width: 0;
}
.btn-keypad {
  background-color: transparent;
  font-size: calc(var(--remotewidth)/10);
  width: 100%;
  height: 100%}
.btn-color, .btn_source {
  background-color: var(--remote-button-color);
  border-radius: calc(var(--remotewidth)/10);
  place-items: center;
  cursor: pointer;
}

.btn_source {
  min-width: calc(var(--remotewidth)/5.9);
  height: calc(var(--remotewidth)/8.125);
  margin: 0 auto;
  padding-inline: 10px;
}

.btn_source.rtl, .btn-input.rtl{
  direction: rtl;
}

.btn_source.active {
    border: 2px solid var(--text-primary-color);
}

.btn-color {
  width: 70%;
  height: 55%;
  margin: auto;
}
.icon_source {
  height: 100%;
  width: 100%}
.btn-input, .btn-input-on {
  font-size: calc(var(--remotewidth)/18.5);
  height: calc(var(--remotewidth)/7.2226);
  border-width: 0;
  border-radius: calc(var(--remotewidth)/20);
  margin: calc(var(--remotewidth)/47);
  place-items: center;
  display: list-item;
  cursor: pointer;
}
.btn-input {
  background-color: var(--remote-button-color);
  color: var(--remote-text-color);
  border: solid 2px var(--remote-color);
}
.btn-input-on {
  background-color: var(--primary-color);
  color: #fff;
}
.bnt_sound_icon_width {
  width: calc(var(--remotewidth)/3);
}
.bnt_sound_text_width {
  width: calc(var(--remotewidth)/2.6);
}
.btn_sound_off, .btn_sound_on {
  font-size: calc(var(--remotewidth)/25);
  height: calc(var(--remotewidth)/9.3);
  border-width: 0;
  border-radius: calc(var(--remotewidth)/20);
  margin: auto;
  display: block;
  cursor: pointer;
}
.btn_sound_on {
  background-color: var(--primary-color);
  color: #fff;
}
.btn_sound_off {
  background-color: var(--remote-button-color);
  color: var(--remote-text-color);
  border: solid 2px var(--remote-color);
}
.overlay {
  background-color: rgba(0, 0, 0, .02);
}
.flat-high {
  width: 70%;
  height: 37%}
.flat-low {
  width: 70%;
  height: 65%}
.btn-flat {
  background-color: var(--remote-button-color);
  color: var(--remote-text-color);
  font-size: calc(var(--remotewidth)/18.75);
  border-width: 0;
  border-radius: calc(var(--remotewidth)/10);
  margin: auto;
  display: grid;
  place-items: center;
  display: inline-block;
  cursor: pointer;
}


.ok_button {
  display: flex;
  color: var(--remote-text-color);
  justify-content: center;
  align-items: center;
  border: solid 3px var(--ha-card-background);
  border-radius: 100%;
  font-size: calc(var(--remotewidth)/16.6);
  cursor: pointer;

}

.vol_text_value {
  // width: 40px;
  background-color: transparent;
  border: none;
  text-align: center;
  color: var(--primary-text-color);
  font-size: calc(var(--remotewidth)/14);
}

.debug-info {
  display: flex;
  flex-direction: column;
}

.debug-section {
  border: 1px solid var(--divider-color, #e0e0e0);
  border-bottom: none;
}

.debug-section:last-child {
  border-bottom: 1px solid var(--divider-color, #e0e0e0);
}

.debug-header {
  background: var(--secondary-background-color);
  padding: 12px 16px;
  border-bottom: 1px solid var(--divider-color, #e0e0e0);
}

.debug-title {
  font-weight: 500;
  font-size: 16px;
}

.debug-content {
  padding: 8px 16px;
  background-color: var(--card-background-color);
}

.debug-row {
  padding: 8px 0;
  border-bottom: 1px solid var(--divider-color, #e0e0e0);
}

.debug-row:last-child {
  border-bottom: none;
}

.debug-label {
  font-weight: 500;
  color: var(--secondary-text-color);
  margin-bottom: 4px;
}

.debug-value {
  word-break: break-word;
  font-family: monospace;
}

.debug-list {
  margin: 0;
  padding: 0;
}

.debug-list-item {
  padding: 2px 0;
}

.debug-pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  background: var(--secondary-background-color);
  padding: 8px;
  border-radius: 4px;
}

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
`;