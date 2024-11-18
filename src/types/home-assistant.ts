import { HomeAssistant } from 'custom-card-helpers';

export interface HomeAssistantFixed extends HomeAssistant {
    entities: { [id: string]: EntityRegistryDisplayEntry };
}

export interface WindowWithCards extends Window {
    customCards: unknown[];
}

export interface EntityRegistryDisplayEntry {
    entity_id: string;
    name?: string;
    device_id?: string;
    area_id?: string;
    hidden?: boolean;
    entity_category?: "config" | "diagnostic";
    translation_key?: string;
    platform?: string;
    display_precision?: number;
}

export interface WindowWithCards extends Window {
    customCards: unknown[];
}

export interface EntityState {
    entity_id: string;
    state: string;
    attributes: Record<string, any>;
    last_changed: string;
    last_updated: string;
}

export interface HassServiceData {
    entity_id?: string | string[];
    [key: string]: any;
}

export interface HassService {
    name?: string;
    description?: string;
    fields?: Record<string, {
        name?: string;
        description?: string;
        required?: boolean;
        example?: string;
        selector?: Record<string, any>;
    }>;
}