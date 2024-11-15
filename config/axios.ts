import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://cloudbases.in/forest_patrolling/PatrollingAppTestApi',
  timeout: 1 * 60 * 1000 /* 1 minute */,
  timeoutErrorMessage: 'Request timeout',
});
