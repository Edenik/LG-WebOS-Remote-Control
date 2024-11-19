import { Components } from './constants/constants';
import { LgRemoteControlEditor } from './editor';
import { LgRemoteControl } from './lg-remote-control';

// Make sure the custom elements are defined
customElements.define(Components.RemoteControl, LgRemoteControl);
customElements.define(Components.RemoteControlEditor, LgRemoteControlEditor);

// Export main classes
export {
    LgRemoteControl,
    LgRemoteControlEditor
};

// Export types
export * from './types/buttons';
export * from './types/config';
export * from './types/events';
export * from './types/home-assistant';

// Export utilities
export * from './utils/logger';
export * from './utils/service-handlers';
export * from './utils/state-handlers';
export * from './utils/text-helpers';
export * from './utils/validation';

// Export constants
export * from './constants/constants';
export * from './constants/media';

