/** Legal modal content used by the footer. */
export const legalModalData = {
  privacy: {
    title: 'Privacy Policy',
    content: (
      <>
        <p className="text-base font-bold text-pf-editorial-ink">
          We respect your privacy.
        </p>
        <p>
          PixelForge processes limited information needed to operate the
          service, complete requested AI jobs, enforce usage limits, and handle
          feedback. It does not sell personal information or use behavioral
          advertising.
        </p>
        <ul className="mt-2 list-disc space-y-2 pl-5">
          <li>
            <strong>AI workflow files:</strong> Images and related inputs for
            AI-powered workflows are temporarily stored in Azure Blob Storage.
            The prepared inputs are sent to Replicate for the requested AI
            processing. Browser-only tools do not use Replicate.
          </li>
          <li>
            <strong>File cleanup:</strong> The backend attempts to delete an
            original upload after its job succeeds or fails. Generated result
            blobs become eligible for automated cleanup after 11 minutes, with
            the storage janitor running about every 5 minutes.
          </li>
          <li>
            <strong>Usage protection:</strong> A usage key derived from the
            client IP address and feature name supports rate limits and
            per-feature quotas. Usage rows become eligible for deletion after
            48 hours, with database cleanup running about every 12 hours.
          </li>
          <li>
            <strong>Bot verification:</strong> Cloudflare Turnstile verifies
            requests used by protected AI and feedback workflows. Uploaded
            images are not sent to Turnstile by PixelForge.
          </li>
          <li>
            <strong>Feedback:</strong> The name, email address, and message you
            submit are forwarded to Discord through the project&apos;s configured
            webhook so maintainers can review and respond.
          </li>
        </ul>
        <p>
          PixelForge is open source, so its current data-handling paths can be
          reviewed in the public repository.
        </p>
      </>
    ),
  },
  terms: {
    title: 'Terms of Service',
    content: (
      <>
        <p className="text-base font-bold text-pf-editorial-ink">
          Usage Guidelines
        </p>
        <p>By using PixelForge, you agree to these concise terms:</p>
        <ul className="mt-2 list-disc space-y-2 pl-5">
          <li>
            <strong>Your content:</strong> Only upload or process images that
            you own or have the necessary rights and permission to use.
          </li>
          <li>
            <strong>Acceptable use:</strong> Do not submit illegal or malicious
            content, attempt to bypass safeguards, or interfere with the
            service or other users.
          </li>
          <li>
            <strong>Shared resources:</strong> Do not run automated batch abuse
            or otherwise consume shared processing resources or third-party
            service quotas unfairly. Rate and feature limits may be enforced.
          </li>
          <li>
            <strong>No warranty:</strong> PixelForge is provided &quot;as is&quot;
            without warranties. You are responsible for keeping original files
            and reviewing the results of browser-based and AI-powered
            processing.
          </li>
          <li>
            <strong>Availability:</strong> Features, limits, providers, or the
            hosted service may be modified, suspended, or discontinued.
          </li>
        </ul>
      </>
    ),
  },
  security: {
    title: 'Security Measures',
    content: (
      <>
        <p className="text-base font-bold text-pf-editorial-ink">
          Keeping Your Data Safe
        </p>
        <p>
          PixelForge uses practical safeguards that match its current
          architecture without promising absolute security.
        </p>
        <ul className="mt-2 list-disc space-y-2 pl-5">
          <li>
            <strong>Protected transfers:</strong> AI uploads and results use
            time-limited signed Azure Blob Storage URLs.
          </li>
          <li>
            <strong>Provider boundaries:</strong> Azure stores temporary AI
            workflow files; Replicate performs remote AI inference. Cloudflare
            Turnstile provides bot verification.
          </li>
          <li>
            <strong>Validation and limits:</strong> The backend checks file
            type, size, and image dimensions and applies request, usage, and
            queue limits.
          </li>
          <li>
            <strong>Retention controls:</strong> Job lifecycle cleanup removes
            uploads after processing attempts, while scheduled cleanup removes
            expired results and usage records according to configured windows.
          </li>
          <li>
            <strong>Metadata:</strong> PixelForge does not use embedded image
            metadata for behavioral tracking or profiling. Uploaded files may
            contain metadata from their originating device or software and
            follow the same temporary processing and storage lifecycle.
          </li>
          <li>
            <strong>Open source review:</strong> The application and backend
            implementation are available for public inspection on GitHub.
          </li>
        </ul>
      </>
    ),
  },
  storage: {
    title: 'Cookies & Storage',
    content: (
      <>
        <p className="text-base font-bold text-pf-editorial-ink">
          Functional browser storage
        </p>
        <p>
          PixelForge uses browser storage to keep the application reliable and
          remember choices; it is not used by PixelForge for behavioral
          advertising.
        </p>
        <ul className="mt-2 list-disc space-y-2 pl-5">
          <li>
            <strong>Local storage:</strong> Saves theme and tool preferences,
            workflow status, job and result recovery details, and a local
            feedback-rate reminder.
          </li>
          <li>
            <strong>IndexedDB:</strong> Can retain the selected workspace file
            in your browser so an interrupted AI workflow can recover.
          </li>
          <li>
            <strong>Session storage:</strong> Temporarily caches public runtime
            limits for the current browser session.
          </li>
          <li>
            <strong>Third-party storage:</strong> Cloudflare Turnstile may use
            its own necessary browser storage when providing bot verification.
          </li>
        </ul>
        <p>
          Clearing site data removes these local preferences and may prevent an
          in-progress workflow from recovering after a refresh. The current
          application source contains no advertising or behavioral analytics
          integration.
        </p>
      </>
    ),
  },
};
