import { db } from '$lib/server/db';
import { articles, userArticles, subscriptions } from '$lib/server/db/schema';
import { desc, eq, and, sql, not } from 'drizzle-orm';

export async function loadArticles(filter: string, userId?: string) {
    let baseQuery = db.select({
        id: articles.id,
        title: articles.title,
        link: articles.link,
        author: articles.author,
        publishedAt: articles.publishedAt,
        feedUrl: articles.feedUrl,
        summary: articles.summary,
        isRead: userArticles.isRead,
        isSaved: userArticles.isSaved
    })
        .from(articles)
        .leftJoin(userArticles, and(
            eq(articles.id, userArticles.articleId),
            userId ? eq(userArticles.userId, userId) : sql`FALSE`
        ));

    if (userId && filter !== 'saved') {
        baseQuery = baseQuery.innerJoin(subscriptions, and(
            eq(articles.feedUrl, subscriptions.feedUrl),
            eq(subscriptions.userId, userId)
        )) as any;
    }

    if (filter === 'unread' && userId) {
        // Either no entry in userArticles (unread) OR isRead is false
        baseQuery = baseQuery.where(
            sql`${userArticles.isRead} IS NOT TRUE`
        ) as any;
    } else if (filter === 'saved' && userId) {
        baseQuery = baseQuery.where(eq(userArticles.isSaved, true)) as any;
    }

    return await baseQuery
        .orderBy(desc(articles.publishedAt))
        .limit(50);
}
