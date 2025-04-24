import axios from 'axios';
// import { BASE_URL_BE } from '../constant/url';

const Api = axios.create({
    //set default endpoint API
    baseURL: "http://localhost:3002/",
    headers: {
        'Content-Type': 'application/json', // Pastikan Content-Type sudah benar
    }
})

export default Api