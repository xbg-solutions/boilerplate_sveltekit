/**
 * src/lib/utils/recaptcha.ts
 * Firebase reCAPTCHA utility
 * 
 * Provides functionality for Firebase reCAPTCHA verification:
 * - Creating reCAPTCHA verifiers for phone authentication
 * - Managing invisible vs. visible reCAPTCHA implementations
 * - Handling reCAPTCHA events and errors
 */

import { RecaptchaVerifier, type ApplicationVerifier, type Auth } from 'firebase/auth';
import { loggerService } from '../services/logging/logging.service';
import { getFirebaseAuth, processFirebaseError } from './firebase';
import { AppError, normalizeError, withErrorHandling } from './error-handler';
import { publish } from '../services/events';
import { AUTH_EVENTS } from '../constants/auth.constants';

// Create a context-aware logger
const recaptchaLogger = loggerService.withContext('RecaptchaUtility');

/**
 * Options for creating a reCAPTCHA verifier
 */
export interface RecaptchaOptions {
  /**
   * The ID of the container element where reCAPTCHA will be rendered
   * If not provided, invisible reCAPTCHA will be used
   */
  containerId?: string;
  
  /**
   * Callback function to execute when the reCAPTCHA is verified
   */
  callback?: () => void;
  
  /**
   * Callback function to execute when the reCAPTCHA verification expires
   */
  expiredCallback?: () => void;
  
  /**
   * Callback function to execute when there's an error with reCAPTCHA
   */
  errorCallback?: (error: Error) => void;
  
  /**
   * Language code for reCAPTCHA localization (defaults to browser's language)
   */
  languageCode?: string;
  
  /**
   * Whether to use invisible reCAPTCHA (defaults to true if no containerId)
   */
  isInvisible?: boolean;
  
  /**
   * Size of reCAPTCHA widget, either 'normal' or 'compact'
   * Only applicable when isInvisible is false
   */
  size?: 'normal' | 'compact';
  
  /**
   * Theme of reCAPTCHA widget, either 'light' or 'dark'
   */
  theme?: 'light' | 'dark';
  
  /**
   * Custom Firebase Auth instance (uses the default if not provided)
   */
  auth?: Auth;
}

/**
 * Creates a Firebase reCAPTCHA verifier for phone authentication
 * 
 * @param options Options for the reCAPTCHA verifier
 * @returns Promise resolving to a reCAPTCHA verifier object
 */
