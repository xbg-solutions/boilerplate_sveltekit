<!--
  AccountSection03.svelte
  Saved addresses: list of 2 address cards with address details + "Default" badge on one,
  Edit/Delete buttons. "+ Add new address" button.
  Modal/inline form for adding address (collapsed by default, $state for show).
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface Props {
    class?: string;
  }

  let { class: className = '' }: Props = $props();

  let showAddForm = $state(false);
  let newAddress = $state({
    fullName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  const addresses = [
    {
      id: 1,
      fullName: 'Sarah Anderson',
      street: '123 Main Street, Apt 4B',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
      isDefault: true
    },
    {
      id: 2,
      fullName: 'Sarah Anderson',
      street: '456 Oak Avenue',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'USA',
      isDefault: false
    }
  ];
</script>

<div class={cn('w-full bg-gray-50 py-8', className)}>
  <div class="mx-auto max-w-4xl px-4">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Saved Addresses</h1>
      <button
        type="button"
        onclick={() => (showAddForm = !showAddForm)}
        class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        {showAddForm ? 'Cancel' : '+ Add New Address'}
      </button>
    </div>

    <!-- Add address form -->
    {#if showAddForm}
      <div class="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-6">
        <h2 class="mb-4 text-lg font-semibold text-gray-900">Add New Address</h2>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label for="address-full-name" class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              id="address-full-name"
              type="text"
              bind:value={newAddress.fullName}
              class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Enter full name"
            />
          </div>
          <div>
            <label for="address-street" class="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
            <input
              id="address-street"
              type="text"
              bind:value={newAddress.street}
              class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Street address"
            />
          </div>
          <div>
            <label for="address-city" class="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              id="address-city"
              type="text"
              bind:value={newAddress.city}
              class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="City"
            />
          </div>
          <div>
            <label for="address-state" class="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
            <input
              id="address-state"
              type="text"
              bind:value={newAddress.state}
              class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="State"
            />
          </div>
          <div>
            <label for="address-zip-code" class="block text-sm font-medium text-gray-700 mb-1">ZIP/Postal Code</label>
            <input
              id="address-zip-code"
              type="text"
              bind:value={newAddress.zipCode}
              class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="ZIP code"
            />
          </div>
          <div>
            <label for="address-country" class="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input
              id="address-country"
              type="text"
              bind:value={newAddress.country}
              class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Country"
            />
          </div>
        </div>
        <div class="mt-4 flex gap-3">
          <button type="button" class="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700">Save Address</button>
          <button
            type="button"
            onclick={() => (showAddForm = false)}
            class="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    {/if}

    <!-- Addresses list -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      {#each addresses as address}
        <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div class="mb-4 flex items-start justify-between">
            <h3 class="text-lg font-semibold text-gray-900">{address.fullName}</h3>
            {#if address.isDefault}
              <span class="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">Default</span>
            {/if}
          </div>

          <div class="mb-4 space-y-1 text-sm text-gray-600">
            <p>{address.street}</p>
            <p>{address.city}, {address.state} {address.zipCode}</p>
            <p>{address.country}</p>
          </div>

          <div class="flex gap-3">
            <button type="button" class="flex-1 rounded-lg border border-blue-600 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50">Edit</button>
            <button type="button" class="flex-1 rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">Delete</button>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
