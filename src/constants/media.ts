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

export const PLAYER_STATES = {
    OFF: 'off',
    ON: 'on',
    IDLE: 'idle',
    PLAYING: 'playing',
    PAUSED: 'paused',
    STANDBY: 'standby',
    UNAVAILABLE: 'unavailable'
};

export const SOUND_OUTPUTS = {
    TV_SPEAKER: "tv_speaker",
    TV_EXTERNAL_SPEAKER: "tv_external_speaker",
    TV_SPEAKER_HEADPHONE: "tv_speaker_headphone",
    EXTERNAL_OPTICAL: "external_optical",
    EXTERNAL_ARC: "external_arc",
    LINEOUT: "lineout",
    HEADPHONE: "headphone",
    BT_SOUNDBAR: "bt_soundbar"
};

export const REMOTE_COMMANDS = {
    POWER: "POWER",
    MENU: "MENU",
    MUTE: "MUTE",
    VOLUME_UP: "VOLUME_UP",
    VOLUME_DOWN: "VOLUME_DOWN",
    CHANNEL_UP: "CHANNELUP",
    CHANNEL_DOWN: "CHANNELDOWN",
    UP: "UP",
    DOWN: "DOWN",
    LEFT: "LEFT",
    RIGHT: "RIGHT",
    ENTER: "ENTER",
    BACK: "BACK",
    EXIT: "EXIT",
    HOME: "HOME",
    INFO: "INFO"
};