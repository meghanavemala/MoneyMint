/*
Script to help fix Tailwind CSS classname warnings.
This provides common replacements for deprecated or non-optimal classnames.
*/

const commonReplacements = {
  // Size shorthand replacements
  'h-8 w-8': 'size-8',
  'h-4 w-4': 'size-4',
  'h-5 w-5': 'size-5',
  'h-12 w-12': 'size-12',
  'h-3 w-3': 'size-3',
  
  // Position shorthand replacements
  'left-0 right-0': 'inset-x-0',
  
  // Deprecated classnames
  'flex-shrink-0': 'shrink-0',
  'transform': '', // Remove transform as it's not needed in Tailwind v3
  
  // Common classname order issues (these need manual fixing)
  // The warnings show specific files and lines that need attention
};

console.log('Common Tailwind CSS replacements:');
console.log(JSON.stringify(commonReplacements, null, 2));

console.log('\nTo fix the warnings:');
console.log('1. Replace size combinations with shorthand (e.g., "h-8 w-8" -> "size-8")');
console.log('2. Remove "transform" class as it\'s not needed in Tailwind v3');
console.log('3. Update "flex-shrink-0" to "shrink-0"');
console.log('4. Use "inset-x-0" instead of "left-0 right-0"');
console.log('5. For classname order warnings, manually reorder classes according to Tailwind\'s recommended order'); 