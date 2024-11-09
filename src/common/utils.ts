import { MEDIA_PLAYER_FEATURES } from "./const";

export function getMediaPlayerEntitiesByPlatform(hass, platformName) {
  let entities = Object.keys(hass.entities).filter(
    (eid) => hass.entities[eid].platform === platformName
  );
  const re = /media_player/;
  return entities.filter(a => re.exec(a));
}


export function pluralToSingular(word: string) {
  if (!!word && word.endsWith('s')) {
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

export const decodeSupportedFeatures = (supportedFeatures: number) => {
  const supportedActions = [];

  // Iterate through each feature
  for (const [feature, value] of Object.entries(MEDIA_PLAYER_FEATURES)) {
    // Check if the bit is set using bitwise AND
    if (supportedFeatures & value) {
      supportedActions.push(feature);
    }
  }

  return supportedActions;
}