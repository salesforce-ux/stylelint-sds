
/* Usage: 
// Example usage
const templateString = "Hello, my name is ${name}. I am ${age} years old and I live in ${city}.";
const args = {
    name: "John",
    age: "30",
    city: "New York"
};

const result = replacePlaceholders(templateString, args);
*/
export default function replacePlaceholders(template: string, args: { [key: string]: string }): string {
    return template.replace(/\${(.*?)}/g, (_, key) => {
        return args[key.trim()] || ''; // Replace with the value or an empty string if not found
    });
}

