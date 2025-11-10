// Using `uuid` library now for database-safe IDs. 
// generateId can be used for non-persistent client-side IDs if needed.
export const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);
