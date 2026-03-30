<!--
  AccountSection04.svelte
  Payment methods: list of 2 payment method cards with card icon (Visa/Mastercard SVG logo),
  last 4 digits, expiry, "Default" badge. Add new card button. PayPal linked account entry.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface Props {
    class?: string;
  }

  let { class: className = '' }: Props = $props();

  let showAddCard = $state(false);

  const paymentMethods = [
    {
      id: 1,
      type: 'visa',
      lastFour: '4242',
      expiry: '12/26',
      cardName: 'Visa',
      isDefault: true
    },
    {
      id: 2,
      type: 'mastercard',
      lastFour: '5555',
      expiry: '08/27',
      cardName: 'Mastercard',
      isDefault: false
    }
  ];

  const paypalLinked = {
    email: 'sarah.anderson@example.com',
    isDefault: false
  };
</script>

<div class={cn('w-full bg-gray-50 py-8', className)}>
  <div class="mx-auto max-w-4xl px-4">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Payment Methods</h1>
      <button
        type="button"
        onclick={() => (showAddCard = !showAddCard)}
        class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        {showAddCard ? 'Cancel' : '+ Add Card'}
      </button>
    </div>

    <!-- Add card form -->
    {#if showAddCard}
      <div class="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-6">
        <h2 class="mb-4 text-lg font-semibold text-gray-900">Add Payment Method</h2>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
            <input
              type="text"
              placeholder="MM/YY"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">CVV</label>
            <input
              type="text"
              placeholder="123"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
            <input
              type="text"
              placeholder="Name on card"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
        <div class="mt-4 flex gap-3">
          <button type="button" class="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700">Add Card</button>
          <button
            type="button"
            onclick={() => (showAddCard = false)}
            class="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    {/if}

    <!-- Payment methods list -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      {#each paymentMethods as method}
        <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div class="mb-4 flex items-start justify-between">
            <div class="flex items-center gap-3">
              {#if method.type === 'visa'}
                <div class="flex h-10 w-16 items-center justify-center rounded bg-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="20" viewBox="0 0 48 32" fill="none"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="12" font-weight="bold">VISA</text></svg>
                </div>
              {:else if method.type === 'mastercard'}
                <div class="flex h-10 w-16 items-center justify-center rounded bg-orange-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="20" viewBox="0 0 48 32" fill="none"><circle cx="16" cy="16" r="12" fill="red"/><circle cx="32" cy="16" r="12" fill="orange"/></svg>
                </div>
              {/if}
              <div>
                <p class="font-medium text-gray-900">{method.cardName}</p>
                <p class="text-sm text-gray-500">****{method.lastFour}</p>
              </div>
            </div>
            {#if method.isDefault}
              <span class="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">Default</span>
            {/if}
          </div>

          <p class="mb-4 text-sm text-gray-600">Expires {method.expiry}</p>

          <div class="flex gap-3">
            <button type="button" class="flex-1 rounded-lg border border-blue-600 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50">Edit</button>
            <button type="button" class="flex-1 rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">Delete</button>
          </div>
        </div>
      {/each}

      <!-- PayPal -->
      <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div class="mb-4 flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-16 items-center justify-center rounded bg-blue-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="20" viewBox="0 0 48 32" fill="none"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="10" font-weight="bold">PayPal</text></svg>
            </div>
            <div>
              <p class="font-medium text-gray-900">PayPal</p>
              <p class="text-sm text-gray-500">{paypalLinked.email}</p>
            </div>
          </div>
          {#if paypalLinked.isDefault}
            <span class="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">Default</span>
          {/if}
        </div>

        <div class="flex gap-3">
          <button type="button" class="flex-1 rounded-lg border border-blue-600 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50">Edit</button>
          <button type="button" class="flex-1 rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">Remove</button>
        </div>
      </div>
    </div>
  </div>
</div>
