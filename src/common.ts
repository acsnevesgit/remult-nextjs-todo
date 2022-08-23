import axios from "axios";
import { Remult } from "remult";
import jwtDecode from 'jwt-decode';

// Global Remult object to communicate with the API server via a Promise-based HTTP client (in this case - Axios)
export const remult = new Remult(axios);

const AUTH_TOKEN_KEY = "authToken";

export function setAuthToken(token: string | null) {
  if (token) {
    remult.setUser(jwtDecode(token));
    sessionStorage.setItem(AUTH_TOKEN_KEY, token);
  }
  else {
    remult.setUser(undefined!);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
  }
};

// Initialize the auth token from session storage when the application loads
// Function to load the auth info from the storage
export function loadAuth() {
  setAuthToken(sessionStorage.getItem(AUTH_TOKEN_KEY)); // sends the decoded user information to Remult and store the token in local sessionStorage
};

// An interceptor is used to add the authorization token header to all API requests.
axios.interceptors.request.use(config => {
  const token = sessionStorage.getItem(AUTH_TOKEN_KEY);
  if (token)
    config.headers!["Authorization"] = "Bearer " + token;
  return config;
});
