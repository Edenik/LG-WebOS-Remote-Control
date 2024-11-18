import { HomeAssistant } from 'custom-card-helpers';

export class ServiceHandler {
    constructor(private hass: HomeAssistant, private debug: boolean = false) { }

    private logAction(domain: string, service: string, serviceData: Record<string, any>) {
        if (this.debug) {
            console.log('Called action:', { domain, service, serviceData });
        }
    }

    public clickButton(entityId: string, button: string) {
        this.callService("webostv", "button", {
            entity_id: entityId,
            button: button
        });
    }

    public handleVolumeChange(entityId: string, action: 'up' | 'down') {
        const service = action === 'up' ? 'volume_up' : 'volume_down';
        this.callService('media_player', service, {
            entity_id: entityId
        });
    }

    public handleChannelChange(entityId: string, direction: 'up' | 'down') {
        const button = direction === 'up' ? 'CHANNELUP' : 'CHANNELDOWN';
        this.clickButton(entityId, button);
    }

    public runScript(scriptId: string, data: Record<string, any> = {}) {
        const serviceData = { entity_id: `script.${scriptId}`, ...data };
        this.callService('script', scriptId, serviceData);
    }

    public selectSource(entityId: string, source: string) {
        this.callService('media_player', 'select_source', {
            entity_id: entityId,
            source: source
        });
    }

    public selectSoundOutput(entityId: string, soundOutput: string) {
        this.callService('webostv', 'select_sound_output', {
            entity_id: entityId,
            sound_output: soundOutput
        });
    }

    private callService(domain: string, service: string, serviceData: Record<string, any> = {}) {
        this.logAction(domain, service, serviceData);
        this.hass.callService(domain, service, serviceData);
    }
}