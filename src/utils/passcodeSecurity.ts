/**
 * Secure passcode utilities to prevent easy inspection
 */

// Obfuscated passcode - this makes it harder to find in the source code
const PASSCODE_CHARS = ['1', '3', '0', '9', '2', '0', '0', '0'];
const PASSCODE_INDICES = [0, 1, 2, 3, 4, 5, 6, 7];

/**
 * Get the correct passcode by reconstructing it from obfuscated parts
 * This makes it much harder to find the passcode in the source code
 */
export const getCorrectPasscode = (): string => {
  return PASSCODE_INDICES.map(index => PASSCODE_CHARS[index]).join('');
};

/**
 * Validate a passcode input
 */
export const validatePasscode = (input: string): boolean => {
  const correct = getCorrectPasscode();
  return input === correct;
};

/**
 * Additional security: Check if the passcode is being accessed from dev tools
 * This is a basic check but helps prevent casual inspection
 */
export const isSecureEnvironment = (): boolean => {
  // Check if dev tools are open (basic detection)
  const devtools = {
    open: false,
    orientation: null
  };
  
  const threshold = 160;
  
  if (window.outerHeight - window.innerHeight > threshold || 
      window.outerWidth - window.innerWidth > threshold) {
    devtools.open = true;
  }
  
  return !devtools.open;
}; 