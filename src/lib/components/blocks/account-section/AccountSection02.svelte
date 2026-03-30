<!--
  AccountSection02.svelte
  Profile edit form: account sidebar (same as above, simplified).
  Right: form sections: Personal Information (first/last name, email, phone),
  Change Password, Communication Preferences checkboxes, Save button.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface Props {
    class?: string;
  }

  let { class: className = '' }: Props = $props();

  const user = {
    name: 'Sarah Anderson',
    email: 'sarah.anderson@example.com',
    initials: 'SA'
  };

  let formData = $state({
    firstName: 'Sarah',
    lastName: 'Anderson',
    email: 'sarah.anderson@example.com',
    phone: '+1 (555) 123-4567',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    newsletter: true,
    promotions: false,
    notifications: true
  });
</script>

<div class={cn('w-full bg-gray-50 py-8', className)}>
  <div class="mx-auto max-w-7xl px-4">
    <div class="grid grid-cols-1 gap-8 md:grid-cols-4">
      <!-- Left sidebar -->
      <div class="md:col-span-1">
        <div class="rounded-lg bg-white p-6 shadow-sm">
          <!-- Avatar and info -->
          <div class="mb-6 flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-base font-bold text-white">{user.initials}</div>
            <div>
              <p class="font-medium text-gray-900">{user.name}</p>
              <p class="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          <hr class="mb-6" />

          <!-- Navigation -->
          <nav class="space-y-1">
            <a href="#" class="block rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Orders</a>
            <a href="#" class="block rounded-md px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100">Profile</a>
            <a href="#" class="block rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Addresses</a>
            <a href="#" class="block rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Payment Methods</a>
            <a href="#" class="block rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Wishlist</a>
          </nav>

          <hr class="my-6" />

          <button type="button" class="w-full rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left">Sign out</button>
        </div>
      </div>

      <!-- Right form content -->
      <div class="md:col-span-3">
        <div class="rounded-lg bg-white p-6 shadow-sm space-y-6">
          <!-- Personal Information -->
          <div>
            <h2 class="mb-4 text-lg font-semibold text-gray-900">Personal Information</h2>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  bind:value={formData.firstName}
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  bind:value={formData.lastName}
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  bind:value={formData.email}
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  bind:value={formData.phone}
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <hr />

          <!-- Change Password -->
          <div>
            <h2 class="mb-4 text-lg font-semibold text-gray-900">Change Password</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  bind:value={formData.currentPassword}
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    bind:value={formData.newPassword}
                    class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    bind:value={formData.confirmPassword}
                    class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <hr />

          <!-- Communication Preferences -->
          <div>
            <h2 class="mb-4 text-lg font-semibold text-gray-900">Communication Preferences</h2>
            <div class="space-y-3">
              <label class="flex items-center gap-3">
                <input
                  type="checkbox"
                  bind:checked={formData.newsletter}
                  class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="text-sm text-gray-700">Subscribe to newsletter</span>
              </label>
              <label class="flex items-center gap-3">
                <input
                  type="checkbox"
                  bind:checked={formData.promotions}
                  class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="text-sm text-gray-700">Promotional emails</span>
              </label>
              <label class="flex items-center gap-3">
                <input
                  type="checkbox"
                  bind:checked={formData.notifications}
                  class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="text-sm text-gray-700">Push notifications</span>
              </label>
            </div>
          </div>

          <!-- Save button -->
          <div class="flex gap-3 pt-4">
            <button type="button" class="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700">Save Changes</button>
            <button type="button" class="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
