<script lang="ts">
	let { articles } = $props();
</script>

<div class="border-t-2 border-[#b91c1c] mt-2">
	{#each articles as article, i}
		<div class="jp-article-item group">
			<!-- Date / Time Column -->
			<div
				class="w-[80px] shrink-0 text-[11px] text-[#666] pt-0.5 font-mono"
			>
				{new Date(article.publishedAt || Date.now()).toLocaleDateString(
					undefined,
					{ month: "2-digit", day: "2-digit" },
				)}
				<div class="text-[10px] text-[#999]">
					{new Date(
						article.publishedAt || Date.now(),
					).toLocaleTimeString(undefined, {
						hour: "2-digit",
						minute: "2-digit",
					})}
				</div>
			</div>

			<!-- Main Content Column -->
			<div class="flex-1 min-w-0">
				<div class="mb-1 leading-snug">
					<a
						href={article.link || "#"}
						target="_blank"
						class="text-[15px] font-bold text-[#1a0dab] hover:text-[#b91c1c] hover:underline decoration-1 underline-offset-2"
					>
						{#if article.isRead}
							<span class="text-[#888] font-normal">[Read]</span>
						{/if}
						{article.title}
					</a>
					{#if article.link}
						<span class="text-[10px] text-[#666] ml-1">
							[{new URL(article.link).hostname.replace(
								/^www\./,
								"",
							)}]
						</span>
					{/if}
				</div>

				{#if article.summary}
					<div
						class="text-[12px] text-[#444] leading-relaxed mb-1.5 line-clamp-2"
					>
						{article.summary
							.replace(/<[^>]*>/g, "")
							.slice(0, 180)}...
					</div>
				{/if}

				<div class="flex items-center gap-3 text-[11px] text-[#666]">
					{#if article.author}
						<span class="bg-[#eee] px-1 rounded-sm"
							>{article.author}</span
						>
					{/if}

					<div class="flex gap-2 ml-auto">
						<a
							href={`/article/${article.id}`}
							class="text-[#0056b3] hover:underline">[Detail]</a
						>

						<form
							method="POST"
							action="/api/toggle-read"
							class="inline"
						>
							<input type="hidden" name="id" value={article.id} />
							<button
								type="submit"
								class="text-[#0056b3] hover:underline cursor-pointer"
							>
								[{article.isRead ? "Unmark" : "Mark Read"}]
							</button>
						</form>

						<form
							method="POST"
							action="/api/toggle-save"
							class="inline"
						>
							<input type="hidden" name="id" value={article.id} />
							<button
								type="submit"
								class="text-[#0056b3] hover:underline cursor-pointer"
							>
								[{article.isSaved ? "Unsave" : "Save"}]
							</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<div
			class="p-8 text-center text-gray-500 text-sm bg-gray-50 border border-[#e2e2e2] m-4"
		>
			No articles found.
		</div>
	{/each}
</div>
