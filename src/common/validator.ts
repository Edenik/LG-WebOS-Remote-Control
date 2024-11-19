// import { HassService } from "home-assistant-js-websocket";
// import { ButtonAction, ButtonConfig, HomeAssistantFixed } from "./types";

// export interface ValidationError {
//     field: string;
//     message: string;
// }

// export interface ValidationContext {
//     hass?: HomeAssistantFixed;
// }

// function getRequiredFields(action: ButtonAction, actionId: string, context?: ValidationContext): string[] {
//     if (!context?.hass) return [];
//     if (action === ButtonAction.source) { return; }
//     const actionName = actionId.replace(`${action}.`, "");
//     const actionConfig: HassService = context.hass.services[action][actionName];

//     console.log({ actionName, actionConfig })
//     return Object.entries(actionConfig?.fields || {})
//         .filter(([_, field]: [string, any]) => field.required)
//         .map(([fieldName]) => fieldName);
// }

// export function validateButtonConfig(
//     config: ButtonConfig,
//     context?: ValidationContext
// ): ValidationError[] {
//     const errors: ValidationError[] = [];

//     // Check common required fields
//     if (!config.action) {
//         errors.push({
//             field: 'action',
//             message: 'Action is required'
//         });
//     }

//     if (!config.name) {
//         errors.push({
//             field: 'name',
//             message: 'Name is required'
//         });
//     }

//     // Check icon/text requirement
//     const hasIcon = Boolean(config.icon || config.img || config.svg);
//     const hasText = Boolean(config.text);

//     if (!hasIcon && !hasText) {
//         errors.push({
//             field: 'display',
//             message: 'Either an icon (icon/img/svg) or text is required'
//         });
//     }

//     const updateMissingFields = (requiredMissingFields: string[]) => {
//         requiredMissingFields.forEach(field => {
//             if (!config.data?.[field]) {
//                 errors.push({
//                     field: `data.${field}`,
//                     message: `Required automation parameter: ${field}`
//                 });
//             }
//         });
//     }

//     // Check action-specific requirements
//     if (config.action) {
//         switch (config.action) {
//             case ButtonAction.script:
//                 if (!config.script_id) {
//                     errors.push({
//                         field: 'script_id',
//                         message: 'Script is required'
//                     });
//                 } else {
//                     // Check required script parameters
//                     const requiredScriptFields = getRequiredFields(ButtonAction.script, config.script_id, context);
//                     console.log({ requiredScriptFields });
//                     updateMissingFields(requiredScriptFields);
//                 }
//                 break;

//             case ButtonAction.scene:
//                 if (!config.scene_id) {
//                     errors.push({
//                         field: 'scene_id',
//                         message: 'Scene is required'
//                     });
//                 } else {
//                     // Check required scene parameters
//                     const requiredSceneFields = getRequiredFields(ButtonAction.scene, config.scene_id, context);
//                     console.log({ requiredSceneFields });
//                     updateMissingFields(requiredSceneFields);
//                 }
//                 break;

//             case ButtonAction.automation:
//                 if (!config.automation_id) {
//                     errors.push({
//                         field: 'automation_id',
//                         message: 'Automation is required'
//                     });
//                 } else {
//                     // Check required automation parameters
//                     const requiredAutomationFields = getRequiredFields(ButtonAction.automation, config.automation_id, context);
//                     console.log({ requiredAutomationFields });
//                     updateMissingFields(requiredAutomationFields);
//                 }
//                 break;

//             case ButtonAction.source:
//                 if (!config.source) {
//                     errors.push({
//                         field: 'source',
//                         message: 'Source is required'
//                     });
//                 }
//                 break;

//             default:
//                 errors.push({
//                     field: 'action',
//                     message: `Invalid action type: ${config.action}`
//                 });
//         }
//     }

//     return errors;
// }

// // Format validation errors into human-readable messages
// export function formatValidationErrors(errors: ValidationError[]): string {
//     if (errors.length === 0) {
//         return 'Configuration is valid';
//     }

//     // Group errors by field type
//     const groupedErrors = errors.reduce((acc, error) => {
//         if (error.field.startsWith('data.')) {
//             acc.parameters = acc.parameters || [];
//             acc.parameters.push(error.message);
//         } else {
//             acc.general = acc.general || [];
//             acc.general.push(error.message);
//         }
//         return acc;
//     }, {} as { general?: string[], parameters?: string[] });

//     let message = '';

//     if (groupedErrors.general?.length) {
//         message += `General Issues:\n${groupedErrors.general.map(msg => `• ${msg}`).join('\n')}\n`;
//     }

//     if (groupedErrors.parameters?.length) {
//         message += `\nParameter Issues:\n${groupedErrors.parameters.map(msg => `• ${msg}`).join('\n')}`;
//     }

//     return message;
// }