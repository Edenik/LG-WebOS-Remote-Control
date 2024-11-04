import { ButtonAction, ButtonConfig, ButtonType } from "./types";

export interface ValidationError {
    field: string;
    message: string;
}

export function validateButtonConfig(
    config: ButtonConfig,
    type: ButtonType
): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check common required fields
    if (!config.action) {
        errors.push({
            field: 'action',
            message: 'Action is required'
        });
    }

    if (!config.name) {
        errors.push({
            field: 'name',
            message: 'Name is required'
        });
    }

    // Check icon/text requirement
    const hasIcon = Boolean(config.icon || config.img || config.svg);
    const hasText = Boolean(config.text);

    if (!hasIcon && !hasText) {
        errors.push({
            field: 'display',
            message: 'Either an icon (icon/img/svg) or text is required'
        });
    }

    // Check action-specific requirements
    if (config.action) {
        switch (config.action) {
            case ButtonAction.script:
                if (!config.script_id) {
                    errors.push({
                        field: 'script_id',
                        message: 'script_id is required for script actions'
                    });
                }
                break;

            case ButtonAction.scene:
                if (!config.scene_id) {
                    errors.push({
                        field: 'scene_id',
                        message: 'scene_id is required for scene actions'
                    });
                }
                break;

            case ButtonAction.automation:
                if (!config.automation_id) {
                    errors.push({
                        field: 'automation_id',
                        message: 'automation_id is required for automation actions'
                    });
                }
                break;

            case ButtonAction.source:
                if (!config.source) {
                    errors.push({
                        field: 'source',
                        message: 'source is required for source actions'
                    });
                }
                break;

            default:
                errors.push({
                    field: 'action',
                    message: `Invalid action type: ${config.action}`
                });
        }
    }

    return errors;
}

// Helper function to format validation errors into a readable message
export function formatValidationErrors(errors: ValidationError[]): string {
    if (errors.length === 0) {
        return 'Configuration is valid';
    }

    return `Invalid configuration, missing or invalid fields:\n${errors
        .map(error => `- ${error.message}`)
        .join('\n')}`;
}

