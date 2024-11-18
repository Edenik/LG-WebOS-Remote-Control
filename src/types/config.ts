import { ButtonConfig } from './buttons';

export enum SpotifyLocation {
    TOP = "top",
    BOTTOM = "bottom",
    ABOVE_BUTTONS = "above_buttons",
    UNDER_BUTTONS = "under_buttons"
}

export interface LGRemoteControlConfig {
    // Required Properties
    type: `custom:${string}`;
    entity: string;

    // Display Settings
    name?: string;
    tv_name_color?: string;
    debug?: boolean;
    debug_entities?: string[];

    // Device Configuration
    mac?: string;
    ampli_entity?: string;
    spotify_entity?: string;
    spotify_location?: SpotifyLocation;
    av_receiver_family?: string;

    // Button Configurations
    color_buttons?: boolean;
    replace_buttons?: Array<{
        button_name: string;
        script_id?: string;
        scene_id?: string;
        automation_id?: string;
    }>;

    // Visual Customization
    dimensions?: {
        border_width?: string;
        scale?: number;
    };

    colors?: {
        buttons?: string;
        background?: string;
        border?: string;
        text?: string;
    };

    // Custom Buttons & Shortcuts
    buttons?: ButtonConfig[];
    shortcuts?: ButtonConfig[];

    // Service Key Mappings
    keys?: {
        [key: string]: {
            service: string;
            data: Record<string, any>;
        };
    };
}
