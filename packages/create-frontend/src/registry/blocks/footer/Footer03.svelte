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
	const twitterIcon = `<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>`;
	const githubIcon = `<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>`;
	const linkedinIcon = `<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>`;
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

		<!-- Bottom row with social icons -->
		<div class="border-t pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
			<p class="text-sm text-muted-foreground">© {new Date().getFullYear()} Acme Inc. All rights reserved.</p>
			<div class="flex gap-4">
				<a href="#" class="text-muted-foreground hover:text-foreground transition-colors">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						{twitterIcon}
					</svg>
				</a>
				<a href="#" class="text-muted-foreground hover:text-foreground transition-colors">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						{githubIcon}
					</svg>
				</a>
				<a href="#" class="text-muted-foreground hover:text-foreground transition-colors">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						{linkedinIcon}
					</svg>
				</a>
			</div>
		</div>
	</div>
</footer>
