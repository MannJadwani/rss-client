import { db } from '$lib/server/db';
import { articles, userArticles } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
    const article = await db.query.articles.findFirst({
        where: eq(articles.id, params.id)
    });

    if (!article) throw error(404, 'Article not found');

    const userState = locals.user ? await db.query.userArticles.findFirst({
        where: and(
            eq(userArticles.articleId, article.id),
            eq(userArticles.userId, locals.user.id)
        )
    }) : null;

    return {
        article,
        userState
    };
};
