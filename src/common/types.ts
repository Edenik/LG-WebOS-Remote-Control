// import { HomeAssistant } from "custom-card-helpers";
// import { TemplateResult } from "lit";

// export interface HomeAssistantFixed extends HomeAssistant {
//   entities: { [id: string]: EntityRegistryDisplayEntry };
// }

// type entityCategory = "config" | "diagnostic";

// export interface EntityRegistryDisplayEntry {
//   entity_id: string;
//   name?: string;
//   device_id?: string;
//   area_id?: string;
//   hidden?: boolean;
//   entity_category?: entityCategory;
//   translation_key?: string;
//   platform?: string;
//   display_precision?: number;
// }

// export interface WindowWithCards extends Window {
//   customCards: unknown[];
// }

// export interface LGRemoteControlConfig {
//   // Required Properties
//   type: `custom:${string}`; // Based on the getStubConfig usage
//   entity: string;  // media_player entity_id

//   // Display Settings
//   name?: string;
//   tv_name_color?: string;
//   debug?: boolean;
//   debug_entities?: string[];

//   // Device Configuration
//   mac?: string;
//   ampli_entity?: string;
//   spotify_entity?: string;
//   spotify_location?: SpotifyLocation;
//   av_receiver_family?: string;

//   // Button Configurations
//   color_buttons?: boolean;
//   replace_buttons?: Array<{
//     button_name: string;
//     script_id?: string;
//     scene_id?: string;
//     automation_id?: string;
//   }>;

//   // Visual Customization
//   dimensions?: {
//     border_width?: string;
//     scale?: number;
//   };

//   colors?: {
//     buttons?: string;
//     background?: string;
//     border?: string;
//     text?: string;
//   };

//   // Custom Buttons & Shortcuts
//   buttons?: ButtonConfig[];
//   shortcuts?: ButtonConfig[];

//   // Service Key Mappings
//   keys?: {
//     [key: string]: {
//       service: string;
//       data: Record<string, any>;
//     };
//   };
// }

// export interface ButtonConfig {
//   tooltip?: string;
//   color?: string;
//   icon?: string;
//   img?: string;
//   svg?: string;
//   text?: string;
//   text_color?: string;
//   script_id?: string; // if action === script
//   data?: Record<string, any>; // if script_id included
//   scene_id?: string; // if action === scene
//   automation_id?: string; // if action === automation
//   source?: string; // if action === source
//   action: ButtonAction;
//   name: string;
// };

// export interface SelectedButton {
//   type: ButtonType,
//   index: number;
//   button: ButtonConfig;
// }

// export enum ButtonAction {
//   source = "source",
//   script = "script",
//   scene = "scene",
//   automation = "automation"
// }

// export enum ButtonType {
//   buttons = "buttons",
//   shortcuts = "shortcuts"
// }

// export enum IconType {
//   svg = "svg",
//   mdi = "mdi",
//   img = "img",
//   none = "none"
// }

// export interface SoundButton {
//   output: string;
//   text: string;
//   icon: string | TemplateResult<1>;
//   class: string;
// }

// export enum SpotifyLocation {
//   TOP = "top",
//   BOTTOM = "bottom",
//   ABOVE_BUTTONS = "above_buttons",
//   UNDER_BUTTONS = "under_buttons"
// }