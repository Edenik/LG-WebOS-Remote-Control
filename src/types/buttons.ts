export enum ButtonAction {
    source = "source",
    script = "script",
    scene = "scene",
    automation = "automation"
}

export interface ButtonConfig {
    tooltip?: string;
    color?: string;
    icon?: string;
    img?: string;
    svg?: string;
    text?: string;
    text_color?: string;
    script_id?: string;
    data?: Record<string, any>;
    scene_id?: string;
    automation_id?: string;
    source?: string;
    action: ButtonAction;
    name: string;
}

export interface SelectedButton {
    type: ButtonType;
    index: number;
    button: ButtonConfig;
}

export enum ButtonType {
    buttons = "buttons",
    shortcuts = "shortcuts"
}

export enum IconType {
    svg = "svg",
    mdi = "mdi",
    img = "img",
    none = "none"
}

export interface SoundButton {
    output: string;
    text: string;
    icon: string | any;
    class: string;
}