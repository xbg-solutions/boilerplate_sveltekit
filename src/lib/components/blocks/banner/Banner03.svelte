<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
		onAccept?: () => void;
		onReject?: () => void;
	}

	let { class: className, onAccept, onReject }: Props = $props();

	let visible = $state(true);

	const handleAccept = () => {
		if (onAccept) {
			onAccept();
		}
		visible = false;
	};

	const handleReject = () => {
		if (onReject) {
			onReject();
		}
		visible = false;
	};
</script>

{#if visible}
	<!-- Desktop -->
	<div class="hidden sm:flex w-full border-t bg-background px-6 py-4 items-center justify-between gap-4">
		<p class="text-sm text-muted-foreground">
			We use cookies to enhance your experience. By clicking "Accept," you consent to the use of all cookies. Learn more in our
			<a href="#" class="underline hover:no-underline">cookie policy</a>.
		</p>
		<div class="flex gap-2 flex-shrink-0">
			<Button variant="outline" size="sm" onclick={handleReject}>Reject all</Button>
			<Button size="sm" onclick={handleAccept}>Accept all</Button>
		</div>
	</div>

	<!-- Mobile -->
	<div class="sm:hidden flex flex-col gap-3 border-t bg-background px-4 py-4">
		<p class="text-sm text-muted-foreground">
			We use cookies to enhance your experience. By clicking "Accept," you consent to the use of all cookies. Learn more in our
			<a href="#" class="underline hover:no-underline">cookie policy</a>.
		</p>
		<div class="flex flex-col gap-2 w-full">
			<Button variant="outline" size="sm" onclick={handleReject} class="w-full">Reject all</Button>
			<Button size="sm" onclick={handleAccept} class="w-full">Accept all</Button>
		</div>
	</div>
{/if}
