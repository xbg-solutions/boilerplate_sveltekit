<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
		eyebrow?: string;
		title?: string;
		subtitle?: string;
		primaryLabel?: string;
		onPrimary?: () => void;
		userCount?: string;
	}

	let {
		class: className,
		eyebrow = 'Trusted by Industry Leaders',
		title = 'Capture Leads with Ease',
		subtitle = 'Build trust and convert visitors into customers with our streamlined lead capture form.',
		primaryLabel = 'Submit',
		onPrimary,
		userCount = '10,000+',
	}: Props = $props();

	let formName = $state('');
	let formEmail = $state('');
	let formCompany = $state('');

	function handleSubmit() {
		onPrimary?.();
		formName = '';
		formEmail = '';
		formCompany = '';
	}
</script>

<section class={cn('w-full bg-white px-4 py-20 sm:py-28 sm:px-6 lg:px-8', className)}>
	<div class="mx-auto max-w-7xl">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
			<!-- Left Content -->
			<div>
				<p class="text-sm font-semibold text-blue-600 uppercase tracking-wide">{eyebrow}</p>
				<h1 class="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
					{title}
				</h1>
				<p class="mt-6 text-lg text-gray-600 max-w-xl">
					{subtitle}
				</p>

				<!-- Trust Signals -->
				<div class="mt-8 flex items-center gap-4">
					<div class="flex -space-x-2">
						<div class="w-10 h-10 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-sm font-bold">
							A
						</div>
						<div class="w-10 h-10 rounded-full bg-purple-500 border-2 border-white flex items-center justify-center text-white text-sm font-bold">
							B
						</div>
						<div class="w-10 h-10 rounded-full bg-pink-500 border-2 border-white flex items-center justify-center text-white text-sm font-bold">
							C
						</div>
					</div>
					<p class="text-sm text-gray-700">
						<strong>{userCount}</strong> users already trust us
					</p>
				</div>
			</div>

			<!-- Right Form Card -->
			<div class="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
				<h2 class="text-2xl font-bold text-gray-900 mb-6">Get Started Today</h2>
				<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
					<div>
						<label for="name" class="block text-sm font-medium text-gray-900 mb-2">Full Name</label>
						<input
							type="text"
							id="name"
							placeholder="John Doe"
							bind:value={formName}
							class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
						/>
					</div>
					<div>
						<label for="email" class="block text-sm font-medium text-gray-900 mb-2">Email</label>
						<input
							type="email"
							id="email"
							placeholder="john@example.com"
							bind:value={formEmail}
							class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
						/>
					</div>
					<div>
						<label for="company" class="block text-sm font-medium text-gray-900 mb-2">Company</label>
						<input
							type="text"
							id="company"
							placeholder="Acme Inc."
							bind:value={formCompany}
							class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
						/>
					</div>
					<Button size="lg" class="w-full" onclick={handleSubmit}>
						{primaryLabel}
					</Button>
				</form>
				<p class="mt-4 text-xs text-gray-500 text-center">
					We respect your privacy. Unsubscribe at any time.
				</p>
			</div>
		</div>
	</div>
</section>
