import { css } from 'lit';

export const debugStyles = css`
  .debug-info {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }

  .debug-section {
    background: var(--card-background-color);
    border-radius: 8px;
    overflow: hidden;
    box-shadow: var(--ha-card-box-shadow, none);
  }

  .debug-header {
    background: var(--secondary-background-color);
    padding: 16px;
    font-weight: 500;
  }

  .debug-content {
    padding: 16px;
  }

  .debug-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px 0;
    border-bottom: 1px solid var(--divider-color);
  }

  .debug-row:last-child {
    border-bottom: none;
  }

  .debug-label {
    color: var(--secondary-text-color);
    font-size: 0.9em;
  }

  .debug-value {
    font-family: monospace;
    word-break: break-word;
  }

  .debug-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .debug-pre {
    margin: 0;
    padding: 8px;
    background: var(--secondary-background-color);
    border-radius: 4px;
    overflow-x: auto;
  }
`;

export const spotifyStyles = css`
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

  .spotify-text.paused {
    animation-play-state: paused;
  }
`;

export const cardStyles = css`
  :host {
    display: block;
  }

  .card {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .card-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
`;