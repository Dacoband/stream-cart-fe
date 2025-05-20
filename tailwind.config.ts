import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
export default {
	darkMode: ["class", "dark"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
		colors: {
        primary: {
		   neon: '#CDFC7C', 
          light: '#60a5fa', 
          dark: '#3b82f6',  
        },
      
      
    }
  	}

  },
  
plugins: [tailwindcssAnimate],
} satisfies Config;
