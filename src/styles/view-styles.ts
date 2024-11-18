import { css } from 'lit';
import { commonStyles } from './theme';

export const viewStyles = css`
  ${commonStyles}
  
  .grid-container-input {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: calc(var(--remotewidth)/2) calc(var(--remotewidth)/.5115);
    background-color: transparent;
    overflow: hidden;
    width: var(--remotewidth);
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
  }

  .grid-container-source {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    width: calc(var(--remotewidth)/1.03);
    overflow: hidden;
    margin: auto;
    padding-block: 1rem;
  }

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
`;

export const soundViewStyles = css`
  ${commonStyles}
  
  .grid-container-sound {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 28% 6% 16% 16% 16% 16% 6%;
    height: var(--remotewidth);
    width: var(--remotewidth);
    grid-template-areas: 
      "bnt title"
      ". ."
      "tv tv-opt"
      "tv-phone opt"
      "hdmi line"
      "phone bluetooth";
  }

  .btn_soundoutput {
    width: 70%;
    height: 70%;
    border-width: 0;
    margin: auto auto 0 0;
    cursor: pointer;
    background-color: transparent;
    grid-area: title;
    font-size: calc(var(--remotewidth)/12.5);
    display: block;
    opacity: .4;
    color: var(--remote-text-color);
    font-weight: bold;
  }

  .btn_sound_on, .btn_sound_off {
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
`;

export const debugViewStyles = css`
  ${commonStyles}
  
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
`;