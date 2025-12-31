import { searchArticles } from '$lib/server/rss';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
    const query = url.searchParams.get('q');

    if (!query) return { results: [] };
    if (!locals.user) return { results: [], error: 'Login to search' };

    try {
        const results = await searchArticles(query, locals.user.id);
        const rows = 'rows' in results ? results.rows : results;
        return {
            results: rows as any[],
            query
        };
    } catch (e) {
        console.error(e);
        return { results: [], error: 'Search failed' };
    }
};
