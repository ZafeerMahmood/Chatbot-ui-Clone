import { getAccessToken, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { NextApiRequest } from 'next';
import { NextResponse } from 'next/server';

 const GET=withApiAuthRequired(async function handler(req: NextApiRequest, res: any) {
  try {
    const { accessToken } = await getAccessToken(req, res, {
      scopes: ['read:folder','write:folder','update:folder']
    });
      return res.status(200).send({accessToken:accessToken});
  } catch (error: any) {
    console.error('Error fetching access Token:', error);
    return  NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
});

export default GET;