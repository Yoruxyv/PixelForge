import { useState, useRef } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { DAY_MS } from '@/shared/lib/time';
import { submitFeedback } from './feedbackService';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+\.[^\s@.]+$/;
const FEEDBACK_LIMIT_KEY = 'pf_feedback_limit';

/**
 * FeedbackForm Component
 * * Renders a contact form allowing users to send feedback directly to Discord.
 * Includes Cloudflare Turnstile for bot protection and implements a client-side
 * rate-limiting check (backed by local storage) to prevent cascading API requests
 * if the user has already hit their daily submission limit.
 *
 * @returns {JSX.Element} The rendered form, success state, or rate-limited state.
 */
export default function FeedbackForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [turnstileToken, setTurnstileToken] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const turnstileRef = useRef(null);

  /**
   * Lazy Initialized Rate Limit State
   * By passing a function to useState, we evaluate local storage synchronously
   * during the initial render. This completely avoids the React "Cascading Render"
   * warning that happens when using useEffect to update state on mount.
   */
  const [isRateLimited, setIsRateLimited] = useState(() => {
    const limitHitTime = localStorage.getItem(FEEDBACK_LIMIT_KEY);

    if (!limitHitTime) return false;

    const timePassed = Date.now() - parseInt(limitHitTime, 10);
    if (timePassed < DAY_MS) {
      return true; // Still locked out
    } else {
      localStorage.removeItem(FEEDBACK_LIMIT_KEY); // Lock expired
      return false; // Unlock them
    }
  });

  /**
   * Handles form submission, triggers the API call, and handles specific
   * rate-limit errors thrown by the backend.
   * @param {SubmitEvent} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedMessage = formData.message.trim();

    if (!trimmedName) {
      setStatus('error');
      setErrorMsg('Please enter your name.');
      return;
    }

    if (!trimmedEmail) {
      setStatus('error');
      setErrorMsg('Please enter your email address.');
      return;
    }

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setStatus('error');
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (trimmedMessage.length < 10) {
      setStatus('error');
      setErrorMsg('Please enter at least 10 characters in your message.');
      return;
    }

    if (!turnstileToken) {
      setStatus('error');
      setErrorMsg('Please complete the verification before sending feedback.');
      return;
    }

    setStatus('loading');

    try {
      await submitFeedback(
        trimmedName,
        trimmedEmail,
        trimmedMessage,
        turnstileToken,
      );
      setStatus('success');
    } catch (err) {
      if (
        err.message === 'LIMIT_REACHED' ||
        err.message.includes('Rate limit')
      ) {
        localStorage.setItem(
          FEEDBACK_LIMIT_KEY,
          Date.now().toString(),
        );
        setIsRateLimited(true);
        return; // Exit early to render the locked UI immediately
      }

      setStatus('error');
      setErrorMsg(err.message || 'Failed to send feedback. Please try again.');

      if (turnstileRef.current) turnstileRef.current.reset();
      setTurnstileToken('');
    }
  };

  if (isRateLimited) {
    return (
      <div className="border-y border-pf-editorial-line bg-pf-editorial-base p-5 text-center animate-fade-in">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-pf-control bg-pf-danger-soft text-pf-danger">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <p className="mb-1 text-base font-bold text-pf-editorial-ink">Limit reached</p>
        <p className="text-sm text-pf-editorial-muted">
          You have reached your daily feedback limit. Please try again tomorrow.
        </p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="border-y border-pf-editorial-line bg-pf-editorial-base p-5 text-center animate-fade-in">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-pf-control bg-pf-success-soft text-pf-success">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="mb-1 text-base font-bold text-pf-editorial-ink">Message sent</p>
        <p className="text-sm text-pf-editorial-muted">
          Thank you for your feedback. Our team will review it shortly.
        </p>
      </div>
    );
  }

  const inputStyles =
    'w-full rounded-pf-control border border-pf-editorial-line bg-pf-editorial-base px-3.5 py-2.5 text-pf-editorial-ink outline-none transition-colors placeholder:text-pf-editorial-muted focus:border-pf-editorial-accent';

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="flex flex-col gap-3.5 text-sm animate-fade-in"
    >
      <input
        type="text"
        placeholder="Your Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
        className={inputStyles}
      />

      <input
        type="email"
        placeholder="Your Email Address"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
        className={inputStyles}
      />

      <textarea
        placeholder="How can we help you or improve?"
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        required
        minLength={10}
        maxLength={1000}
        rows={4}
        className={`${inputStyles} resize-none`}
      />

      <div className="flex justify-center my-1">
        <Turnstile
          ref={turnstileRef}
          siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
          onSuccess={setTurnstileToken}
          options={{ size: 'compact' }}
        />
      </div>

      {errorMsg && (
        <div className="rounded-pf-control border border-pf-danger bg-pf-danger-soft px-3 py-2 text-center text-xs font-medium text-pf-danger">
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="mt-1 flex w-full items-center justify-center gap-2 rounded-pf-control bg-pf-editorial-accent px-4 py-2.5 font-semibold text-white transition-colors hover:bg-pf-accent-hover active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none"
      >
        {status === 'loading' ? (
          <>
            <svg
              className="animate-spin h-4 w-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Sending...
          </>
        ) : (
          'Send Feedback'
        )}
      </button>
    </form>
  );
}
