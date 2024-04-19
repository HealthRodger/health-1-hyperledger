// Environment variables are often used to define these values,
// which can be set in .env files for different deployment environments.

const API_HOST = process.env.REACT_APP_API_HOST || 'localhost';
const API_PORT = process.env.REACT_APP_API_PORT || '3003';
const API_PROTOCOL = process.env.REACT_APP_API_PROTOCOL || 'http';

export default {
    apiUrl: `${API_PROTOCOL}://${API_HOST}:${API_PORT}`,
};
