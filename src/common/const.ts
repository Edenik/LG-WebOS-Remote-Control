export const CARD_VERSION = "v@LG_REMOTE_CONTROL_CARD_VERSION_PLACEHOLDER@";
export const CARD_TAG_NAME = "lg-remote-control";
export const EDITOR_CARD_TAG_NAME = "lg-remote-control-editor";

const avreceivers = {
    "dlna_dmr": {
        "friendlyName": "DLNA DMR Receivers",
    },
    "anthemav": {
        "friendlyName": "Anthem A/V Receivers",
    },
    "arcam_fmj": {
        "friendlyName": "Arcam FMJ Receivers",
    },
    "denonavr": {
        "friendlyName": "Denon, Marantz A/V Receivers",
    },
    "heos": {
        "friendlyName": "Denon heos A/V Receivers",
    },
    "harman_kardon_avr": {
        "friendlyName": "Harman Kardon AVR",
    },
    "monoprice": {
        "friendlyName": "Monoprice 6-Zone Amplifier",
    },
    "onkyo": {
        "friendlyName": "Onkyo A/V Receivers",
    },
    "sonos": {
        "friendlyName": "Sonos",
    },
    "pws66i": {
        "friendlyName": "Soundavo WS66i 6-Zone Amplifier",
    },
    "yamaha": {
        "friendlyName": "Yamaha Network Receivers",
    },
}

export const AvReceiverdevicemap = new Map(Object.entries(avreceivers));


export const MEDIA_PLAYER_FEATURES = {
    PAUSE: 1,
    SEEK: 2,
    VOLUME_SET: 4,
    VOLUME_MUTE: 8,
    PREVIOUS_TRACK: 16,
    NEXT_TRACK: 32,
    TURN_ON: 128,
    TURN_OFF: 256,
    PLAY_MEDIA: 512,
    VOLUME_STEP: 1024,
    SELECT_SOURCE: 2048,
    STOP: 4096,
    CLEAR_PLAYLIST: 8192,
    PLAY: 16384,
    SHUFFLE_SET: 32768,
    SELECT_SOUND_MODE: 65536,
    BROWSE_MEDIA: 131072,
    REPEAT_SET: 262144,
    GROUPING: 524288
};