import { css, CSSResult } from 'lit';

export const buttonBaseStyles: CSSResult = css`
  button {
    border: none;
    cursor: pointer;
    background: transparent;
    padding: 0;
    margin: 0;
    outline: none;
  }

  button:focus {
    outline: none;
  }

  .btn {
    background-color: var(--remote-button-color);
    color: var(--remote-text-color);
    border-radius: 50%;
    width: 70%;
    height: 70%;
    margin: auto;
  }

  .btn-flat {
    background-color: var(--remote-button-color);
    color: var(--remote-text-color);
    font-size: calc(var(--remotewidth)/18.75);
    border-radius: calc(var(--remotewidth)/10);
    display: grid;
    place-items: center;
    cursor: pointer;
  }

  .flat-high {
    width: 70%;
    height: 37%;
  }

  .flat-low {
    width: 70%;
    height: 65%;
  }
`;

export const keypadStyles: CSSResult = css`
  ${buttonBaseStyles}

  .grid-container-keypad {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr 1fr;
    background-color: var(--remote-button-color);
    border-radius: 35px;
    width: calc(var(--remotewidth) - 10%);
    margin: auto;
    overflow: hidden;
  }

  .btn-keypad {
    background-color: transparent;
    color: var(--remote-text-color);
    font-size: calc(var(--remotewidth)/10);
    width: 100%;
    height: 100%;
  }
`;

export const directionPadStyles: CSSResult = css`
  ${buttonBaseStyles}

  .grid-container-cursor {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr;
    width: var(--remotewidth);
    height: var(--remotewidth);
    overflow: hidden;
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
`;

export const mediaControlStyles: CSSResult = css`
  ${buttonBaseStyles}

  .grid-container-media-control {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    background-color: transparent;
    width: var(--remotewidth);
    height: calc(var(--remotewidth)/2.85);
    overflow: hidden;
    margin-top: calc(var(--remotewidth)/12);
  }
`;

export const volumeControlStyles: CSSResult = css`
  ${buttonBaseStyles}

  .grid-container-volume-channel-control {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr;
    background-color: transparent;
    width: var(--remotewidth);
    height: calc(var(--remotewidth)/1.4);
    overflow: hidden;
    margin-top: calc(var(--remotewidth)/12);
  }

  .vol_text_value {
    background-color: transparent;
    border: none;
    text-align: center;
    color: var(--primary-text-color);
    font-size: calc(var(--remotewidth)/14);
  }
`;