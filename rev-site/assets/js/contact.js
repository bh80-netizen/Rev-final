/* The visible email and mailto links work without JavaScript. */
const copyEmailButton = document.querySelector('#copy-email');
const contactEmail = document.querySelector('#contact-email');
const copyEmailStatus = document.querySelector('#copy-status');

if (copyEmailButton && contactEmail && copyEmailStatus) {
  copyEmailButton.hidden = false;
  copyEmailButton.addEventListener('click', async () => {
    const email = contactEmail.textContent.trim();
    copyEmailButton.disabled = true;
    copyEmailStatus.textContent = '';

    try {
      await navigator.clipboard.writeText(email);
      copyEmailStatus.textContent = 'Email address copied!';
    } catch {
      // Clipboard access may be unavailable or denied. Keep manual copy usable.
      const selection = window.getSelection();
      if (selection) {
        const range = document.createRange();
        range.selectNodeContents(contactEmail);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      copyEmailStatus.textContent = 'Automatic copy is unavailable. Select and copy the email address above, or use Email us.';
    } finally {
      copyEmailButton.disabled = false;
    }
  });
}
