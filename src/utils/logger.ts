export class Logger {
    private debugEnabled: boolean;
    private component: string;

    constructor(component: string, debugEnabled: boolean = false) {
        this.component = component;
        this.debugEnabled = debugEnabled;
    }

    public updateDebugEnabled(enable: boolean) {
        this.debugEnabled = enable;
    }

    private formatMessage(title: string): string {
        return `%c${this.component}%c${title}`;
    }

    private getStyles(): string[] {
        return [
            'color: powderblue; font-weight: bold; background: black',
            'color: royalblue; font-weight: bold; background: white'
        ];
    }

    log(title: string, ...args: any[]): void {
        if (!this.debugEnabled) return;
        console.log(this.formatMessage(title), ...this.getStyles(), ...args);
    }

    error(title: string, ...args: any[]): void {
        console.error(this.formatMessage(title), ...this.getStyles(), ...args);
    }

    warn(title: string, ...args: any[]): void {
        console.warn(this.formatMessage(title), ...this.getStyles(), ...args);
    }

    info(title: string, ...args: any[]): void {
        if (!this.debugEnabled) return;
        console.info(this.formatMessage(title), ...this.getStyles(), ...args);
    }

    debug(title: string, ...args: any[]): void {
        if (!this.debugEnabled) return;
        console.debug(this.formatMessage(title), ...this.getStyles(), ...args);
    }
}

export const createLogger = (component: string, debugEnabled: boolean = false): Logger => {
    return new Logger(component, debugEnabled);
};