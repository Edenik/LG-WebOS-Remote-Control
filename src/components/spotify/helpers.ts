import { HomeAssistant } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import { LGRemoteControlConfig } from "../../types/config";

export const getSpotifyEntity = (config: LGRemoteControlConfig, hass: HomeAssistant): HassEntity | undefined => {
    if (!config.spotify_entity) { return; }
    return hass.states[config.spotify_entity];
}

export const getSpotifyTitle = (config: LGRemoteControlConfig, hass: HomeAssistant): string => {
    const spotifyEntity = getSpotifyEntity(config, hass);
    return getSpotifyTitleFromEntity(spotifyEntity);
}

export const getSpotifyTitleFromEntity = (state: HassEntity) => {
    if (!state || !state?.attributes?.media_title || !state?.attributes?.media_artist) {
        return '';
    }
    return `${state.attributes.media_artist} - ${state.attributes.media_title}`;
}
