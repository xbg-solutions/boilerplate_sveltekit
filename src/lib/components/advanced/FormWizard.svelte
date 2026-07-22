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
  import type { Snippet } from 'svelte';
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
  let {
    steps = [],
    initialData = {},
    options = {},
    title = 'Form Wizard',
    subtitle = '',
    className = '',
    loading = false,
    readonly = false,
    step: stepSnippet,
    onStep,
    onComplete,
    onCancel,
    onSave,
    onValidate,
    onError,
  }: {
    steps?: WizardStep[];
    initialData?: any;
    options?: WizardOptions;
    title?: string;
    subtitle?: string;
    className?: string;
    loading?: boolean;
    readonly?: boolean;
    step?: Snippet<[{ step: WizardStep; data: any }]>;
    onStep?: (detail: { step: WizardStep; direction: 'next' | 'previous'; data: any }) => void;
    onComplete?: (detail: { data: any }) => void;
    onCancel?: () => void;
    onSave?: (detail: { data: any; step: WizardStep }) => void;
    onValidate?: (detail: { step: WizardStep; data: any; result: ValidationResult }) => void;
    onError?: (detail: { error: Error; step?: WizardStep }) => void;
  } = $props();

  // Default options
  const defaultOptions: WizardOptions = $derived({
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
  });

  // State
  let currentStepIndex = $state(0);
  // svelte-ignore state_referenced_locally
  let formData = $state<any>({ ...initialData });
  let stepErrors = $state<{ [stepId: string]: ValidationResult }>({});
  let completedSteps = $state<Set<string>>(new Set());
  let visitedSteps = $state<Set<string>>(new Set());
  let stepDataMap = $state<{ [stepId: string]: any }>({});

  let isValidating = $state(false);
  let autoSaveTimer: NodeJS.Timeout | null = null;
  let hasUnsavedChanges = $state(false);

  // Computed values
  let visibleSteps = $derived(
    steps.filter(step => !step.condition || step.condition(formData))
  );

  let currentStep = $derived(visibleSteps[currentStepIndex]);

  let progress = $derived.by(() => {
    if (visibleSteps.length === 0) return 0;
    return ((currentStepIndex + 1) / visibleSteps.length) * 100;
  });

  let canGoNext = $derived.by(() => {
    if (currentStepIndex >= visibleSteps.length - 1) return false;
    if (!currentStep) return false;

    const errors = stepErrors[currentStep.id];
    return !errors || errors.valid;
  });

  let canGoPrevious = $derived(defaultOptions.allowBackward && currentStepIndex > 0);

  let canComplete = $derived.by(() => {
    if (currentStepIndex !== visibleSteps.length - 1) return false;

    // Check all required steps are valid
    return visibleSteps.every(step => {
      if (step.optional) return true;
      const errors = stepErrors[step.id];
      return errors && errors.valid;
    });
  });

  let getStepStatus = $derived.by(() => {
    return (step: WizardStep) => {
      if (step.id === currentStep?.id) return 'current';
      if (completedSteps.has(step.id)) return 'completed';
      if (visitedSteps.has(step.id)) {
        const errors = stepErrors[step.id];
        return errors && !errors.valid ? 'error' : 'visited';
      }
      return 'pending';
    };
  });

  // Functions
  async function validateStep(step: WizardStep, data: any): Promise<ValidationResult> {
    if (!step.validation) {
      return { valid: true };
    }

    isValidating = true;
    try {
      const result = await step.validation(data);

      stepErrors = {
        ...stepErrors,
        [step.id]: result
      };

      onValidate?.({ step, data, result });
      return result;
    } catch (error) {
      const errorResult = {
        valid: false,
        errors: { general: 'Validation error occurred' }
      };

      stepErrors = {
        ...stepErrors,
        [step.id]: errorResult
      };

      onError?.({ error: error as Error, step });
      return errorResult;
    } finally {
      isValidating = false;
    }
  }

  async function goToStep(targetIndex: number, direction: 'next' | 'previous' = 'next') {
    if (targetIndex < 0 || targetIndex >= visibleSteps.length) return;
    if (targetIndex === currentStepIndex) return;

    // Validate current step before moving (if moving forward)
    if (direction === 'next' && currentStep) {
      const result = await validateStep(currentStep, formData);
      if (!result.valid && !currentStep.optional) {
        return;
      }

      if (result.valid) {
        completedSteps = new Set([...completedSteps, currentStep.id]);
      }
    }

    // Update visited steps
    if (currentStep) {
      visitedSteps = new Set([...visitedSteps, currentStep.id]);
    }

    // Save current step data if enabled
    if (defaultOptions.saveOnStep && currentStep) {
      onSave?.({ data: formData, step: currentStep });
    }

    // Move to target step
    currentStepIndex = targetIndex;

    const newStep = visibleSteps[targetIndex];
    onStep?.({ step: newStep, direction, data: formData });

    // Auto-validate new step if enabled
    if (defaultOptions.validateOnChange && newStep) {
      await validateStep(newStep, formData);
    }
  }

  async function nextStep() {
    await goToStep(currentStepIndex + 1, 'next');
  }

  async function previousStep() {
    await goToStep(currentStepIndex - 1, 'previous');
  }

  async function completeWizard() {
    // Final validation of all steps
    for (const step of visibleSteps) {
      if (step.optional) continue;
      const result = await validateStep(step, formData);
      if (!result.valid) {
        // Jump to first invalid step
        const stepIndex = visibleSteps.findIndex(s => s.id === step.id);
        if (stepIndex >= 0) {
          await goToStep(stepIndex);
        }
        return;
      }
    }

    onComplete?.({ data: formData });
    hasUnsavedChanges = false;
  }

  function saveProgress() {
    if (currentStep) {
      onSave?.({ data: formData, step: currentStep });
    }

    hasUnsavedChanges = false;
  }

  function cancelWizard() {
    if (hasUnsavedChanges && !confirm('You have unsaved changes. Are you sure you want to cancel?')) {
      return;
    }
    onCancel?.();
  }

  function updateFormData(data: any) {
    formData = { ...formData, ...data };
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
    if (defaultOptions.validateOnChange && currentStep) {
      validateStep(currentStep, formData);
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

  // Lifecycle
  $effect(() => {
    // Initialize first step as visited
    if (currentStep) {
      visitedSteps = new Set([...visitedSteps, currentStep.id]);
    }

    // Auto-validate on mount if enabled
    if (defaultOptions.validateOnChange && currentStep) {
      validateStep(currentStep, formData);
    }

    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
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
            <Button variant="outline" size="sm" onclick={saveProgress} disabled={loading}>
              <Save class="w-4 h-4 mr-1" />
              Save
            </Button>
          {/if}

          <Button variant="ghost" size="sm" onclick={cancelWizard} disabled={loading}>
            <X class="w-4 h-4" />
          </Button>
        </div>
      </div>

      <!-- Progress Bar -->
      {#if defaultOptions.showProgress}
        <div class="mt-4">
          <Progress value={progress} class="h-2" />
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>Step {currentStepIndex + 1} of {visibleSteps.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
        </div>
      {/if}

      <!-- Step Navigation -->
      <div class="mt-6">
        <div class="flex items-center justify-between overflow-x-auto">
          {#each visibleSteps as step, index}
            {@const status = getStepStatus(step)}
            <div
              class="flex items-center cursor-pointer min-w-0"
              class:opacity-50={defaultOptions.linearNavigation && status === 'pending'}
              role="button"
              tabindex="0"
              onclick={() => !defaultOptions.linearNavigation || status !== 'pending' ? goToStep(index) : null}
              onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!defaultOptions.linearNavigation || status !== 'pending') goToStep(index); } }}
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
                    <IconComponent class="w-4 h-4" />
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
              {#if index < visibleSteps.length - 1}
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
      {#if currentStep && stepErrors[currentStep.id] && !stepErrors[currentStep.id].valid}
        <Alert variant="destructive">
          <AlertTriangle class="h-4 w-4" />
          <AlertDescription>
            Please fix the following errors before continuing:
            <ul class="mt-2 list-disc list-inside">
              {#each Object.entries(stepErrors[currentStep.id].errors || {}) as [field, message]}
                <li class="text-sm">{message}</li>
              {/each}
            </ul>
          </AlertDescription>
        </Alert>
      {/if}

      <!-- Current Step Warnings -->
      {#if currentStep && stepErrors[currentStep.id]?.warnings}
        <Alert>
          <AlertTriangle class="h-4 w-4" />
          <AlertDescription>
            <ul class="list-disc list-inside">
              {#each Object.entries(stepErrors[currentStep.id].warnings || {}) as [field, message]}
                <li class="text-sm">{message}</li>
              {/each}
            </ul>
          </AlertDescription>
        </Alert>
      {/if}

      <!-- Step Content -->
      {#if currentStep}
        <div class="min-h-[200px]">
          {#if currentStep.component}
            {@const StepComponent = currentStep.component}
            <StepComponent
              data={formData}
              {readonly}
              {loading}
              onUpdate={(detail: any) => updateFormData(detail)}
              onValidate={(detail: any) => validateStep(currentStep, detail)}
            />
          {:else if stepSnippet}
            {@render stepSnippet({ step: currentStep, data: formData })}
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
          disabled={!canGoPrevious || loading}
          onclick={previousStep}
        >
          <ChevronLeft class="w-4 h-4 mr-1" />
          Previous
        </Button>

        {#if currentStep?.canSkip && defaultOptions.allowSkip}
          <Button
            variant="ghost"
            disabled={loading}
            onclick={nextStep}
          >
            Skip
          </Button>
        {/if}
      </div>

      <div class="flex items-center gap-2">
        {#if currentStepIndex === visibleSteps.length - 1}
          <Button
            disabled={!canComplete || loading}
            onclick={completeWizard}
          >
            Complete
            <Check class="w-4 h-4 ml-1" />
          </Button>
        {:else}
          <Button
            disabled={!canGoNext || loading}
            onclick={nextStep}
          >
            Next
            <ChevronRight class="w-4 h-4 ml-1" />
          </Button>
        {/if}
      </div>
    </CardFooter>
  </Card>
</div>