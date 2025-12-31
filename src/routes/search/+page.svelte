<script lang="ts">
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import type { PageData } from './$types';

	let { data } = $props();
	
	let query = $state(data.query || '');
	let results = $state(data.results || []);
	let loading = $state(false);
	let error = $state(data.error);
	let timer: ReturnType<typeof setTimeout>;

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		const val = target.value;
		query = val;
		
		clearTimeout(timer);
		timer = setTimeout(async () => {
			if (!val.trim()) {
				results = [];
				replaceState(page.url.pathname, {});
				return;
			}
			
			loading = true;
			error = undefined;
			
			// Update URL without reload
			const url = new URL(page.url);
			url.searchParams.set('q', val);
			replaceState(url, {});

			try {
				const res = await fetch(`/api/search?q=${encodeURIComponent(val)}`);
				const json = await res.json();
				if (json.results) {
					results = json.results;
				} else if (json.error) {
					error = json.error;
				}
			} catch (e) {
				error = 'Network error';
			} finally {
				loading = false;
			}
		}, 300); // 300ms debounce
	}
</script>

<div class="p-2">
	<div class="mb-6 flex gap-2">
		<input 
			type="text" 
			value={query}
			oninput={handleInput}
			placeholder="Search articles..." 
			class="border border-black px-2 py-1 flex-1 text-sm outline-none" 
			autofocus
		/>
		<button class="bg-gray-200 border border-black px-4 py-1 text-sm hover:bg-gray-300">
			{loading ? 'Searching...' : 'Search'}
		</button>
	</div>

	{#if error}
		<div class="text-red-600 mb-4">{error}</div>
	{/if}

	<div class="space-y-4">
		{#each results as article, i}
			<div class="flex gap-2 items-start">
				<span class="hn-gray text-right w-6">{i + 1}.</span>
				<div>
					<div>
						<a href={article.link} target="_blank" class="hn-title hover:underline">{article.title}</a>
						{#if article.feed_url}
							<span class="hn-gray text-xs ml-1">({new URL(article.link).hostname})</span>
						{/if}
					</div>
					<div class="hn-gray text-xs">
						{article.author ? `by ${article.author}` : ''} 
						{article.published_at ? new Date(article.published_at).toLocaleString() : ''}
						<span>|</span>
						<a href={`/article/${article.id}`} class="hover:underline">view content</a>
						<span>|</span>
						{#if article.is_read}
							<span class="text-green-600">read</span>
						{:else}
							<span>unread</span>
						{/if}
					</div>
				</div>
			</div>
		{:else}
			{#if query && !loading}
				<div class="hn-gray text-sm">No results found for "{query}"</div>
			{/if}
		{/each}
	</div>
</div>
