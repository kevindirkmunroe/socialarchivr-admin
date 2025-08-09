const localProcessEnv =
    {   APP_ID: '387900606919443',
        WEB_DOMAIN : 'localhost',
        SERVICE_DOMAIN: 'localhost',
        VIEWER_DOMAIN: 'localhost',
        PROTOCOL: 'http',
        SERVICE_PORT: 8080};

const BUILD_ENV = process.env.REACT_APP_BUILD_ENV || localProcessEnv;

export default BUILD_ENV;


