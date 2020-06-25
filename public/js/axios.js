import axios from 'axios';

let baseURL = 'http://localhost:4000';

if (process.env.NODE_ENV === 'production') baseURL = '/';

const API = axios.create({ baseURL });

export default API;
