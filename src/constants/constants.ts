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

export const DEFAULT_CONFIG = {
    dimensions: {
        border_width: "1px",
        scale: 1
    },
    colors: {
        buttons: "var(--secondary-background-color)",
        background: "var(--ha-card-background, var(--card-background-color, white))",
        border: "var(--primary-text-color)",
        text: "var(--primary-text-color)"
    },
    spotify_location: "top"
};
