import { subjects } from '../../../functions/src/auth/subjects';

export async function load(event) {
  return {
    subject: event.locals.session as unknown as typeof subjects.user,
  };
}