import { loadArticles } from '$lib/server/articles';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) throw redirect(302, '/login');
    const articles = await loadArticles('unread', locals.user.id);
    return {
        articles,
        filter: 'unread'
    };
};
