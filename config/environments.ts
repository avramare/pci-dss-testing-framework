export type Environment = 'local' | 'staging' | 'production';

interface EnvironmentConfig {
    baseUrl: string;
    uiBaseUrl: string;
    apiTimeout: number;
    uiTimeout: number;
    secureMode: boolean;
}

const environments: Record<Environment, EnvironmentConfig> = {
    local: {
        baseUrl: 'http://localhost:3000/api',
        uiBaseUrl: 'http://localhost:3000',
        apiTimeout: 10000,
        uiTimeout: 15000,
        secureMode: process.env.SECURE_MODE === 'true'
    },
    staging: {
        baseUrl: process.env.STAGING_API_URL || 'https://staging.yourapp.com/api',
        uiBaseUrl: process.env.STAGING_UI_URL || 'https://staging.yourapp.com',
        apiTimeout: 15000,
        uiTimeout: 20000,
        secureMode: true
    },
    production: {
        baseUrl: process.env.PROD_API_URL || 'https://api.yourapp.com/api',
        uiBaseUrl: process.env.PROD_UI_URL || 'https://yourapp.com',
        apiTimeout: 20000,
        uiTimeout: 25000,
        secureMode: true
    }
};

const currentEnv = (process.env.TEST_ENV as Environment) || 'local';

export const config = environments[currentEnv];
export const ENV = currentEnv;