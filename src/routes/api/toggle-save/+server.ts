import { db } from '$lib/server/db';
import { userArticles, articles, subscriptions } from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, eq, sql } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) throw error(401);

    const formData = await request.formData();
    const articleId = formData.get('id') as string;

    if (!articleId) throw error(400);

    const existing = await db.query.userArticles.findFirst({
        where: and(
            eq(userArticles.userId, locals.user.id),
            eq(userArticles.articleId, articleId)
        )
    });

    // If we are enabling save (new insert or update to true), check subscription
    if (!existing || !existing.isSaved) {
        const article = await db.query.articles.findFirst({
            where: eq(articles.id, articleId)
        });
        if (!article) throw error(404, 'Article not found');

        const sub = await db.query.subscriptions.findFirst({
            where: and(
                eq(subscriptions.userId, locals.user.id),
                eq(subscriptions.feedUrl, article.feedUrl)
            )
        });

        if (!sub) throw error(403, 'Must be subscribed to feed to save article');
    }

    if (existing) {
        await db.update(userArticles)
            .set({
                isSaved: !existing.isSaved,
                savedAt: !existing.isSaved ? new Date() : null
            })
            .where(and(
                eq(userArticles.userId, locals.user.id),
                eq(userArticles.articleId, articleId)
            ));
    } else {
        await db.insert(userArticles).values({
            userId: locals.user.id,
            articleId,
            isSaved: true,
            savedAt: new Date()
        });
    }

    throw redirect(303, request.headers.get('referer') || '/');
};
