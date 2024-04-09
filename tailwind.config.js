/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./views/**/*.ejs",    // Include all EJS files under the views directory
    "./public/js/**/*.js"  // Include all JavaScript files under the public/js directory
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
