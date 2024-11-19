import { HassService } from "home-assistant-js-websocket";
import { ButtonAction, ButtonConfig } from '../types/buttons';
import { LGRemoteControlConfig } from "../types/config";
import { HomeAssistantFixed } from "../types/home-assistant";

export interface ValidationError {
    field: string;
    message: string;
}

export interface ValidationContext {
    hass?: HomeAssistantFixed;
    config?: LGRemoteControlConfig;
}

function getRequiredFields(action: ButtonAction, actionId: string, context?: ValidationContext): string[] {
    if (!context?.hass) return [];
    if (action === ButtonAction.source) { return []; }

    const actionName = actionId.replace(`${action}.`, "");
    const actionConfig: HassService = context.hass.services[action][actionName];

    return Object.entries(actionConfig?.fields || {})
        .filter(([_, field]: [string, any]) => field.required)
        .map(([fieldName]) => fieldName);
}

export function validateButtonConfig(
    config: ButtonConfig,
    context?: ValidationContext
): ValidationError[] {
    const errors: ValidationError[] = [];

    // Required fields validation
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

    // Display validation
    const hasIcon = Boolean(config.icon || config.img || config.svg);
    const hasText = Boolean(config.text);

    if (!hasIcon && !hasText) {
        errors.push({
            field: 'display',
            message: 'Either an icon (icon/img/svg) or text is required'
        });
    }

    // Action-specific validation
    if (config.action) {
        validateActionSpecificConfig(config, context, errors);
    }

    return errors;
}

function validateActionSpecificConfig(
    config: ButtonConfig,
    context: ValidationContext | undefined,
    errors: ValidationError[]
) {
    switch (config.action) {
        case ButtonAction.script:
            validateScript(config, context, errors);
            break;
        case ButtonAction.scene:
            validateScene(config, context, errors);
            break;
        case ButtonAction.automation:
            validateAutomation(config, context, errors);
            break;
        case ButtonAction.source:
            validateSource(config, errors);
            break;
    }
}

function validateScript(config: ButtonConfig, context: ValidationContext | undefined, errors: ValidationError[]) {
    if (!config.script_id) {
        errors.push({
            field: 'script_id',
            message: 'Script is required'
        });
    } else {
        const requiredScriptFields = getRequiredFields(ButtonAction.script, config.script_id, context);
        validateRequiredFields(requiredScriptFields, config.data, errors, 'script');
    }
}

function validateScene(config: ButtonConfig, context: ValidationContext | undefined, errors: ValidationError[]) {
    if (!config.scene_id) {
        errors.push({
            field: 'scene_id',
            message: 'Scene is required'
        });
    } else {
        const requiredSceneFields = getRequiredFields(ButtonAction.scene, config.scene_id, context);
        validateRequiredFields(requiredSceneFields, config.data, errors, 'scene');
    }
}

function validateAutomation(config: ButtonConfig, context: ValidationContext | undefined, errors: ValidationError[]) {
    if (!config.automation_id) {
        errors.push({
            field: 'automation_id',
            message: 'Automation is required'
        });
    } else {
        const requiredAutomationFields = getRequiredFields(ButtonAction.automation, config.automation_id, context);
        validateRequiredFields(requiredAutomationFields, config.data, errors, 'automation');
    }
}

function validateSource(config: ButtonConfig, errors: ValidationError[]) {
    if (!config.source) {
        errors.push({
            field: 'source',
            message: 'Source is required'
        });
    }
}

function validateRequiredFields(
    requiredFields: string[],
    data: Record<string, any> | undefined,
    errors: ValidationError[],
    fieldType: string
) {
    requiredFields.forEach(field => {
        if (!data?.[field]) {
            errors.push({
                field: `data.${field}`,
                message: `Required ${fieldType} parameter: ${field}`
            });
        }
    });
}

export function formatValidationErrors(errors: ValidationError[]): string {
    if (errors.length === 0) {
        return 'Configuration is valid';
    }

    const groupedErrors = errors.reduce((acc, error) => {
        if (error.field.startsWith('data.')) {
            acc.parameters = acc.parameters || [];
            acc.parameters.push(error.message);
        } else {
            acc.general = acc.general || [];
            acc.general.push(error.message);
        }
        return acc;
    }, {} as { general?: string[], parameters?: string[] });

    let message = '';

    if (groupedErrors.general?.length) {
        message += `General Issues:\n${groupedErrors.general.map(msg => `• ${msg}`).join('\n')}\n`;
    }

    if (groupedErrors.parameters?.length) {
        message += `\nParameter Issues:\n${groupedErrors.parameters.map(msg => `• ${msg}`).join('\n')}`;
    }

    return message;
}