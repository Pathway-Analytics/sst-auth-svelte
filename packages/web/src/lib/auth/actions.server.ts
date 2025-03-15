// packages/web/src/lib/auth/actions.server.ts 
import { redirect } from '@sveltejs/kit';
import { subjects } from '../../../../functions/src/auth/subjects';
import { authClient as client, setTokens } from './auth.server';
import type { Cookies, RequestEvent } from '@sveltejs/kit';

export async function auth( event: RequestEvent ) {
  const cookies = event.cookies as Cookies;
  const accessToken = cookies.get('access_token');
  const refreshToken = cookies.get('refresh_token');


  if (!accessToken) {
    return false;
  }

  const clientInstance = client(event);
  const verified = await clientInstance.verify(subjects, accessToken, {
    refresh: refreshToken,
  });

  if (verified.err) {
    return false;
  }
  if (verified.tokens) {
    await setTokens(event, verified.tokens.access, verified.tokens.refresh);
  }

  return verified.subject;
}

export async function login( event: RequestEvent ): Promise<never> {
  console.log('Called login');
  const cookies = event.cookies as Cookies;
  const accessToken = cookies.get('access_token');
  const refreshToken = cookies.get('refresh_token');
  const responseType: 'code' | 'token' = (cookies.get('response_type') as 'code' | 'token') || 'code';

  if (accessToken) {
    const clientInstance = client(event);
    const verified = await clientInstance.verify(subjects, accessToken, {
      refresh: refreshToken,
    });
    if (!verified.err && verified.tokens) {
      await setTokens(event, verified.tokens.access, verified.tokens.refresh);
      throw redirect(302, '/');
    }
  }

  const authClient = client(event);
  const { protocol, host } = event.url;
  console.log('actions.server.ts protocol: ', protocol);
  console.log('actions.server.ts host: ', host);
  console.log('actions.server.ts url: ', `${protocol}//${host}/callback`);
  const { url } = await authClient.authorize(`${protocol}//${host}/callback`, responseType); // Default to GitHub for simplicity

  throw redirect(302, url);
}

export async function logout(event: RequestEvent) {
  const cookies = event.cookies as Cookies;
  // Clear the cookies
  cookies.delete('access_token',{path: '/'});
  cookies.delete('refresh_token',{path: '/'});

  throw redirect(302, '/');
}