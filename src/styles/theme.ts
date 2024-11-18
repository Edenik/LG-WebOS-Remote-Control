import { css } from 'lit';

export const themeStyles = css`
  :host {
    --remote-button-color: var(--secondary-background-color);
    --remote-text-color: var(--primary-text-color);
    --remote-color: var(--ha-card-background, var(--card-background-color, white));
    --main-border-color: var(--primary-text-color);
    --main-border-width: 1px;
    --remotewidth: 260px;
  }
`;

export const commonStyles = css`
  .ripple {
    position: relative;
    overflow: hidden;
    transform: translate3d(0, 0, 0);
  }

  .ripple:after {
    content: "";
    display: block;
    position: absolute;
    width: 100%;
    height: 100%;
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

  @keyframes blinker {
    50% {
      opacity: 0;
    }
  }
`;

export const layoutStyles = css`
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
`;