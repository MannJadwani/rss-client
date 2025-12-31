<script lang="ts">
	import ArticleList from "$lib/components/ArticleList.svelte";
	let { data } = $props();
</script>

<svelte:head>
	<title>Unread Articles | RSS Client</title>
</svelte:head>

<div class="p-2">
	<h1 class="hn-title text-sm mb-4">Unread Articles</h1>
	<ArticleList articles={data.articles} />
</div>
