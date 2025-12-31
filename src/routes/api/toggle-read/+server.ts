import { db } from '$lib/server/db';
import { userArticles } from '$lib/server/db/schema';
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

    if (existing) {
        await db.update(userArticles)
            .set({
                isRead: !existing.isRead,
                readAt: !existing.isRead ? new Date() : null
            })
            .where(and(
                eq(userArticles.userId, locals.user.id),
                eq(userArticles.articleId, articleId)
            ));
    } else {
        await db.insert(userArticles).values({
            userId: locals.user.id,
            articleId,
            isRead: true,
            readAt: new Date()
        });
    }

    throw redirect(303, request.headers.get('referer') || '/');
};
