const prefix = "sf-sds";

export function namespace(ruleName) {
  return `${prefix}/${ruleName}`;
}