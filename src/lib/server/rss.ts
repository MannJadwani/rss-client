import Parser from 'rss-parser';
import { db } from './db';
import { articles, subscriptions } from './db/schema';
import { eq, sql } from 'drizzle-orm';

const parser = new Parser();

export async function fetchFeed(feedUrl: string) {
    try {
        const feed = await parser.parseURL(feedUrl);
        return feed;
    } catch (error) {
        console.error(`Error fetching feed ${feedUrl}:`, error);
        throw error;
    }
}

export async function syncFeed(subscriptionId: string) {
    const sub = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.id, subscriptionId)
    });

    if (!sub) throw new Error('Subscription not found');

    try {
        const feed = await fetchFeed(sub.feedUrl);

        // Update subscription metadata if needed
        await db.update(subscriptions)
            .set({
                title: feed.title || sub.title,
                description: feed.description || sub.description,
                lastFetchedAt: new Date(),
                lastFetchError: null
            })
            .where(eq(subscriptions.id, subscriptionId));

        // Process articles
        for (const item of feed.items) {
            const guid = item.id || item.guid || item.link || item.title;
            if (!guid) continue;

            // Simple hash or ID for dedup
            const articleId = `${Buffer.from(guid).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}`;

            const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date();
            const contentText = (item.contentSnippet || item.content || item.title || '').substring(0, 10000);

            await db.insert(articles)
                .values({
                    id: articleId,
                    feedUrl: sub.feedUrl,
                    guid: item.guid,
                    title: item.title || 'No Title',
                    link: item.link || '',
                    author: item.creator || item.author,
                    publishedAt,
                    summary: item.contentSnippet,
                    contentHtml: item.content,
                    contentText: contentText,
                    // We'll update the search vector using a raw SQL update or a trigger
                })
                .onConflictDoUpdate({
                    target: articles.id,
                    set: {
                        title: item.title || 'No Title',
                        summary: item.contentSnippet,
                        contentHtml: item.content,
                        contentText: contentText,
                    }
                });

            // Update search vector
            await db.execute(sql`
				UPDATE articles 
				SET search_vector = to_tsvector('english', title || ' ' || COALESCE(content_text, ''))
				WHERE id = ${articleId}
			`);
        }

        return { success: true, count: feed.items.length };
    } catch (error: any) {
        await db.update(subscriptions)
            .set({
                lastFetchError: error.message || 'Unknown error'
            })
            .where(eq(subscriptions.id, subscriptionId));
        throw error;
    }
}

export async function searchArticles(query: string, userId: string) {
    if (!query) return { rows: [] };

    // Sanitization: Remove characters that break tsquery (except spaces)
    const sanitized = query.replace(/[&|!():<>\\]/g, ' ').trim();
    if (!sanitized) return { rows: [] };

    // Construct prefix query: "foo bar" -> "foo:* & bar:*"
    const terms = sanitized.split(/\s+/).filter(Boolean);
    const prefixQuery = terms.map(t => `${t}:*`).join(' & ');

    try {
        // Try the prefix query first
        return await db.execute(sql`
            SELECT a.*, ua.is_read, ua.is_saved
            FROM articles a
            LEFT JOIN user_articles ua ON a.id = ua.article_id AND ua.user_id = ${userId}
            WHERE a.search_vector @@ to_tsquery('english', ${prefixQuery})
            ORDER BY ts_rank(a.search_vector, to_tsquery('english', ${prefixQuery})) DESC
            LIMIT 50
        `);
    } catch (e) {
        // Fallback to simpler plainto_tsquery if prefix construction fails for some reason
        console.warn("Prefix search failed, falling back to plain search:", e);
        return await db.execute(sql`
            SELECT a.*, ua.is_read, ua.is_saved
            FROM articles a
            LEFT JOIN user_articles ua ON a.id = ua.article_id AND ua.user_id = ${userId}
            WHERE a.search_vector @@ plainto_tsquery('english', ${sanitized})
            ORDER BY ts_rank(a.search_vector, plainto_tsquery('english', ${sanitized})) DESC
            LIMIT 50
        `);
    }
}
