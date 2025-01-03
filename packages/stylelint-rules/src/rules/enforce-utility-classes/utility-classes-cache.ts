type CSSClass = {
  name: string;
  settings: { property: string; value: string }[];
};

// Helper function to normalize property values (trim and lowercase)
function normalizeValue(value: string): string {
  return value.trim().replace(/['"]+/g, '').toLowerCase();
}

export default class CSSClassMatcher {
  private classMap: Map<string, string> = new Map();

  constructor(classes: CSSClass[]) {
    // Precompute the map for fast lookups
    for (const cssClass of classes) {
      const key = this.createKey(cssClass.settings);
      this.classMap.set(key, cssClass.name);
    }
  }

  // Function to create a unique key based on the settings
  private createKey(settings: { property: string; value: string }[]): string {
    return settings
      .sort((a, b) => a.property.localeCompare(b.property)) // Sort for consistent key generation
      .map(({ property, value }) => `${property}:${normalizeValue(value)}`)
      .join(';');
  }

  // Function to find a class with exact matching properties from a plain object
  public findExactMatchingClass(
    requiredSettings: Record<string, string>
  ): string | null {
    // Convert requiredSettings object to the settings format
    const settingsArray = Object.entries(requiredSettings).map(
      ([property, value]) => ({ property, value })
    );
    const key = this.createKey(settingsArray);
    return this.classMap.get(key) || null;
  }

  // New helper method to convert rule.nodes to required format
  public findMatchFromNodes(nodes: any[]): string | null {
    const settingsArray = nodes
      .filter((node) => node.prop && node.value) // Filter to ensure both prop and value are present
      .map((node) => ({
        property: node.prop,
        value: normalizeValue(node.value),
      }));

    const key = this.createKey(settingsArray);
    return this.classMap.get(key) || null;
  }
}
