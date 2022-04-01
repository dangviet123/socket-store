const axios = require('axios');

const token = `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC8xMjcuMC4wLjE6ODAwMFwvYXBpXC9lY29tbWVyY2VcL2F1dGhcL2xvZ2luIiwiaWF0IjoxNjQ4NjE1MDE0LCJleHAiOjE2NTEyNDMwMTQsIm5iZiI6MTY0ODYxNTAxNCwianRpIjoiTkFUY2NzWDB6VkhVdjRLMyIsInN1YiI6MTQwNSwicHJ2IjoiMWQwYTAyMGFjZjVjNGI2YzQ5Nzk4OWRmMWFiZjBmYmQ0ZThjOGQ2MyJ9._QcoOCASFSXmTYtQCK-7ZQW-Fl5N_cJqhMqkQcpxAFU`;
//const baseUrl = `http://127.0.0.1:8000/api/`;
const baseUrl = 'https://eoffice.merapgroup.com/eoffice/api/';
const apis = axios.create({
  baseURL: baseUrl
});

apis.interceptors.request.use(
  config => {
    config.headers["Authorization"] = `Bearer ${token}`;
    config.headers["Content-Type"] = "application/json";
    return config;
  },
  error => {
    Promise.reject(error);
  }
);

module.exports = apis;