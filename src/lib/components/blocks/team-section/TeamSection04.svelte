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

  let { class: className, title = 'Meet our team', description = 'Our diverse team of experts is passionate about creating the best possible product for you.', members = defaultMembers.slice(0, 4) } = $props();
</script>

<section class={cn('w-full bg-background py-16 px-4', className)}>
  <div class="mx-auto max-w-6xl">
    <div class="mb-12">
      <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Team Section</p>
      <h2 class="text-2xl sm:text-3xl font-bold mb-4">{title}</h2>
      <p class="text-muted-foreground max-w-2xl">{description}</p>
    </div>

    <div class="flex flex-col divide-y">
      {#each members as member}
        <div class="flex items-center justify-between gap-4 py-5">
          <div class="flex items-center gap-4 flex-1">
            <div class="h-12 w-12 rounded-full bg-muted text-sm font-semibold flex items-center justify-center text-muted-foreground flex-shrink-0">
              {member.name
                .split(' ')
                .map((n: string) => n[0])
                .join('')}
            </div>

            <div class="text-left">
              <h3 class="font-medium text-sm">{member.name}</h3>

              {#if member.role}
                <p class="text-xs text-muted-foreground">{member.role}</p>
              {/if}

              {#if member.bio}
                <p class="mt-1 text-xs text-muted-foreground line-clamp-1">{member.bio}</p>
              {/if}
            </div>
          </div>

          {#if member.twitter || member.linkedin}
            <div class="flex gap-2 flex-shrink-0">
              {#if member.twitter}
                <a href={member.twitter} target="_blank" rel="noopener noreferrer" aria-label="X (Twitter) profile" class="p-2 hover:bg-muted rounded-md transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" class="text-muted-foreground hover:text-foreground">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              {/if}

              {#if member.linkedin}
                <a href={member.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile" class="p-2 hover:bg-muted rounded-md transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" class="text-muted-foreground hover:text-foreground">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
              {/if}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</section>
