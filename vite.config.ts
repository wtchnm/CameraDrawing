import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import {defineConfig} from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
	plugins: [solid(), tailwindcss(), basicSsl()],
	build: {target: 'esnext'}
})
