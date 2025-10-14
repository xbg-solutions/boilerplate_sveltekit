<!--
  Advanced FormWizard Component
  
  Features:
  - Multi-step form navigation
  - Validation and error handling
  - Progress tracking
  - Save draft functionality
  - Conditional steps
  - Mobile responsive
-->
<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { writable, derived, type Writable } from 'svelte/store';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Progress } from '$lib/components/ui/progress';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { 
    ChevronLeft, 
    ChevronRight,
    Check,
    AlertTriangle,
    Save,
    X,
    MoreHorizontal
  } from 'lucide-svelte';

  // Types
  export interface WizardStep {
    id: string;
    title: string;
    description?: string;
    icon?: any;
    component?: any;
    validation?: (data: any) => Promise<ValidationResult> | ValidationResult;
    condition?: (data: any) => boolean;
    optional?: boolean;
    canSkip?: boolean;
  }

  export interface ValidationResult {
    valid: boolean;
    errors?: { [key: string]: string };
    warnings?: { [key: string]: string };
  }

  export interface WizardOptions {
    allowBackward?: boolean;
    allowSkip?: boolean;
    showProgress?: boolean;
    showStepNumbers?: boolean;
    saveOnStep?: boolean;
    validateOnChange?: boolean;
    linearNavigation?: boolean;
    showSummary?: boolean;
    autoSave?: boolean;
    autoSaveDelay?: number;
  }

  // Props
  export let steps: WizardStep[] = [];
  export let initialData: any = {};
  export let options: WizardOptions = {};
  export let title = 'Form Wizard';
  export let subtitle = '';
  export let className = '';
  export let loading = false;
  export let readonly = false;

  // Events
  const dispatch = createEventDispatcher<{
    step: { step: WizardStep; direction: 'next' | 'previous'; data: any };
    complete: { data: any };
    cancel: void;
    save: { data: any; step: WizardStep };
    validate: { step: WizardStep; data: any; result: ValidationResult };
    error: { error: Error; step?: WizardStep };
  }>();

  // Default options
  const defaultOptions: WizardOptions = {
    allowBackward: true,
    allowSkip: false,
    showProgress: true,
    showStepNumbers: true,
    saveOnStep: false,
    validateOnChange: false,
    linearNavigation: true,
    showSummary: true,
    autoSave: false,
    autoSaveDelay: 30000,
    ...options
  };

  // State
  const currentStepIndex: Writable<number> = writable(0);
  const formData: Writable<any> = writable({ ...initialData });
  const stepErrors: Writable<{ [stepId: string]: ValidationResult }> = writable({});
  const completedSteps: Writable<Set<string>> = writable(new Set());
  const visitedSteps: Writable<Set<string>> = writable(new Set());
  const stepData: Writable<{ [stepId: string]: any }> = writable({});
  
  let isValidating = false;
  let autoSaveTimer: NodeJS.Timeout | null = null;
  let hasUnsavedChanges = false;

  // Computed values
  const visibleSteps = derived(
    [formData],
    ([$formData]) => steps.filter(step => !step.condition || step.condition($formData))
  );

  const currentStep = derived(
    [currentStepIndex, visibleSteps],
    ([$currentStepIndex, $visibleSteps]) => $visibleSteps[$currentStepIndex]
  );

  const progress = derived(
    [currentStepIndex, visibleSteps],
    ([$currentStepIndex, $visibleSteps]) => {
      if ($visibleSteps.length === 0) return 0;
      return (($currentStepIndex + 1) / $visibleSteps.length) * 100;
    }
  );

  const canGoNext = derived(
    [currentStepIndex, visibleSteps, stepErrors, currentStep],
    ([$currentStepIndex, $visibleSteps, $stepErrors, $currentStep]) => {
      if ($currentStepIndex >= $visibleSteps.length - 1) return false;
      if (!$currentStep) return false;
      
      const errors = $stepErrors[$currentStep.id];
      return !errors || errors.valid;
    }
  );

  const canGoPrevious = derived(
    [currentStepIndex],
    ([$currentStepIndex]) => defaultOptions.allowBackward && $currentStepIndex > 0
  );

  const canComplete = derived(
    [currentStepIndex, visibleSteps, stepErrors],
    ([$currentStepIndex, $visibleSteps, $stepErrors]) => {
      if ($currentStepIndex !== $visibleSteps.length - 1) return false;
      
      // Check all required steps are valid
      return $visibleSteps.every(step => {
        if (step.optional) return true;
        const errors = $stepErrors[step.id];
        return errors && errors.valid;
      });
    }
  );

  const stepStatus = derived(
    [completedSteps, visitedSteps, stepErrors, currentStep],
    ([$completedSteps, $visitedSteps, $stepErrors, $currentStep]) => {
      return (step: WizardStep) => {
        if (step.id === $currentStep?.id) return 'current';
        if ($completedSteps.has(step.id)) return 'completed';
        if ($visitedSteps.has(step.id)) {
          const errors = $stepErrors[step.id];
          return errors && !errors.valid ? 'error' : 'visited';
        }
        return 'pending';
      };
    }
  );

  // Functions
  async function validateStep(step: WizardStep, data: any): Promise<ValidationResult> {
    if (!step.validation) {
      return { valid: true };
    }

    isValidating = true;
    try {
      const result = await step.validation(data);
      
      stepErrors.update(errors => ({
        ...errors,
        [step.id]: result
      }));

      dispatch('validate', { step, data, result });
      return result;
    } catch (error) {
      const errorResult = { 
        valid: false, 
        errors: { general: 'Validation error occurred' }
      };
      
      stepErrors.update(errors => ({
        ...errors,
        [step.id]: errorResult
      }));

      dispatch('error', { error: error as Error, step });
      return errorResult;
    } finally {
      isValidating = false;
    }
  }

  async function goToStep(targetIndex: number, direction: 'next' | 'previous' = 'next') {
    const $visibleSteps = get(visibleSteps);
    const $currentStepIndex = get(currentStepIndex);
    const $currentStep = get(currentStep);
    const $formData = get(formData);

    if (targetIndex < 0 || targetIndex >= $visibleSteps.length) return;
    if (targetIndex === $currentStepIndex) return;

    // Validate current step before moving (if moving forward)
    if (direction === 'next' && $currentStep) {
      const result = await validateStep($currentStep, $formData);
      if (!result.valid && !$currentStep.optional) {
        return;
      }
      
      if (result.valid) {
        completedSteps.update(completed => completed.add($currentStep.id));
      }
    }

    // Update visited steps
    if ($currentStep) {
      visitedSteps.update(visited => visited.add($currentStep.id));
    }

    // Save current step data if enabled
    if (defaultOptions.saveOnStep && $currentStep) {
      dispatch('save', { data: $formData, step: $currentStep });
    }

    // Move to target step
    currentStepIndex.set(targetIndex);
    
    const newStep = $visibleSteps[targetIndex];
    dispatch('step', { step: newStep, direction, data: $formData });

    // Auto-validate new step if enabled
    if (defaultOptions.validateOnChange && newStep) {
      await validateStep(newStep, $formData);
    }
  }

  async function nextStep() {
    const $currentStepIndex = get(currentStepIndex);
    await goToStep($currentStepIndex + 1, 'next');
  }

  async function previousStep() {
    const $currentStepIndex = get(currentStepIndex);
    await goToStep($currentStepIndex - 1, 'previous');
  }

  async function completeWizard() {
    const $formData = get(formData);
    const $visibleSteps = get(visibleSteps);

    // Final validation of all steps
    for (const step of $visibleSteps) {
      if (step.optional) continue;
      const result = await validateStep(step, $formData);
      if (!result.valid) {
        // Jump to first invalid step
        const stepIndex = $visibleSteps.findIndex(s => s.id === step.id);
        if (stepIndex >= 0) {
          await goToStep(stepIndex);
        }
        return;
      }
    }

    dispatch('complete', { data: $formData });
    hasUnsavedChanges = false;
  }

  function saveProgress() {
    const $formData = get(formData);
    const $currentStep = get(currentStep);
    
    if ($currentStep) {
      dispatch('save', { data: $formData, step: $currentStep });
    }
    
    hasUnsavedChanges = false;
  }

  function cancelWizard() {
    if (hasUnsavedChanges && !confirm('You have unsaved changes. Are you sure you want to cancel?')) {
      return;
    }
    dispatch('cancel');
  }

  function updateFormData(data: any) {
    formData.update(current => ({ ...current, ...data }));
    hasUnsavedChanges = true;

    // Auto-save logic
    if (defaultOptions.autoSave && defaultOptions.autoSaveDelay) {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      autoSaveTimer = setTimeout(() => {
        saveProgress();
      }, defaultOptions.autoSaveDelay);
    }

    // Auto-validate current step
    const $currentStep = get(currentStep);
    if (defaultOptions.validateOnChange && $currentStep) {
      validateStep($currentStep, get(formData));
    }
  }

  function getStepIcon(step: WizardStep, status: string) {
    if (step.icon) return step.icon;
    
    switch (status) {
      case 'completed': return Check;
      case 'error': return AlertTriangle;
      case 'current': return MoreHorizontal;
      default: return null;
    }
  }

  // Utility function to get store value
  function get<T>(store: Writable<T>): T {
    let value: T;
    store.subscribe(v => value = v)();
    return value!;
  }

  onMount(() => {
    // Initialize first step as visited
    const $currentStep = get(currentStep);
    if ($currentStep) {
      visitedSteps.update(visited => visited.add($currentStep.id));
    }

    // Auto-validate on mount if enabled
    if (defaultOptions.validateOnChange && $currentStep) {
      validateStep($currentStep, get(formData));
    }
  });
