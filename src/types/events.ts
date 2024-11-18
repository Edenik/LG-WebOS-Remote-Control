export interface ButtonClickEvent extends CustomEvent {
    detail: {
        button: string;
        service?: string;
    };
}

export interface SourceSelectEvent extends CustomEvent {
    detail: {
        source: string;
    };
}

export interface SoundOutputEvent extends CustomEvent {
    detail: {
        output: string;
    };
}

export interface VolumeChangeEvent extends CustomEvent {
    detail: {
        action: 'up' | 'down';
        value?: number;
    };
}

export interface ViewChangeEvent extends CustomEvent {
    detail: {
        view: string;
    };
}

export interface ConfigChangeEvent extends CustomEvent {
    detail: {
        config: any;
    };
}

export interface ShortcutClickEvent extends CustomEvent {
    detail: {
        shortcut: {
            id: string;
            type: string;
            data?: Record<string, any>;
        };
    };
}