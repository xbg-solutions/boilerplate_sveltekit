<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Feature {
		icon: string;
		title: string;
		description: string;
	}

	interface Props {
		class?: string;
		eyebrow?: string;
		title?: string;
		subtitle?: string;
		features?: Feature[];
		codeSnippet?: string;
	}

	const defaultFeatures: Feature[] = [
		{
			icon: 'lightning',
			title: 'Blazing Fast',
			description: 'Optimized for maximum performance and minimal latency.',
		},
		{
			icon: 'lock',
			title: 'Secure Code',
			description: 'Built with security best practices and standards.',
		},
		{
			icon: 'code',
			title: 'Clean Syntax',
			description: 'Easy to read and maintain codebase.',
		},
	];

	const defaultCode = `const response = await api.fetch('/data');
const data = response.json();
console.log(data);`;

	let {
		class: className,
		eyebrow = 'Developer Experience',
		title = 'Built for Developers',
		subtitle = 'Modern API with clean, intuitive design',
		features = defaultFeatures,
		codeSnippet = defaultCode,
	}: Props = $props();

	const iconPaths: Record<string, string> = {
		lightning: 'm13 2-2 6.5h5l-7 13.5 2-6.5H6l7-13.5z',
		lock: 'M3 11h18v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V11zM7 11V7a5 5 0 0 1 10 0v4',
		code: 'M16 18 22 12 16 6M8 6 2 12 8 18',
	};
</script>

<section class={cn('w-full bg-gray-950 py-16 px-4 sm:px-6 lg:px-8', className)}>
	<div class="mx-auto max-w-6xl">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
			<!-- Left Column: Features -->
			<div>
				<p class="text-sm uppercase tracking-widest text-blue-400 font-semibold">{eyebrow}</p>
				<h2 class="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-white">
					{title}
				</h2>
				<p class="mt-3 text-lg text-gray-400 mb-8">
					{subtitle}
				</p>

				<div class="space-y-6">
					{#each features as feature}
						<div class="flex gap-4">
							<div class="flex-shrink-0">
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-400">
									{#if iconPaths[feature.icon]}
										<path d={iconPaths[feature.icon]} />
									{:else}
										<circle cx="12" cy="12" r="3" />
									{/if}
								</svg>
							</div>
							<div>
								<h3 class="text-lg font-semibold text-white">{feature.title}</h3>
								<p class="mt-1 text-gray-400 text-sm">{feature.description}</p>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Right Column: Code Block -->
			<div>
				<div class="bg-gray-900 border border-gray-800 rounded-lg p-6 font-mono text-sm">
					<div class="flex items-center justify-between mb-4 pb-4 border-b border-gray-800">
						<span class="text-gray-400 text-xs uppercase tracking-widest">JavaScript</span>
						<div class="flex gap-2">
							<div class="w-3 h-3 rounded-full bg-gray-700"></div>
							<div class="w-3 h-3 rounded-full bg-gray-700"></div>
							<div class="w-3 h-3 rounded-full bg-gray-700"></div>
						</div>
					</div>
					<pre class="text-gray-300 whitespace-pre-wrap">{@html codeSnippet.split('\n').map((line) => {
let htmlLine = line
	.replace(/\bconst\b/g, '<span class="text-purple-400">const</span>')
	.replace(/\bawait\b/g, '<span class="text-purple-400">await</span>')
	.replace(/\bapi\b/g, '<span class="text-blue-400">api</span>')
	.replace(/\bresponse\b/g, '<span class="text-blue-400">response</span>')
	.replace(/\bjson\b/g, '<span class="text-yellow-400">json</span>')
	.replace(/\bconsole\b/g, '<span class="text-blue-400">console</span>')
	.replace(/\blog\b/g, '<span class="text-yellow-400">log</span>')
	.replace(/\bdata\b/g, '<span class="text-blue-400">data</span>')
	.replace(/'/g, '<span class="text-green-400">\'$&\'</span>')
return htmlLine
}).join('\n')}</pre>
				</div>
			</div>
		</div>
	</div>
</section>
