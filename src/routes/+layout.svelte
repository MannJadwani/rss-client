<script lang="ts">
	import "./layout.css";
	import favicon from "$lib/assets/favicon.png";
	import { page } from "$app/state";

	let { children, data } = $props();
	const user = $derived(data.user);
</script>

<svelte:head>
	<title>RSS Client</title>
	<link rel="icon" href={favicon} type="image/png" />
</svelte:head>

<div class="hn-container">
	<!-- Top Bar -->
	<header
		class="hn-header flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4 md:gap-0"
	>
		<div
			class="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 w-full md:w-auto"
		>
			<a href="/" class="text-xl font-bold tracking-tight text-[#b91c1c]"
				>RSS Client</a
			>
			<!-- Classic Tab Navigation -->
			<nav
				class="flex gap-1 text-sm overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide"
			>
				<a
					href="/unread"
					class="px-3 py-1 whitespace-nowrap hover:bg-gray-100 {page
						.url.pathname === '/unread'
						? 'bg-[#b91c1c] text-white hover:bg-[#b91c1c]'
						: 'text-gray-700'}">Unread</a
				>
				<a
					href="/saved"
					class="px-3 py-1 whitespace-nowrap hover:bg-gray-100 {page
						.url.pathname === '/saved'
						? 'bg-[#b91c1c] text-white hover:bg-[#b91c1c]'
						: 'text-gray-700'}">Saved</a
				>
				<a
					href="/search"
					class="px-3 py-1 whitespace-nowrap hover:bg-gray-100 {page
						.url.pathname === '/search'
						? 'bg-[#b91c1c] text-white hover:bg-[#b91c1c]'
						: 'text-gray-700'}">Search</a
				>
				{#if user}
					<a
						href="/feeds"
						class="px-3 py-1 whitespace-nowrap hover:bg-gray-100 {page
							.url.pathname === '/feeds'
							? 'bg-[#b91c1c] text-white hover:bg-[#b91c1c]'
							: 'text-gray-700'}">Feeds</a
					>
				{/if}
			</nav>
		</div>
		<div class="text-xs absolute top-4 right-4 md:static">
			{#if user}
				<span class="mr-2 hidden md:inline">{user.username}</span>
				<form method="POST" action="/logout" class="inline">
					<button type="submit" class="jp-btn">Logout</button>
				</form>
			{:else}
				<a href="/login" class="jp-btn decoration-none">Login</a>
			{/if}
		</div>
	</header>

	<!-- Main Grid Layout -->
	<div class="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
		<!-- Sidebar (Classic Left Nav) -->
		<aside class="hidden md:block">
			<div class="bg-[#f9f9f9] border border-[#e2e2e2] p-3 mb-4">
				<h3 class="font-bold text-xs mb-2 border-b border-[#ccc] pb-1">
					MENU
				</h3>
				<ul class="text-sm space-y-1">
					<li><a href="/" class="block hover:underline">Top</a></li>
					<li>
						<a href="/unread" class="block hover:underline"
							>Unread Articles</a
						>
					</li>
					<li>
						<a href="/saved" class="block hover:underline"
							>Saved / Favorites</a
						>
					</li>
					<li>
						<a href="/search" class="block hover:underline"
							>Search</a
						>
					</li>
				</ul>
			</div>

			<div class="bg-[#f9f9f9] border border-[#e2e2e2] p-3">
				<h3 class="font-bold text-xs mb-2 border-b border-[#ccc] pb-1">
					INFORMATION
				</h3>
				<div class="text-xs text-gray-500">
					<p class="mb-1">Version 1.0.0</p>
					<p>Updated: {new Date().toLocaleDateString()}</p>
				</div>
			</div>
		</aside>

		<!-- Main Content Area -->
		<main>
			{@render children()}
		</main>
	</div>

	<footer
		class="mt-12 border-t border-[#e2e2e2] pt-4 text-center text-xs text-gray-500"
	>
		<div class="flex justify-center gap-4 mb-2">
			<a href="/about" class="hover:underline">Terms of Service</a>
			<a href="/privacy" class="hover:underline">Privacy Policy</a>
			<a href="/support" class="hover:underline">Inquiry</a>
		</div>
		<p>&copy; 2024 RSS Client. All rights reserved.</p>
	</footer>
</div>
