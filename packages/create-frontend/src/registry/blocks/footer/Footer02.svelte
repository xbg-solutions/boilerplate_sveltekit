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
		{ heading: 'Product', links: [{label:'Features'},{label:'Pricing'},{label:'Changelog'},{label:'Docs'}] },
		{ heading: 'Company', links: [{label:'About'},{label:'Blog'},{label:'Careers'},{label:'Press'}] },
		{ heading: 'Legal', links: [{label:'Privacy'},{label:'Terms'},{label:'Cookie Policy'},{label:'Licenses'}] }
	];

	const logoSvg = `<path d="m9 12 2 2 4-4"/><path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7z"/>`;
</script>

<footer class={cn('w-full border-t bg-background px-4 py-16 sm:px-6', customClass)}>
	<div class="mx-auto max-w-7xl">
		<div class="grid grid-cols-2 gap-8 sm:grid-cols-4 mb-8">
			<!-- Logo + Tagline Column -->
			<div>
				<div class="flex items-center gap-2 font-semibold mb-4">
					<div class="h-7 w-7 rounded bg-foreground flex items-center justify-center">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
							{logoSvg}
						</svg>
					</div>
					Acme Inc.
				</div>
				<p class="text-sm text-muted-foreground">Building the future of technology.</p>
			</div>

			<!-- Link Columns -->
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

		<!-- Divider -->
		<div class="border-t pt-8">
			<p class="text-sm text-muted-foreground text-center">© {new Date().getFullYear()} Acme Inc. All rights reserved.</p>
		</div>
	</div>
</footer>
