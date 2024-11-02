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


export interface Button {
  tooltip?: string;
  color?: string;
  icon?: string;
  img?: string;
  svg?: string;
  text?: string;
  text_color?: string;
  script_id?: string;
  scene_id?: string;
  data?: Record<string, any>;
};


export interface SelectedButton {
  type: "sources" | "scripts" | "shortcuts",
  index: number;
  button: Button;
}
