<script lang="ts">
	let { data, form } = $props();
</script>

<svelte:head>
	<title>Manage Feeds | RSS Client</title>
</svelte:head>

<div class="p-2">
	<h1 class="hn-title text-lg mb-4">Manage Feeds</h1>

	<form method="POST" action="?/addFeed" class="mb-6 flex gap-2">
		<input
			type="url"
			name="feedUrl"
			placeholder="RSS Feed URL"
			class="border border-black px-2 py-1 flex-1 text-sm outline-none"
			required
		/>
		<button
			type="submit"
			class="bg-gray-200 border border-black px-4 py-1 text-sm hover:bg-gray-300"
		>
			Add Feed
		</button>
	</form>

	<div class="mb-4">
		<form method="POST" action="?/refreshAll">
			<button
				type="submit"
				class="hn-link text-xs underline cursor-pointer"
				>refresh all</button
			>
		</form>
	</div>

	<table class="w-full text-sm border-collapse">
		<thead>
			<tr
				class="hn-gray text-left text-xs uppercase border-b border-hn-border"
			>
				<th class="py-1">Feed</th>
				<th class="py-1">Status</th>
				<th class="py-1 text-right">Actions</th>
			</tr>
		</thead>
		<tbody>
			{#each data.subscriptions as sub}
				<tr class="border-b border-hn-border">
					<td class="py-2">
						<div class="font-bold">{sub.title}</div>
						<div class="hn-gray text-xs truncate max-w-md">
							{sub.feedUrl}
						</div>
					</td>
					<td class="py-2 text-xs">
						{#if sub.lastFetchError}
							<span class="text-red-600"
								>Error: {sub.lastFetchError}</span
							>
						{:else}
							<span class="hn-gray"
								>Last fetched: {sub.lastFetchedAt?.toLocaleTimeString() ||
									"Never"}</span
							>
						{/if}
					</td>
					<td class="py-2 text-right">
						<form
							method="POST"
							action="?/removeFeed"
							class="inline"
						>
							<input type="hidden" name="id" value={sub.id} />
							<button
								type="submit"
								class="hn-gray hover:text-black hover:underline cursor-pointer"
								>remove</button
							>
						</form>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
