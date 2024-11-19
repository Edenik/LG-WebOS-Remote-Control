import { HassEntity } from 'home-assistant-js-websocket';

export interface SpotifyState extends HassEntity {
    attributes: {
        media_title: string;
        media_artist: string;
        entity_picture?: string;
        [key: string]: any;
    };
}