export async function createRecaptchaVerifier(options: RecaptchaOptions = {}): Promise<ApplicationVerifier> {
  const timerId = recaptchaLogger.startTimer('createRecaptchaVerifier');
  
  try {
    // Get Firebase Auth (either from options or default)
    const auth = options.auth || await getFirebaseAuth();
    
    // Set language for localization if provided
    if (options.languageCode) {
      auth.languageCode = options.languageCode;
      recaptchaLogger.info(`Set Firebase Auth language code to: ${options.languageCode}`);
    }
    
    // Determine if using invisible reCAPTCHA
    const isInvisible = options.isInvisible ?? !options.containerId;
    
    // Log reCAPTCHA initialization
    recaptchaLogger.info('Creating reCAPTCHA verifier', {
      type: isInvisible ? 'invisible' : 'visible',
      container: options.containerId || 'none',
      hasCallback: !!options.callback
    });
    
    // Create parameters object for RecaptchaVerifier
    const recaptchaOptions: {
      size?: string;
      callback?: () => void;
      'expired-callback'?: () => void;
      'error-callback'?: (error: Error) => void;
      theme?: string;
    } = {};
    
    // Only add callbacks if they're provided
    if (options.callback) {
      recaptchaOptions.callback = options.callback;
    }
    
    if (options.expiredCallback) {
      recaptchaOptions['expired-callback'] = options.expiredCallback;
    }
    
    if (options.errorCallback) {
      recaptchaOptions['error-callback'] = options.errorCallback;
    }
    
    // Set size based on visibility type
    if (isInvisible) {
      recaptchaOptions.size = 'invisible';
    } else if (options.size) {
      recaptchaOptions.size = options.size;
    }
    
    // Set theme if provided
    if (options.theme) {
      recaptchaOptions.theme = options.theme;
    }
    
    // For invisible reCAPTCHA with no container specified, create a temporary one
    if (isInvisible && !options.containerId) {
      // Create a temporary container that is visible but nearly transparent
      // IMPORTANT: Don't use display:none as it can cause issues with reCAPTCHA
      const tempContainer = document.createElement('div');
      tempContainer.id = 'recaptcha-invisible-container-' + Date.now();
      tempContainer.style.position = 'absolute';
      tempContainer.style.bottom = '0';
      tempContainer.style.opacity = '0.01'; // Nearly invisible, but not display:none
      document.body.appendChild(tempContainer);
      
      recaptchaLogger.info(`Created temporary container: ${tempContainer.id}`);
      
      // Create the verifier
      const recaptchaVerifier = new RecaptchaVerifier(
        auth, 
        tempContainer,
        recaptchaOptions
      );
      
      // Render the reCAPTCHA to initialize it
      await recaptchaVerifier.render();
      
      recaptchaLogger.info('Invisible reCAPTCHA verifier created with temp container');
      recaptchaLogger.endTimer(timerId, { success: true });
      
      // Publish reCAPTCHA creation event
      publish(AUTH_EVENTS.RECAPTCHA_RENDERED, {
        context: {
          type: 'invisible',
          timestamp: Date.now()
        }
      }, 'RecaptchaUtility');
      
      return recaptchaVerifier;
    }
    
    // For visible reCAPTCHA or invisible with specified container
    if (!options.containerId) {
      throw new AppError('Missing reCAPTCHA container ID', {
        userMessage: 'Security verification cannot be initialized due to missing container',
        category: 'recaptcha'
      });
    }
    
    // Get the container element - accept either string ID or element
    let containerElement: HTMLElement | string;
    
    if (typeof options.containerId === 'string') {
      const element = document.getElementById(options.containerId);
      if (!element) {
        recaptchaLogger.warn(`reCAPTCHA container not found: ${options.containerId}`);
        throw new AppError('reCAPTCHA container element not found', {
          userMessage: 'Security verification cannot be initialized. Please try again or use a different browser.',
          category: 'recaptcha'
        });
      }
      containerElement = element;
    } else {
      containerElement = options.containerId;
    }
    
    // Make sure the container is visible
    if (containerElement instanceof HTMLElement) {
      const style = window.getComputedStyle(containerElement);
      if (style.display === 'none') {
        recaptchaLogger.warn('reCAPTCHA container is hidden (display:none), which may cause issues');
        // Make it visible but nearly transparent to avoid UI issues
        containerElement.style.display = 'block';
        containerElement.style.height = '1px';
        containerElement.style.opacity = '0.01';
      }
    }
    
    // Create the reCAPTCHA verifier
    const recaptchaVerifier = new RecaptchaVerifier(
      auth, 
      containerElement,
      recaptchaOptions
    );
    
    // Render the reCAPTCHA to initialize it
    await recaptchaVerifier.render();
    
    recaptchaLogger.info('reCAPTCHA verifier created and rendered successfully');
    recaptchaLogger.endTimer(timerId, { success: true });
    
    // Publish reCAPTCHA creation event
    publish(AUTH_EVENTS.RECAPTCHA_RENDERED, {
      context: {
        type: isInvisible ? 'invisible' : 'visible',
        timestamp: Date.now()
      }
    }, 'RecaptchaUtility');
    
    return recaptchaVerifier;
  } catch (error) {
    recaptchaLogger.endTimer(timerId, { success: false });
    
    const processedError = processFirebaseError(
      error,
      'Failed to create reCAPTCHA verifier',
      {
        action: 'auth/recaptcha-create',
        userMessage: 'We couldn\'t initialize the security verification. Please try again or use a different browser.'
      }
    );
    
    recaptchaLogger.error('reCAPTCHA verifier creation failed', processedError);
    
    // Publish failure event
    publish(AUTH_EVENTS.RECAPTCHA_ERROR, {
      error: {
        message: processedError.message,
        code: processedError.firebaseCode
      },
      context: { timestamp: Date.now() }
    }, 'RecaptchaUtility');
    
    throw processedError;
  }
}

/**
 * Creates an invisible reCAPTCHA verifier for phone authentication
 * 
 * @param callback Optional callback function when verification succeeds
 * @param languageCode Optional language code for localization
 * @returns Promise resolving to a reCAPTCHA verifier object
 */
