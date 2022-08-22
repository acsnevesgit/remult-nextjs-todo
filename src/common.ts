import axios from "axios";
import { Remult } from "remult";

// Global Remult object to communicate with the API server via a Promise-based HTTP client (in this case - Axios)
export const remult = new Remult(axios); 
