import dotenv from 'dotenv';
dotenv.config();

type ENV = 'development' | 'production';
const env = process.env.NODE_ENV;
const environment: ENV = env === 'development' || env === 'production' ? env : 'production';
// if (environment === 'development') {
// 	console.log('Running in development mode');
// 	console.log(process.env)
// } else {
// 	console.log('Running in production mode');
// 	console.log(process.env)
// }
interface IEnvConfig {
	appName: string;
	version: string;
	baseUrl: string;
	documentationUrl: string;
	displayName: string;
}
type IConfig = Record<ENV, IEnvConfig>;
// Environment-specific settings
const config: IConfig = {
	development: {
		appName: 'PDF4me Dev',
		version: '1.0.4',
		baseUrl: 'https://api-dev.pdf4me.com',
		documentationUrl: 'https://dev.pdf4me.com/apiv2/documentation/',
		displayName: 'PDF4ME DEV API',
	},
	production: {
		appName: 'PDF4me',
		displayName: 'PDF4ME API',
		version: '1.4.0',
		baseUrl: 'https://api.pdf4me.com',
		documentationUrl: 'https://dev.pdf4me.com/apiv2/documentation/',
	},
};

// Export final config
export default {
	...config[environment],
	ENV: environment,
};
