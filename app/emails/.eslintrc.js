/** 
 * ESLint configuration specifically for email templates
 * 
 * Email templates require inline styles for proper client compatibility
 * across various email clients that strip external CSS or have limited CSS support.
 */
module.exports = {
  rules: {
    // Disable inline style warnings for email templates
    '@next/next/no-inline-styles': 'off',
    '@next/next/no-img-element': 'off',
    'react/no-unknown-property': 'off',
    'tailwindcss/no-custom-classname': 'off',
    'jsx-a11y/alt-text': 'off', // Often needed for email clients
    'react/jsx-no-target-blank': 'off' // Email links sometimes need specific handling
  }
};
