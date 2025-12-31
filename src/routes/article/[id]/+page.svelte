<script lang="ts">
	let { data } = $props();
	const { article, userState } = data;
</script>

<div class="p-4 max-w-3xl mx-auto">
	<div class="mb-4">
		<a href="/" class="hn-gray text-xs hover:underline">← back to list</a>
	</div>

	<h1 class="text-xl font-bold mb-2">{article.title}</h1>

	<div class="hn-gray text-xs mb-6 flex gap-2 items-center">
		<span>{article.author ? `by ${article.author}` : ""}</span>
		<span>|</span>
		<span
			>{article.publishedAt
				? new Date(article.publishedAt).toLocaleString()
				: ""}</span
		>
		<span>|</span>
		<a href={article.link} target="_blank" class="hn-link hover:underline"
			>open original</a
		>
		<span>|</span>
		<form method="POST" action="/api/toggle-read" class="inline">
			<input type="hidden" name="id" value={article.id} />
			<button type="submit" class="hover:underline cursor-pointer">
				{userState?.isRead ? "unmark" : "mark read"}
			</button>
		</form>
		<span>|</span>
		<form method="POST" action="/api/toggle-save" class="inline">
			<input type="hidden" name="id" value={article.id} />
			<button type="submit" class="hover:underline cursor-pointer">
				{userState?.isSaved ? "unsave" : "save"}
			</button>
		</form>
	</div>

	<div class="prose prose-sm max-w-none border-t border-hn-border pt-6">
		{#if article.contentHtml}
			{@html article.contentHtml}
		{:else}
			<p>{article.contentText}</p>
		{/if}
	</div>

	{#if data.user}
		<div class="mt-8 border-t border-hn-border pt-6">
			<h3 class="hn-title text-sm mb-2">Notes</h3>
			<form method="POST" action="/api/update-notes">
				<input type="hidden" name="id" value={article.id} />
				<textarea
					name="notes"
					class="w-full h-32 border border-black p-2 text-sm outline-none"
					placeholder="Add your private notes here..."
					>{userState?.notes || ""}</textarea
				>
				<button
					type="submit"
					class="mt-2 bg-gray-200 border border-black px-4 py-1 text-sm hover:bg-gray-300"
				>
					Save Notes
				</button>
			</form>
		</div>
	{/if}
</div>