</script>

<div class="form-wizard {className}">
  <Card class="w-full max-w-4xl mx-auto">
    <!-- Header -->
    <CardHeader>
      <div class="flex items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          {#if subtitle}
            <p class="text-sm text-gray-600 mt-1">{subtitle}</p>
          {/if}
        </div>
        
        <div class="flex items-center gap-2">
          {#if hasUnsavedChanges}
            <Badge variant="secondary">Unsaved changes</Badge>
          {/if}
          
          {#if defaultOptions.autoSave}
            <Button variant="outline" size="sm" on:click={saveProgress} disabled={loading}>
              <Save class="w-4 h-4 mr-1" />
              Save
            </Button>
          {/if}
          
          <Button variant="ghost" size="sm" on:click={cancelWizard} disabled={loading}>
            <X class="w-4 h-4" />
          </Button>
        </div>
      </div>

      <!-- Progress Bar -->
      {#if defaultOptions.showProgress}
        <div class="mt-4">
          <Progress value={$progress} class="h-2" />
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>Step {$currentStepIndex + 1} of {$visibleSteps.length}</span>
            <span>{Math.round($progress)}% complete</span>
          </div>
        </div>
      {/if}

      <!-- Step Navigation -->
      <div class="mt-6">
        <div class="flex items-center justify-between overflow-x-auto">
          {#each $visibleSteps as step, index}
            {@const status = $stepStatus(step)}
            <div 
              class="flex items-center cursor-pointer min-w-0"
              class:opacity-50={defaultOptions.linearNavigation && status === 'pending'}
              on:click={() => !defaultOptions.linearNavigation || status !== 'pending' ? goToStep(index) : null}
            >
              <!-- Step Circle -->
              <div 
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors"
                class:bg-primary={status === 'current'}
                class:text-primary-foreground={status === 'current'}
                class:border-primary={status === 'current'}
                class:bg-green-100={status === 'completed'}
                class:text-green-600={status === 'completed'}
                class:border-green-300={status === 'completed'}
                class:bg-red-100={status === 'error'}
                class:text-red-600={status === 'error'}
                class:border-red-300={status === 'error'}
                class:border-gray-300={status === 'pending' || status === 'visited'}
              >
                {#if defaultOptions.showStepNumbers}
                  {#if status === 'completed'}
                    <Check class="w-4 h-4" />
                  {:else if status === 'error'}
                    <AlertTriangle class="w-4 h-4" />
                  {:else}
                    <span class="text-sm font-medium">{index + 1}</span>
                  {/if}
                {:else}
                  {@const IconComponent = getStepIcon(step, status)}
                  {#if IconComponent}
                    <svelte:component this={IconComponent} class="w-4 h-4" />
                  {:else}
                    <span class="text-sm font-medium">{index + 1}</span>
                  {/if}
                {/if}
              </div>

              <!-- Step Label -->
              <div class="ml-3 min-w-0 flex-1">
                <p class="text-sm font-medium text-gray-900 truncate">
                  {step.title}
                </p>
                {#if step.description}
                  <p class="text-xs text-gray-500 truncate">
                    {step.description}
                  </p>
                {/if}
              </div>

              <!-- Connector Line -->
              {#if index < $visibleSteps.length - 1}
                <div class="flex-1 h-px bg-gray-200 mx-4"></div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    </CardHeader>

    <!-- Content -->
    <CardContent class="space-y-6">
      <!-- Current Step Errors -->
      {#if $currentStep && $stepErrors[$currentStep.id] && !$stepErrors[$currentStep.id].valid}
        <Alert variant="destructive">
          <AlertTriangle class="h-4 w-4" />
          <AlertDescription>
            Please fix the following errors before continuing:
            <ul class="mt-2 list-disc list-inside">
              {#each Object.entries($stepErrors[$currentStep.id].errors || {}) as [field, message]}
                <li class="text-sm">{message}</li>
              {/each}
            </ul>
          </AlertDescription>
        </Alert>
      {/if}

      <!-- Current Step Warnings -->
      {#if $currentStep && $stepErrors[$currentStep.id]?.warnings}
        <Alert>
          <AlertTriangle class="h-4 w-4" />
          <AlertDescription>
            <ul class="list-disc list-inside">
              {#each Object.entries($stepErrors[$currentStep.id].warnings || {}) as [field, message]}
                <li class="text-sm">{message}</li>
              {/each}
            </ul>
          </AlertDescription>
        </Alert>
      {/if}

      <!-- Step Content -->
      {#if $currentStep}
        <div class="min-h-[200px]">
          {#if $currentStep.component}
            <svelte:component 
              this={$currentStep.component} 
              data={$formData}
              {readonly}
              {loading}
              on:update={(e) => updateFormData(e.detail)}
              on:validate={(e) => validateStep($currentStep, e.detail)}
            />
          {:else}
            <slot name="step" step={$currentStep} data={$formData} />
          {/if}
        </div>
      {/if}

      <!-- Loading Overlay -->
      {#if loading || isValidating}
        <div class="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
          <div class="text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p class="text-sm text-gray-600 mt-2">
              {isValidating ? 'Validating...' : 'Loading...'}
            </p>
          </div>
        </div>
      {/if}
    </CardContent>

    <!-- Footer -->
    <CardFooter class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          disabled={!$canGoPrevious || loading}
          on:click={previousStep}
        >
          <ChevronLeft class="w-4 h-4 mr-1" />
          Previous
        </Button>

        {#if $currentStep?.canSkip && defaultOptions.allowSkip}
          <Button
            variant="ghost"
            disabled={loading}
            on:click={nextStep}
          >
            Skip
          </Button>
        {/if}
      </div>

      <div class="flex items-center gap-2">
        {#if $currentStepIndex === $visibleSteps.length - 1}
          <Button
            disabled={!$canComplete || loading}
            on:click={completeWizard}
          >
            Complete
            <Check class="w-4 h-4 ml-1" />
          </Button>
        {:else}
          <Button
            disabled={!$canGoNext || loading}
            on:click={nextStep}
          >
            Next
            <ChevronRight class="w-4 h-4 ml-1" />
          </Button>
        {/if}
      </div>
    </CardFooter>
  </Card>
</div>