import { LGRemoteControlConfig } from './config';
import { HomeAssistantFixed } from './home-assistant';

export interface ValidationContext {
    hass?: HomeAssistantFixed;
    config?: LGRemoteControlConfig;
}