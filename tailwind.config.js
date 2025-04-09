/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: {
    preflight:false,
  },
	content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
	theme: {
		extend: {},
	},
	plugins: [],
};
