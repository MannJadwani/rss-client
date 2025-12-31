<script lang="ts">
	import ArticleList from "$lib/components/ArticleList.svelte";
	let { data } = $props();
</script>

<svelte:head>
	<title>Saved Articles | RSS Client</title>
</svelte:head>

<div class="p-2">
	<h1 class="hn-title text-sm mb-4">Saved Articles</h1>
	<ArticleList articles={data.articles} />
</div>
