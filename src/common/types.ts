import { HomeAssistant } from "custom-card-helpers";

export interface HomeAssistantFixed extends HomeAssistant {
  entities: { [id: string]: EntityRegistryDisplayEntry };
}

type entityCategory = "config" | "diagnostic";

export interface EntityRegistryDisplayEntry {
  entity_id: string;
  name?: string;
  device_id?: string;
  area_id?: string;
  hidden?: boolean;
  entity_category?: entityCategory;
  translation_key?: string;
  platform?: string;
  display_precision?: number;
}

export interface WindowWithCards extends Window {
  customCards: unknown[];
}

export interface ButtonConfig {
  tooltip?: string;
  color?: string;
  icon?: string;
  img?: string;
  svg?: string;
  text?: string;
  text_color?: string;
  script_id?: string; // if action === script
  data?: Record<string, any>; // if script_id included
  scene_id?: string; // if action === scene
  automation_id?: string; // if action === automation
  source?: string; // if action === source
  action: ButtonAction;
  name: string;
};

export interface SelectedButton {
  type: ButtonType,
  index: number;
  button: ButtonConfig;
}

export enum ButtonAction {
  source = "source",
  script = "script",
  scene = "scene",
  automation = "automation"
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