<script lang="ts">
	let { form } = $props();
	let isLogin = $state(true);
</script>

<div class="p-4 max-w-sm mx-auto mt-10 border border-hn-border bg-gray-50">
	<h1 class="hn-title text-lg mb-4">{isLogin ? 'Login' : 'Sign Up'}</h1>

	{#if form?.message}
		<div class="text-red-600 text-xs mb-4">{form.message}</div>
	{/if}

	<form method="POST" action={isLogin ? '?/login' : '?/signup'} class="space-y-4">
		<div>
			<label class="block text-xs hn-gray mb-1">username</label>
			<input type="text" name="username" class="w-full border border-black px-2 py-1 text-sm outline-none" required />
		</div>
		<div>
			<label class="block text-xs hn-gray mb-1">password</label>
			<input type="password" name="password" class="w-full border border-black px-2 py-1 text-sm outline-none" required />
		</div>
		<button type="submit" class="bg-gray-200 border border-black px-4 py-1 text-sm hover:bg-gray-300 w-full">
			{isLogin ? 'Login' : 'Create Account'}
		</button>
	</form>

	<div class="my-4 flex items-center gap-2">
		<div class="h-px bg-hn-border flex-1"></div>
		<span class="text-[10px] hn-gray uppercase">or</span>
		<div class="h-px bg-hn-border flex-1"></div>
	</div>

	<form method="POST" action="?/anonymous">
		<button type="submit" class="hn-link text-xs w-full text-center hover:underline cursor-pointer">
			Try Anonymous Mode
		</button>
	</form>

	<div class="mt-4 text-center">
		<button 
			onclick={() => isLogin = !isLogin} 
			class="hn-gray text-xs hover:underline cursor-pointer"
		>
			{isLogin ? "Need an account? Sign up" : "Already have an account? Login"}
		</button>
	</div>
</div>
