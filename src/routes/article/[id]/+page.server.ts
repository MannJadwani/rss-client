import { db } from '$lib/server/db';
import { articles, userArticles, subscriptions } from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
    if (!locals.user) throw redirect(302, '/login');

    const article = await db.query.articles.findFirst({
        where: eq(articles.id, params.id)
    });

    if (!article) throw error(404, 'Article not found');

    const [subscription, userState] = await Promise.all([
        db.query.subscriptions.findFirst({
            where: and(
                eq(subscriptions.userId, locals.user.id),
                eq(subscriptions.feedUrl, article.feedUrl)
            )
        }),
        db.query.userArticles.findFirst({
            where: and(
                eq(userArticles.articleId, article.id),
                eq(userArticles.userId, locals.user.id)
            )
        })
    ]);

    if (!subscription && !userState?.isSaved) {
        throw error(403, 'You are not subscribed to this feed');
    }

    return {
        article,
        userState
    };
};
