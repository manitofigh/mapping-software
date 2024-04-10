/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./views/**/*.ejs",    // Include all EJS files under the views directory
    "./public/js/**/*.js"  // Include all JavaScript files under the public/js directory
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

// /** @type {import('tailwindcss').Config} */
// export default {
//   mode: 'aot', // Ensure 'ahead-of-time' compilation mode to generate all styles
//   content: [], // Remove content paths to disable purge and include all styles
//   theme: {
//     extend: {},
//   },
//   plugins: [
//     require('@tailwindcss/forms'), // Include the forms plugin
//   ],
// }
