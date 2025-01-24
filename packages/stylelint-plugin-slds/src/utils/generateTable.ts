export default // Helper function to format suggestions as a well-aligned table
function generateTable(suggestions: any[]): string {
  // Start the message with a header
  let message = '\n';

  // Loop through suggestions and append each class and confidence as a list item
  suggestions.forEach((suggestion, index) => {
    //const confidence = (Math.random() * (100 - 70) + 70).toFixed(2); // Random confidence between 70-100%
    //message += `${index + 1}. ${suggestion.name} (${confidence}%)\n`;
    message += `${index + 1}. ${suggestion.name} \n`;
  });

  return message;
}
