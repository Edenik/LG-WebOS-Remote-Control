export function getMediaPlayerEntitiesByPlatform(hass, platformName) {
  let entities = Object.keys(hass.entities).filter(
    (eid) => hass.entities[eid].platform === platformName
  );
  const re = /media_player/;
  return entities.filter(a => re.exec(a));
}


export function pluralToSingular(word: string) {
  if (word.endsWith('s')) {
    return word.slice(0, -1);
  }
  return word;
}

export function capitalizeFirstLetter(string: string) {
  if (typeof string !== 'string' || string.length === 0) {
    return '';
  }
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function getMdiIconsList(): Array<{ id: string, name: string }> {
  // Common media control and general purpose icons
  const icons = [
    { id: 'mdi:television', name: 'Television' },
    { id: 'mdi:power', name: 'Power' },
    { id: 'mdi:volume-high', name: 'Volume High' },
    { id: 'mdi:volume-medium', name: 'Volume Medium' },
    { id: 'mdi:volume-low', name: 'Volume Low' },
    { id: 'mdi:volume-off', name: 'Volume Mute' },
    { id: 'mdi:play', name: 'Play' },
    { id: 'mdi:pause', name: 'Pause' },
    { id: 'mdi:stop', name: 'Stop' },
    { id: 'mdi:fast-forward', name: 'Fast Forward' },
    { id: 'mdi:rewind', name: 'Rewind' },
    { id: 'mdi:skip-next', name: 'Skip Next' },
    { id: 'mdi:skip-previous', name: 'Skip Previous' },
    { id: 'mdi:menu', name: 'Menu' },
    { id: 'mdi:arrow-up', name: 'Arrow Up' },
    { id: 'mdi:arrow-down', name: 'Arrow Down' },
    { id: 'mdi:arrow-left', name: 'Arrow Left' },
    { id: 'mdi:arrow-right', name: 'Arrow Right' },
    { id: 'mdi:chevron-up', name: 'Chevron Up' },
    { id: 'mdi:chevron-down', name: 'Chevron Down' },
    { id: 'mdi:chevron-left', name: 'Chevron Left' },
    { id: 'mdi:chevron-right', name: 'Chevron Right' },
    { id: 'mdi:home', name: 'Home' },
    { id: 'mdi:apps', name: 'Apps' },
    { id: 'mdi:close', name: 'Close' },
    { id: 'mdi:check', name: 'Check' },
    { id: 'mdi:plus', name: 'Plus' },
    { id: 'mdi:minus', name: 'Minus' },
    { id: 'mdi:refresh', name: 'Refresh' },
    { id: 'mdi:cog', name: 'Settings' },
    { id: 'mdi:remote', name: 'Remote' },
    { id: 'mdi:netflix', name: 'Netflix' },
    { id: 'mdi:youtube', name: 'YouTube' },
    { id: 'mdi:spotify', name: 'Spotify' },
    { id: 'mdi:cast', name: 'Cast' },
    { id: 'mdi:keyboard', name: 'Keyboard' },
    { id: 'mdi:numeric-1', name: 'Number 1' },
    { id: 'mdi:numeric-2', name: 'Number 2' },
    { id: 'mdi:numeric-3', name: 'Number 3' },
    { id: 'mdi:numeric-4', name: 'Number 4' },
    { id: 'mdi:numeric-5', name: 'Number 5' },
    { id: 'mdi:numeric-6', name: 'Number 6' },
    { id: 'mdi:numeric-7', name: 'Number 7' },
    { id: 'mdi:numeric-8', name: 'Number 8' },
    { id: 'mdi:numeric-9', name: 'Number 9' },
    { id: 'mdi:numeric-0', name: 'Number 0' },
  ].sort((a, b) => a.name.localeCompare(b.name));

  return icons;
}