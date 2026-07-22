<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	type NotifOption = 'All' | 'Email' | 'In app' | 'None';

	interface Props {
		class?: string;
		onSave?: () => void;
	}

	const { class: className, onSave }: Props = $props();

	let generalSettings = $state<Record<string, NotifOption>>({
		newMessages: 'All',
		accountActivity: 'All',
		mentions: 'All',
		appUpdates: 'All'
	});

	let summarySettings = $state<Record<string, NotifOption>>({
		dailySummary: 'All',
		weeklyReport: 'All',
		monthlyBilling: 'All',
		eventReminder: 'All'
	});

	const notificationOptions: NotifOption[] = ['All', 'Email', 'In app', 'None'];

	function handleSave() {
		onSave?.();
	}
</script>

<div class={cn('space-y-6', className)}>
	<!-- Header -->
	<div>
		<h2 class="text-2xl font-semibold">Notifications</h2>
		<p class="text-sm text-muted-foreground mt-1">
			Stay informed with customizable notifications about your account and activities.
		</p>
	</div>

	<!-- General Notifications -->
	<div class="border rounded-lg p-6 space-y-4">
		<div>
			<h3 class="text-lg font-semibold">General notifications</h3>
			<p class="text-sm text-muted-foreground">Choose how you receive general updates</p>
		</div>

		<div class="space-y-4">
			{#each [
				{ key: 'newMessages', label: 'New messages' },
				{ key: 'accountActivity', label: 'Account activity' },
				{ key: 'mentions', label: 'Mentions in discussions' },
				{ key: 'appUpdates', label: 'Application updates' }
			] as item}
				<div class="flex items-center justify-between">
					<span class="text-sm font-medium">{item.label}</span>
					<div class="flex gap-1">
						{#each notificationOptions as option}
							<button
								class={cn(
									'px-2.5 py-1 rounded text-sm border transition-colors',
									generalSettings[item.key] === option
										? 'bg-foreground text-background border-foreground'
										: 'border-muted-foreground/20 hover:border-muted-foreground/40'
								)}
								onclick={() => (generalSettings[item.key] = option)}
							>
								{option}
							</button>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Summary Notifications -->
	<div class="border rounded-lg p-6 space-y-4">
		<div>
			<h3 class="text-lg font-semibold">Summary notifications</h3>
			<p class="text-sm text-muted-foreground">Receive digest summaries of your activity</p>
		</div>

		<div class="space-y-4">
			{#each [
				{ key: 'dailySummary', label: 'Daily activity summary' },
				{ key: 'weeklyReport', label: 'Weekly progress report' },
				{ key: 'monthlyBilling', label: 'Monthly billing summary' },
				{ key: 'eventReminder', label: 'Event reminder summary' }
			] as item}
				<div class="flex items-center justify-between">
					<span class="text-sm font-medium">{item.label}</span>
					<div class="flex gap-1">
						{#each notificationOptions as option}
							<button
								class={cn(
									'px-2.5 py-1 rounded text-sm border transition-colors',
									summarySettings[item.key] === option
										? 'bg-foreground text-background border-foreground'
										: 'border-muted-foreground/20 hover:border-muted-foreground/40'
								)}
								onclick={() => (summarySettings[item.key] = option)}
							>
								{option}
							</button>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Save Button -->
	<div class="flex justify-end">
		<Button onclick={handleSave}>Save preferences</Button>
	</div>
</div>
