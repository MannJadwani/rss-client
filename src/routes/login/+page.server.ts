import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import * as auth from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { hash, verify } from '@node-rs/argon2';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    if (locals.user) throw redirect(302, '/');
    return {};
};

export const actions: Actions = {
    login: async (event) => {
        const formData = await event.request.formData();
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;

        if (!username || !password) return fail(400, { message: 'Required fields missing' });

        const existingUser = await db.query.user.findFirst({
            where: eq(user.username, username)
        });

        if (!existingUser) return fail(400, { message: 'Invalid username or password' });

        const validPassword = await verify(existingUser.passwordHash, password);
        if (!validPassword) return fail(400, { message: 'Invalid username or password' });

        const token = auth.generateSessionToken();
        const session = await auth.createSession(token, existingUser.id);
        auth.setSessionTokenCookie(event, token, session.expiresAt);

        throw redirect(302, '/');
    },
    signup: async (event) => {
        const formData = await event.request.formData();
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;

        if (!username || !password) return fail(400, { message: 'Required fields missing' });

        const userId = crypto.randomUUID();
        const passwordHash = await hash(password);

        try {
            await db.insert(user).values({
                id: userId,
                username,
                passwordHash
            });

            const token = auth.generateSessionToken();
            const session = await auth.createSession(token, userId);
            auth.setSessionTokenCookie(event, token, session.expiresAt);
        } catch (e) {
            return fail(400, { message: 'Username already taken' });
        }

        throw redirect(302, '/');
    },
    anonymous: async (event) => {
        const userId = `anon_${crypto.randomUUID()}`;
        const username = `anon_${userId.slice(0, 8)}`;

        await db.insert(user).values({
            id: userId,
            username,
            passwordHash: 'anonymous'
        });

        const token = auth.generateSessionToken();
        const session = await auth.createSession(token, userId);
        auth.setSessionTokenCookie(event, token, session.expiresAt);

        throw redirect(302, '/');
    }
};
