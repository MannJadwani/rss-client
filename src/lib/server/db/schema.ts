import { pgTable, text, timestamp, boolean, primaryKey, index, customType } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull()
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export const subscriptions = pgTable('subscriptions', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id),
	feedUrl: text('feed_url').notNull(),
	title: text('title').notNull(),
	description: text('description'),
	siteUrl: text('site_url'),
	etag: text('etag'),
	lastModified: text('last_modified'),
	lastFetchedAt: timestamp('last_fetched_at', { withTimezone: true, mode: 'date' }),
	lastFetchError: text('last_fetch_error'),
}, (table) => [
	index('sub_user_idx').on(table.userId),
]);

const tsvector = customType<{ data: string }>({
	dataType() {
		return 'tsvector';
	},
});

export const articles = pgTable('articles', {
	id: text('id').primaryKey(), // Using dedupKey as ID
	feedUrl: text('feed_url').notNull(),
	guid: text('guid'),
	title: text('title').notNull(),
	link: text('link').notNull(),
	author: text('author'),
	publishedAt: timestamp('published_at', { withTimezone: true, mode: 'date' }),
	summary: text('summary'),
	contentHtml: text('content_html'),
	contentText: text('content_text'),
	searchVector: tsvector('search_vector'),
}, (table) => [
	index('article_feed_published_idx').on(table.feedUrl, table.publishedAt),
	index('article_search_idx').using('gin', table.searchVector),
]);

export const userArticles = pgTable('user_articles', {
	userId: text('user_id').notNull().references(() => user.id),
	articleId: text('article_id').notNull().references(() => articles.id),
	isRead: boolean('is_read').notNull().default(false),
	isSaved: boolean('is_saved').notNull().default(false),
	notes: text('notes'),
	readAt: timestamp('read_at', { withTimezone: true, mode: 'date' }),
	savedAt: timestamp('saved_at', { withTimezone: true, mode: 'date' }),
}, (table) => [
	primaryKey({ columns: [table.userId, table.articleId] }),
	index('ua_user_read_idx').on(table.userId, table.isRead),
	index('ua_user_saved_idx').on(table.userId, table.isSaved),
]);

export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Article = typeof articles.$inferSelect;
export type UserArticle = typeof userArticles.$inferSelect;
