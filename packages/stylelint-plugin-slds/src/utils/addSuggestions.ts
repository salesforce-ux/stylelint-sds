export function addSuggestions(message: string, replacementValue?: string | string[]): string {
    let suggestions = "";
  
    if (Array.isArray(replacementValue)) {
      suggestions = replacementValue.length > 0 ? `\nSuggestions: ${replacementValue.join(", ")}` : "";
    } else if (typeof replacementValue === "string" && replacementValue.trim() !== "") {
      suggestions = `\nSuggestions: ${replacementValue}`;
    }
  
    return `${message}${suggestions}`;
}