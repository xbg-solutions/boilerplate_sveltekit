<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface TeamMember {
    name: string;
    role?: string;
    bio?: string;
    avatarUrl?: string;
    twitter?: string;
    linkedin?: string;
  }

  const defaultMembers: TeamMember[] = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Co-Founder',
      bio: 'Passionate about building products that empower designers and developers to create better digital experiences.',
    },
    {
      name: 'Marcus Chen',
      role: 'CTO & Co-Founder',
      bio: 'Full-stack engineer with 10+ years building design systems and developer tools.',
    },
    {
      name: 'Priya Patel',
      role: 'Head of Design',
      bio: 'Former lead designer at top tech companies, passionate about accessible and beautiful interfaces.',
    },
    {
      name: 'James Rivera',
      role: 'Head of Engineering',
      bio: 'Loves clean code, performance optimization, and mentoring engineers.',
    },
    {
      name: 'Lena Schmidt',
      role: 'Product Manager',
      bio: 'Bridges design and engineering to ship products users love.',
    },
    {
      name: 'Noah Williams',
      role: 'Marketing Lead',
      bio: 'Data-driven marketer focused on developer communities and content.',
    },
  ];

  let { class: className, title = 'Meet our team', description = 'Our diverse team of experts is passionate about creating the best possible product for you.', members = defaultMembers } = $props();
</script>

<section class={cn('w-full bg-background py-16 px-4', className)}>
  <div class="mx-auto max-w-6xl">
    <div class="text-center mb-12">
      <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Team Section</p>
      <h2 class="text-2xl sm:text-3xl font-bold mb-4">{title}</h2>
      <p class="text-muted-foreground max-w-2xl mx-auto">{description}</p>
    </div>

    <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {#each members as member}
        <div class="flex flex-col items-center text-center">
          <div class="h-16 w-16 rounded-full bg-muted text-sm font-semibold flex items-center justify-center text-muted-foreground mb-4">
            {member.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </div>

          <h3 class="font-medium text-lg">{member.name}</h3>

          {#if member.role}
            <p class="text-xs text-muted-foreground font-medium">{member.role}</p>
          {/if}

          {#if member.bio}
            <p class="mt-2 text-sm text-muted-foreground">{member.bio}</p>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</section>
