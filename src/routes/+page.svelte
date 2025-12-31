<script lang="ts">
	import ArticleList from "$lib/components/ArticleList.svelte";
	let { data } = $props();
</script>

<svelte:head>
	<title>Top Stories | RSS Client</title>
</svelte:head>

<div class="p-2">
	<ArticleList articles={data.articles} />
</div>
