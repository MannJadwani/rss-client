<script lang="ts">
	import ArticleList from '$lib/components/ArticleList.svelte';
	let { data } = $props();
</script>

<div class="p-2">
	<ArticleList articles={data.articles} />
</div>
