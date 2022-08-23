// This file is a "catch all" Next.js API route which will be used to handle all API requests
import { NextApiRequest, NextApiResponse } from 'next';
import { api } from '../../src/server/api';
import * as util from 'util';
import { expressjwt } from 'express-jwt';

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  // This middleware verifies that the authentication token is valid, and extracts the user info from it to be used on the server
  await util.promisify(expressjwt({
    secret: process.env['JWT_SECRET'] || "my secret",
    credentialsRequired: false, // to allow unauthenticated API requests to reach Remult
    algorithms: ['HS256']
  }) as any)(_req, res);
  await api.handle(_req, res);;
};

export default handler;