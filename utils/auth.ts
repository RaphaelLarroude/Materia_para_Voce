export const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

/**
 * A simple, non-secure hash function for demonstration purposes.
 * DO NOT use this in a real application.
 */
export const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString();
};
