import { loadArticles } from '$lib/server/articles';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    const articles = await loadArticles('', locals.user?.id);
    return {
        articles,
        filter: ''
    };
};
