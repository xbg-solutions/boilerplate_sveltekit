/**
 * src/lib/services/auth/phone-auth.ts
 * Phone Authentication service
 * 
 * Provides functionality for Firebase Phone authentication:
 * - Sending verification codes
 * - Verifying codes
 * - Phone auth error handling
 */

import {
    PhoneAuthProvider,
    signInWithPhoneNumber,
    signInWithCredential
  } from 'firebase/auth';
  import { getFirebaseAuth, processFirebaseError } from '@xbg.solutions/frontend-core';
  import { loggerService } from '@xbg.solutions/frontend-core';
  import { publish } from '@xbg.solutions/frontend-core';
  import { AppError, normalizeError, withErrorHandling } from '@xbg.solutions/frontend-core';
  import { AUTH_EVENTS, CREATE_AUTH_USER_ON_FIRST_SIGNIN } from '@xbg.solutions/frontend-core';
  import type { PhoneAuthOptions, PhoneCodeVerifyOptions, AuthResult } from '@xbg.solutions/frontend-core';
  
  // Create a context-aware logger
  const phoneAuthLogger = loggerService.withContext('PhoneAuthService');
  
  /**
   * Sends a verification code to a phone number
   * 
   * @param options Phone authentication options
   * @returns Promise resolving to an object with verificationId
   */
  // Helper function that will be reimplemented in the future
export async function checkUserExistsAndCreate(phoneNumber: string): Promise<boolean> {
  // Feature currently disabled, always return true to continue normal flow
  phoneAuthLogger.info('User creation on first sign-in is disabled');
  return true;
}

export async function sendPhoneCode(options: PhoneAuthOptions): Promise<AuthResult & { verificationId?: string }> {
    const timerId = phoneAuthLogger.startTimer('sendPhoneCode');
    
    try {
      phoneAuthLogger.info('Sending phone verification code', { 
        phoneNumber: options.phoneNumber
      });
      
      // Auto-creation is disabled, but we'll keep the infrastructure for future reimplementation
      // This section will be reimplemented differently in the future
      
      const auth = await getFirebaseAuth();
      
      // Send verification code
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        options.phoneNumber,
        options.recaptchaVerifier
      );
      
      // Publish event
      publish(AUTH_EVENTS.PHONE_CODE_SENT, {
        context: { 
          phoneNumber: options.phoneNumber,
          timestamp: Date.now()
        }
      }, 'PhoneAuthService');
      
      phoneAuthLogger.endTimer(timerId, { success: true });
      
      return {
        success: true,
        verificationId: confirmationResult.verificationId,
        method: 'phoneNumber'
      };
    } catch (error) {
      phoneAuthLogger.endTimer(timerId, { success: false });
      
      const processedError = processFirebaseError(
        error,
        'Failed to send phone verification code',
        { 
          action: 'auth/phone-code-send',
          userMessage: 'We couldn\'t send a verification code to this phone number. Please check the number and try again.'
        }
      );
      
      phoneAuthLogger.error('Phone code sending failed', processedError, {
        phoneNumber: options.phoneNumber
      });
      
      // Publish failure event
      publish(AUTH_EVENTS.LOGIN_FAILURE, {
        error: {
          message: processedError.message,
          code: processedError.firebaseCode
        },
        method: 'phoneNumber',
        context: { phoneNumber: options.phoneNumber }
      }, 'PhoneAuthService');
      
      return {
        success: false,
        error: processedError,
        method: 'phoneNumber'
      };
    }
  }
  
  /**
   * Verifies a phone code and signs in the user
   * 
   * @param options Phone code verification options
   * @returns Promise resolving to authentication result
   */
  export async function verifyPhoneCode(options: PhoneCodeVerifyOptions): Promise<AuthResult> {
    const timerId = phoneAuthLogger.startTimer('verifyPhoneCode');
    
    try {
      // Publish verification start event
      publish(AUTH_EVENTS.PHONE_VERIFICATION_START, {
        context: { timestamp: Date.now() }
      }, 'PhoneAuthService');
      
      const auth = await getFirebaseAuth();
      
      phoneAuthLogger.info('Verifying phone code');
      
      // Create credential - no need to instantiate PhoneAuthProvider here
      const credential = PhoneAuthProvider.credential(
        options.verificationId,
        options.verificationCode
      );
      
      // Sign in with credential
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;
      
      // Publish success event
      publish(AUTH_EVENTS.PHONE_VERIFICATION_SUCCESS, {
        user,
        method: 'phoneNumber'
      }, 'PhoneAuthService');
      
      phoneAuthLogger.endTimer(timerId, { success: true });
      
      return {
        success: true,
        user,
        credential: userCredential,
        method: 'phoneNumber'
      };
    } catch (error) {
      phoneAuthLogger.endTimer(timerId, { success: false });
      
      const processedError = processFirebaseError(
        error,
        'Failed to verify phone code',
        { 
          action: 'auth/phone-code-verify',
          userMessage: 'The verification code is invalid or has expired. Please try again.'
        }
      );
      
      phoneAuthLogger.error('Phone code verification failed', processedError);
      
      // Publish failure event
      publish(AUTH_EVENTS.PHONE_VERIFICATION_FAILURE, {
        error: {
          message: processedError.message,
          code: processedError.firebaseCode
        },
        method: 'phoneNumber'
      }, 'PhoneAuthService');
      
      return {
        success: false,
        error: processedError,
        method: 'phoneNumber'
      };
    }
  }
  
  /**
   * Safely sends a phone verification code with error handling
   */
  export const safeSendPhoneCode = withErrorHandling(sendPhoneCode);
  
  /**
   * Safely verifies a phone code with error handling
   */
  export const safeVerifyPhoneCode = withErrorHandling(verifyPhoneCode);
  
  export default {
    sendPhoneCode,
    verifyPhoneCode,
    safeSendPhoneCode,
    safeVerifyPhoneCode,
    checkUserExistsAndCreate
  };