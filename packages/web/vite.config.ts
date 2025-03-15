import { readFileSync } from 'fs';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
	console.log('mode: ', mode);

	if (mode === 'development') {
		const cert = readFileSync('./src/certs/cert.pem');
		const key  = readFileSync('./src/certs/key.pem');

		return {
			server: {
				https: {
					cert,
					key
				},
				port: 5173,
        		host: "local.pathwayanalytics.com",
			},
			plugins: [sveltekit()],
			define: {
				'process.env.VITE_FRONTEND_URL': JSON.stringify(`https://local.${process.env.VITE_DOMAIN}:5173`)
			}
		} 
	} else {
		return {
			plugins: [sveltekit()],
		}
	}
});
