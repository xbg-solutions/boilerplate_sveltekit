<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
		avatarUrl?: string;
		onSave?: () => void;
		onDelete?: () => void;
	}

	const { class: className, avatarUrl, onSave, onDelete }: Props = $props();

	let displayName = $state('Shadon Design');
	let isAvatarEditing = $state(false);
	let isNameEditing = $state(false);
	let isTeamsEditing = $state(false);

	const teams = [
		{ name: 'Creative Studio', joined: '5 September 2024', role: 'Admin' },
		{ name: 'Design Team', joined: '2 August 2024', role: 'Admin' },
		{ name: 'Development', joined: '14 January 2023', role: 'Designer' },
		{ name: 'Product Team', joined: '11 May 2023', role: 'Developer' }
	];

	function handleDeleteAccount() {
		onDelete?.();
	}

	function handleSave() {
		isAvatarEditing = false;
		isNameEditing = false;
		isTeamsEditing = false;
		onSave?.();
	}
</script>

<div class={cn('space-y-6', className)}>
	<!-- Avatar Section -->
	<div class="border rounded-lg p-6 space-y-4">
		<div>
			<p class="text-sm text-muted-foreground">Avatar is your profile picture visible across the platform.</p>
		</div>

		<div class="flex items-end gap-4">
			<div
				class="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden"
			>
				{#if avatarUrl}
					<img src={avatarUrl} alt="Avatar" class="w-full h-full object-cover" />
				{:else}
					<span class="text-muted-foreground text-xs">Profile</span>
				{/if}
			</div>
			<div class="flex gap-2">
				<Button variant="outline">Upload</Button>
				<Button variant="outline">Remove</Button>
			</div>
		</div>

		<div class="flex justify-end">
			<Button onclick={handleSave}>Save</Button>
		</div>
	</div>

	<!-- Display Name Section -->
	<div class="border rounded-lg p-6 space-y-4">
		<div>
			<p class="text-sm text-muted-foreground">Enter your full name or a display name to customize your profile.</p>
		</div>

		<div class="space-y-2">
			<input
				type="text"
				bind:value={displayName}
				class="w-full px-3 py-2 border rounded-md bg-background text-sm"
				placeholder="Display name"
			/>
			<p class="text-xs text-muted-foreground">Maximum allowed length is 32 characters.</p>
		</div>

		<div class="flex justify-end">
			<Button onclick={handleSave}>Save</Button>
		</div>
	</div>

	<!-- Teams Section -->
	<div class="border rounded-lg p-6 space-y-4">
		<div>
			<h3 class="font-semibold">Teams</h3>
			<p class="text-sm text-muted-foreground">Here is your URL namespace and team memberships.</p>
		</div>

		<div class="border rounded-lg overflow-hidden">
			<table class="w-full text-sm">
				<thead class="bg-muted border-b">
					<tr>
						<th class="px-4 py-2 text-left font-semibold">Team name</th>
						<th class="px-4 py-2 text-left font-semibold">Joined</th>
						<th class="px-4 py-2 text-right font-semibold">Role</th>
					</tr>
				</thead>
				<tbody>
					{#each teams as team (team.name)}
						<tr class="border-b hover:bg-muted/50">
							<td class="px-4 py-3">Table Cell Text</td>
							<td class="px-4 py-3">{team.joined}</td>
							<td class="px-4 py-3 text-right">
								<span class="inline-block bg-muted text-xs px-2 py-0.5 rounded">{team.role}</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<div class="flex justify-end gap-2">
			<Button variant="outline">Edit</Button>
			<Button onclick={handleSave}>Save</Button>
		</div>
	</div>

	<!-- Delete Account Section -->
	<div class="border border-destructive rounded-lg p-6">
		<div class="flex items-start justify-between gap-4">
			<div class="flex-1 space-y-2">
				<p class="text-sm text-muted-foreground">
					This will permanently delete your Personal Account. Please note that this action is irreversible, so proceed
					with caution.
				</p>
				<p class="text-sm text-destructive font-semibold">This action cannot be undone!</p>
			</div>
			<Button variant="destructive" onclick={handleDeleteAccount}>Delete account</Button>
		</div>
	</div>
</div>
