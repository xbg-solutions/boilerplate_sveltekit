<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface FooterLink {
		label: string;
		href?: string;
	}

	interface FooterColumn {
		heading: string;
		links: FooterLink[];
	}

	interface Props {
		class?: string;
	}

	let { class: customClass = '' }: Props = $props();

	const columns: FooterColumn[] = [
		{ heading: 'Product', links: [{label:'Features'},{label:'Pricing'},{label:'Docs'}] },
		{ heading: 'Company', links: [{label:'About'},{label:'Blog'},{label:'Careers'}] }
	];

	const logoSvg = `<path d="m9 12 2 2 4-4"/><path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7z"/>`;
</script>

<footer class={cn('w-full border-t bg-background px-4 py-12 sm:px-6', customClass)}>
	<div class="mx-auto max-w-7xl">
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-12 mb-12">
			<!-- Left: Logo + description + badges -->
			<div>
				<div class="flex items-center gap-2 font-semibold mb-4">
					<div class="h-7 w-7 rounded bg-foreground flex items-center justify-center">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
							{logoSvg}
						</svg>
					</div>
					Acme Inc.
				</div>
				<p class="text-sm text-muted-foreground mb-6">The platform for building amazing products. Download our app today.</p>
				
				<!-- App store badges -->
				<div class="flex flex-col sm:flex-row gap-3">
					<button class="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted transition-colors">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
							<path d="M18.71 19.71L12.41 13.41 12 13l-.41.41-6.3 6.3a2 2 0 1 0 2.83 2.83l6.3-6.3.41-.41.41.41 6.3 6.3a2 2 0 1 0 2.83-2.83zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
						</svg>
						App Store
					</button>
					<button class="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted transition-colors">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
							<path d="M3 13.5h8v8.5H3z M13.5 3h8v8.5h-8z M13.5 13.5h8v8.5h-8z M3 3h8v8.5H3z"/>
						</svg>
						Google Play
					</button>
				</div>
			</div>

			<!-- Right: Link columns -->
			<div class="grid grid-cols-2 gap-8">
				{#each columns as column}
					<div>
						<h4 class="font-semibold mb-4">{column.heading}</h4>
						<ul class="space-y-3">
							{#each column.links as link}
								<li>
									<a href={link.href || '#'} class="text-sm text-muted-foreground hover:text-foreground transition-colors">
										{link.label}
									</a>
								</li>
							{/each}
						</ul>
					</div>
				{/each}
			</div>
		</div>

		<!-- Divider -->
		<div class="border-t pt-8">
			<p class="text-sm text-muted-foreground text-center">© {new Date().getFullYear()} Acme Inc. All rights reserved.</p>
		</div>
	</div>
</footer>
