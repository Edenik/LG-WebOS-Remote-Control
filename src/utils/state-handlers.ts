import { HassEntity } from 'home-assistant-js-websocket';

export const getEntityState = (entity: HassEntity, path: string): any => {
    return path.split('.').reduce((obj, key) => obj?.[key], entity);
}

export const isEntityAvailable = (entity: HassEntity): boolean => {
    return entity?.state !== 'unavailable';
}

export const getTvState = (entity: HassEntity): 'on' | 'off' => {
    return entity?.state === 'on' ? 'on' : 'off';
}

export const getVolumeLevel = (entity: HassEntity): number => {
    return Math.round((entity?.attributes?.volume_level || 0) * 100);
}

export const isMuted = (entity: HassEntity): boolean => {
    return entity?.attributes?.is_volume_muted === true;
}

export const getCurrentSource = (entity: HassEntity): string => {
    return entity?.attributes?.source || '';
}

export const getSourceList = (entity: HassEntity): string[] => {
    return entity?.attributes?.source_list || [];
}

export const getSoundOutput = (entity: HassEntity): string => {
    return entity?.attributes?.sound_output || '';
}