export async function createInvisibleRecaptcha(
  callback?: () => void,
  languageCode?: string
): Promise<ApplicationVerifier> {
  try {
    // Get Firebase Auth (directly in this function to ensure initialization)
    const { getAuth } = await import('firebase/auth');
    const auth = getAuth();
    
    // Set language for localization if provided
    if (languageCode) {
      auth.languageCode = languageCode;
      recaptchaLogger.info(`Set Firebase Auth language code to: ${languageCode}`);
    }
    
    recaptchaLogger.info('Creating invisible reCAPTCHA verifier');
    
    // Create RecaptchaVerifier directly with Firebase API
    const { RecaptchaVerifier } = await import('firebase/auth');
    
    // For invisible reCAPTCHA:
    // Create a container that is visible but nearly transparent
    // IMPORTANT: Don't use display:none as it can cause issues
    const container = document.createElement('div');
    container.id = 'recaptcha-invisible-container-' + Date.now();
    container.style.position = 'absolute';
    container.style.bottom = '0';
    container.style.opacity = '0.01'; // Nearly invisible, but not display:none
    document.body.appendChild(container);
    
    const recaptchaVerifier = new RecaptchaVerifier(
      auth,
      container,
      {
        size: 'invisible',
        callback
      }
    );
    
    // Render to initialize
    await recaptchaVerifier.render();
    recaptchaLogger.info('Invisible reCAPTCHA created and rendered successfully');
    
    return recaptchaVerifier;
  } catch (error) {
    const processedError = processFirebaseError(
      error,
      'Failed to create invisible reCAPTCHA verifier',
      {
        action: 'auth/recaptcha-create',
        userMessage: 'We couldn\'t initialize the security verification. Please try again or use a different browser.'
      }
    );
    
    recaptchaLogger.error('Invisible reCAPTCHA creation failed', processedError);
    throw processedError;
  }
}

/**
 * Creates a visible reCAPTCHA widget for phone authentication
 * 
 * @param containerId HTML element ID where the reCAPTCHA widget will be rendered
 * @param options Additional reCAPTCHA options
 * @returns Promise resolving to a reCAPTCHA verifier object
 */
export async function createVisibleRecaptcha(
  containerId: string,
  options: Omit<RecaptchaOptions, 'containerId' | 'isInvisible'> = {}
): Promise<ApplicationVerifier> {
  return createRecaptchaVerifier({
    ...options,
    containerId,
    isInvisible: false
  });
}

/**
 * Clears a reCAPTCHA verifier, resetting its state and removing it from the DOM
 * 
 * @param recaptchaVerifier The reCAPTCHA verifier to clear
 * @returns Promise that resolves when the verifier is cleared
 */
export async function clearRecaptchaVerifier(
  recaptchaVerifier: RecaptchaVerifier
): Promise<void> {
  try {
    recaptchaLogger.info('Clearing reCAPTCHA verifier');
    
    // Check if the verifier has a clear method
    if (recaptchaVerifier && typeof recaptchaVerifier.clear === 'function') {
      recaptchaVerifier.clear();
      recaptchaLogger.info('reCAPTCHA verifier cleared successfully');
      
      // Clean up dynamically created containers
      if (typeof document !== 'undefined') {
        // Find all dynamically created recaptcha containers and remove them
        const recaptchaContainers = document.querySelectorAll('div[id^="recaptcha-invisible-container-"]');
        recaptchaContainers.forEach(container => {
          try {
            if (container && container.parentNode) {
              container.parentNode.removeChild(container);
            }
          } catch (e) {
            // Ignore errors when removing elements
          }
        });
        
        // Also clean up any reCAPTCHA iframes and divs that might have been added
        const grecaptchaElements = document.querySelectorAll('div.grecaptcha-badge, iframe[src*="recaptcha"]');
        grecaptchaElements.forEach(element => {
          try {
            if (element && element.parentNode) {
              element.parentNode.removeChild(element);
            }
          } catch (e) {
            // Ignore errors when removing elements
          }
        });
      }
    } else {
      recaptchaLogger.warn('Could not clear reCAPTCHA verifier - object may be invalid');
    }
  } catch (error) {
    const normalizedError = normalizeError(
      error,
      'Failed to clear reCAPTCHA verifier',
      {
        category: 'firebase',
        userMessage: 'There was an issue cleaning up verification components.'
      }
    );
    
    recaptchaLogger.warn('Error while clearing reCAPTCHA verifier', normalizedError);
    // We don't throw here since this is a cleanup operation
  }
}

/**
 * Safe version of creating reCAPTCHA verifier with error handling
 */
export const safeCreateRecaptchaVerifier = withErrorHandling(createRecaptchaVerifier);

/**
 * Safe version of creating invisible reCAPTCHA with error handling
 */
export const safeCreateInvisibleRecaptcha = withErrorHandling(createInvisibleRecaptcha);

/**
 * Safe version of creating visible reCAPTCHA with error handling
 */
export const safeCreateVisibleRecaptcha = withErrorHandling(createVisibleRecaptcha);

/**
 * Safe version of clearing reCAPTCHA verifier with error handling
 */
export const safeClearRecaptchaVerifier = withErrorHandling(clearRecaptchaVerifier);

// Export as a default object for easier imports
export default {
  createRecaptchaVerifier,
  createInvisibleRecaptcha,
  createVisibleRecaptcha,
  clearRecaptchaVerifier,
  safeCreateRecaptchaVerifier,
  safeCreateInvisibleRecaptcha,
  safeCreateVisibleRecaptcha,
  safeClearRecaptchaVerifier
};