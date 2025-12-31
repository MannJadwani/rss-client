import { searchArticles } from '$lib/server/rss';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
    if (!locals.user) {
        return json({ results: [], error: 'Unauthorized' }, { status: 401 });
    }

    const query = url.searchParams.get('q');
    if (!query) {
        return json({ results: [] });
    }

    try {
        const results = await searchArticles(query, locals.user.id);
        const rows = 'rows' in results ? results.rows : results;
        return json({ results: rows as any[] });
    } catch (e) {
        console.error(e);
        return json({ results: [], error: 'Search failed' }, { status: 500 });
    }
};
