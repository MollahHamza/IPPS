// Netlify Function serving every /api/* route. All logic lives in server/app.mjs.
import { handle } from '../../server/app.mjs';

export default (request) => handle(request);

export const config = {
  path: '/api/*',
};
