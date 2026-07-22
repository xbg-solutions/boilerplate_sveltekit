<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
		onSave?: () => void;
	}

	const { class: className, onSave }: Props = $props();

	// Basic information state
	let username = $state('kathypacheco');
	let firstName = $state('Kathy');
	let lastName = $state('Pacheco');
	let email = $state('kathy@example.com');

	// Change password state
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');

	// Advanced settings state
	let dataExportAccess = $state(true);
	let allowAdminToAddMembers = $state(true);
	let enableTwoFactorAuth = $state(true);

	function handleSave() {
		onSave?.();
	}
</script>

<div class={cn('space-y-6', className)}>
	<!-- Basic Information Section -->
	<div class="rounded-lg border bg-background p-4 sm:p-6">
		<div class="flex flex-col gap-6 sm:grid sm:grid-cols-[200px_1fr] sm:gap-6">
			<div>
				<h3 class="text-lg font-semibold">Basic information</h3>
				<p class="mt-2 text-sm text-muted-foreground">Update your profile details.</p>
			</div>

			<div class="space-y-4">
				<div>
					<label for="settings-username" class="block text-sm font-medium mb-2">Username</label>
					<input
						id="settings-username"
						type="text"
						bind:value={username}
						placeholder="Username"
						class="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
					/>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="settings-first-name" class="block text-sm font-medium mb-2">First name</label>
						<input
							id="settings-first-name"
							type="text"
							bind:value={firstName}
							placeholder="First name"
							class="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
						/>
					</div>

					<div>
						<label for="settings-last-name" class="block text-sm font-medium mb-2">Last name</label>
						<input
							id="settings-last-name"
							type="text"
							bind:value={lastName}
							placeholder="Last name"
							class="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
						/>
					</div>
				</div>

				<div>
					<label for="settings-email" class="block text-sm font-medium mb-2">Email address</label>
					<input
						id="settings-email"
						type="email"
						bind:value={email}
						placeholder="email@example.com"
						class="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
					/>
				</div>

				<div class="flex justify-end pt-2">
					<Button onclick={handleSave}>
						Save changes
					</Button>
				</div>
			</div>
		</div>
	</div>

	<!-- Change Password Section -->
	<div class="rounded-lg border bg-background p-4 sm:p-6">
		<div class="flex flex-col gap-6 sm:grid sm:grid-cols-[200px_1fr] sm:gap-6">
			<div>
				<h3 class="text-lg font-semibold">Change password</h3>
				<p class="mt-2 text-sm text-muted-foreground">Update your account password.</p>
			</div>

			<div class="space-y-4">
				<div>
					<label for="settings-current-password" class="block text-sm font-medium mb-2">Current password</label>
					<input
						id="settings-current-password"
						type="password"
						bind:value={currentPassword}
						placeholder="Enter current password"
						class="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
					/>
				</div>

				<div>
					<label for="settings-new-password" class="block text-sm font-medium mb-2">New password</label>
					<input
						id="settings-new-password"
						type="password"
						bind:value={newPassword}
						placeholder="Enter new password"
						class="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
					/>
				</div>

				<div>
					<label for="settings-confirm-password" class="block text-sm font-medium mb-2">Confirm password</label>
					<input
						id="settings-confirm-password"
						type="password"
						bind:value={confirmPassword}
						placeholder="Confirm new password"
						class="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
					/>
				</div>

				<div class="flex justify-end pt-2">
					<Button onclick={handleSave}>
						Save changes
					</Button>
				</div>
			</div>
		</div>
	</div>

	<!-- Advanced Settings Section -->
	<div class="rounded-lg border bg-background p-4 sm:p-6">
		<div class="flex flex-col gap-6 sm:grid sm:grid-cols-[200px_1fr] sm:gap-6">
			<div>
				<h3 class="text-lg font-semibold">Advanced settings</h3>
				<p class="mt-2 text-sm text-muted-foreground">Manage additional account options.</p>
			</div>

			<div class="space-y-4">
				<!-- Data Export Access -->
				<div class="flex items-start gap-3">
					<input
						type="checkbox"
						bind:checked={dataExportAccess}
						id="data-export"
						class="mt-1 rounded border bg-background"
					/>
					<div class="flex-1">
						<label for="data-export" class="text-sm font-medium cursor-pointer block">Data Export Access</label>
						<p class="text-xs text-muted-foreground mt-1">Allow export of personal data and backups.</p>
					</div>
				</div>

				<!-- Allow Admin to Add Members -->
				<div class="flex items-start gap-3">
					<input
						type="checkbox"
						bind:checked={allowAdminToAddMembers}
						id="admin-members"
						class="mt-1 rounded border bg-background"
					/>
					<div class="flex-1">
						<label for="admin-members" class="text-sm font-medium cursor-pointer block">Allow Admin to Add Members</label>
						<p class="text-xs text-muted-foreground mt-1">Admins can invite and manage members.</p>
					</div>
				</div>

				<!-- Enable Two-Factor Authentication -->
				<div class="flex items-start gap-3">
					<input
						type="checkbox"
						bind:checked={enableTwoFactorAuth}
						id="two-factor"
						class="mt-1 rounded border bg-background"
					/>
					<div class="flex-1">
						<label for="two-factor" class="text-sm font-medium cursor-pointer block">Enable Two-Factor Authentication</label>
						<p class="text-xs text-muted-foreground mt-1">Require 2FA for added account security.</p>
					</div>
				</div>

				<div class="flex justify-end pt-2">
					<Button onclick={handleSave}>
						Save changes
					</Button>
				</div>
			</div>
		</div>
	</div>
</div>
