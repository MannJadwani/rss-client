import { db } from '$lib/server/db';
import { subscriptions } from '$lib/server/db/schema';
import { syncFeed } from '$lib/server/rss';
import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) throw redirect(302, '/login');

    const userSubs = await db.query.subscriptions.findMany({
        where: eq(subscriptions.userId, locals.user.id)
    });

    return {
        subscriptions: userSubs
    };
};

export const actions: Actions = {
    addFeed: async ({ request, locals }) => {
        if (!locals.user) throw error(401);

        const formData = await request.formData();
        const feedUrl = formData.get('feedUrl') as string;

        if (!feedUrl) return { success: false, error: 'URL is required' };

        const id = crypto.randomUUID();
        await db.insert(subscriptions).values({
            id,
            userId: locals.user.id,
            feedUrl,
            title: 'Fetching...',
        });

        try {
            await syncFeed(id);
        } catch (e: any) {
            console.error(e);
        }

        return { success: true };
    },
    refreshAll: async ({ locals }) => {
        if (!locals.user) throw error(401);

        const userSubs = await db.query.subscriptions.findMany({
            where: eq(subscriptions.userId, locals.user.id)
        });

        for (const sub of userSubs) {
            try {
                await syncFeed(sub.id);
            } catch (e) {
                console.error(e);
            }
        }

        return { success: true };
    },
    removeFeed: async ({ request, locals }) => {
        if (!locals.user) throw error(401);
        const formData = await request.formData();
        const id = formData.get('id') as string;
        await db.delete(subscriptions).where(eq(subscriptions.id, id));
        return { success: true };
    }
};
