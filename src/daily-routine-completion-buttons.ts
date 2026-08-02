const COMPLETION_BUTTON_CLASS = 'daily-routine-complete-button';
const NATIVE_CHECK_CLASS = 'daily-routine-native-check';

const style = document.createElement('style');
style.textContent = `
  .daily-routine-item {
    position: relative;
    gap: 14px;
  }

  .daily-routine-item .${NATIVE_CHECK_CLASS} {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    opacity: 0 !important;
    pointer-events: none !important;
  }

  .${COMPLETION_BUTTON_CLASS} {
    margin-inline-start: auto;
    order: 999;
    flex: 0 0 auto;
    min-width: 108px;
    min-height: 34px;
    padding: 7px 12px;
    border: 1px solid #171717;
    border-radius: 8px;
    background: #171717;
    color: #fff;
    font-family: inherit;
    font-size: 12px;
    font-weight: 700;
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    transition:
      transform 160ms ease,
      background-color 160ms ease,
      border-color 160ms ease,
      color 160ms ease,
      box-shadow 160ms ease;
  }

  .${COMPLETION_BUTTON_CLASS}:hover {
    transform: translateY(-1px);
    box-shadow: 0 5px 14px rgb(23 23 23 / 14%);
  }

  .${COMPLETION_BUTTON_CLASS}:focus-visible {
    outline: 2px solid #14b8a6;
    outline-offset: 2px;
  }

  .${COMPLETION_BUTTON_CLASS}.is-complete {
    border-color: #99e8da;
    background: #ecfdf8;
    color: #0f766e;
    box-shadow: none;
  }

  @media (max-width: 640px) {
    .daily-routine-item {
      gap: 10px;
    }

    .${COMPLETION_BUTTON_CLASS} {
      min-width: 96px;
      min-height: 32px;
      padding-inline: 10px;
      font-size: 11px;
    }
  }
`;
document.head.appendChild(style);

function updateCompletionButton(
  item: HTMLElement,
  checkbox: HTMLInputElement,
  button: HTMLButtonElement,
) {
  const isComplete = checkbox.checked || item.classList.contains('is-complete');

  // لا نكتب في DOM إلا عند تغيّر القيمة فعلاً — وإلا تتولد طفرات MutationObserver
  // تعيد استدعاء هذه الدالة في حلقة لا نهائية تجمد الصفحة
  if (button.classList.contains('is-complete') !== isComplete) {
    button.classList.toggle('is-complete', isComplete);
  }
  const pressed = String(isComplete);
  if (button.getAttribute('aria-pressed') !== pressed) {
    button.setAttribute('aria-pressed', pressed);
  }
  const ariaLabel = isComplete ? 'التراجع عن إكمال المهمة' : 'تأكيد إكمال المهمة';
  if (button.getAttribute('aria-label') !== ariaLabel) {
    button.setAttribute('aria-label', ariaLabel);
  }
  const label = isComplete ? 'تراجع عن الإكمال' : 'أكملت المهمة';
  if (button.textContent !== label) {
    button.textContent = label;
  }
}

function enhanceRoutineItem(item: HTMLElement) {
  const checkbox = item.querySelector<HTMLInputElement>('input[type="checkbox"]');
  if (!checkbox) return;

  checkbox.classList.add(NATIVE_CHECK_CLASS);

  let button = item.querySelector<HTMLButtonElement>(`.${COMPLETION_BUTTON_CLASS}`);
  if (!button) {
    button = document.createElement('button');
    button.type = 'button';
    button.className = COMPLETION_BUTTON_CLASS;

    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      checkbox.click();

      requestAnimationFrame(() => {
        updateCompletionButton(item, checkbox, button!);
        enhanceRoutineItems();
      });
    });

    checkbox.insertAdjacentElement('afterend', button);
  }

  updateCompletionButton(item, checkbox, button);
}

function enhanceRoutineItems() {
  document
    .querySelectorAll<HTMLElement>('.daily-routine-item')
    .forEach(enhanceRoutineItem);
}

const observer = new MutationObserver(enhanceRoutineItems);
observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['class', 'checked'],
});

enhanceRoutineItems();
