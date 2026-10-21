(() => {
  const form = document.querySelector('#signup-form');
  const steps = [...document.querySelectorAll('.form-step')];
  const stepNav = [...document.querySelectorAll('[data-step-nav]')];
  const backButton = document.querySelector('#back-button');
  const nextButton = document.querySelector('#next-button');
  const billingSwitch = document.querySelector('#billing-switch');
  const summary = document.querySelector('#summary');
  const state = { step: 1, yearly: false, confirmed: false };
  const planInfo = {
    arcade: { name: 'Arcade', monthly: 9, yearly: 90 },
    advanced: { name: 'Advanced', monthly: 12, yearly: 120 },
    pro: { name: 'Pro', monthly: 15, yearly: 150 },
  };
  const addonInfo = {
    online: { name: 'Online service', monthly: 1, yearly: 10 },
    storage: { name: 'Larger storage', monthly: 2, yearly: 20 },
    profile: { name: 'Customizable Profile', monthly: 2, yearly: 20 },
  };

  const money = (amount) => `$${amount}/${state.yearly ? 'yr' : 'mo'}`;
  const selectedPlan = () => form.querySelector('input[name="plan"]:checked')?.value;
  const selectedAddons = () => [...form.querySelectorAll('input[name="addon"]:checked')].map((input) => input.value);

  function showStep(step) {
    state.step = step;
    steps.forEach((section) => {
      const isCurrent = Number(section.dataset.step) === step;
      section.hidden = !isCurrent;
      section.classList.toggle('is-visible', isCurrent);
    });
    stepNav.forEach((item) => {
      const isCurrent = Number(item.dataset.stepNav) === step;
      item.classList.toggle('is-active', isCurrent);
      if (isCurrent) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });
    document.querySelectorAll('.mobile-step-dots i').forEach((dot, index) => dot.classList.toggle('is-active', index + 1 === Math.min(step, 4)));
    backButton.hidden = step === 1 || step === 5;
    nextButton.hidden = step === 5;
    nextButton.textContent = step === 4 ? 'Confirm' : 'Next Step';
    nextButton.classList.toggle('is-confirm', step === 4);
    document.querySelector('#form-actions').hidden = step === 5;
    if (step === 4) renderSummary();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function setError(id, message) {
    const field = document.querySelector(`[data-field="${id}"]`);
    const input = document.querySelector(`#${id}`);
    field.classList.toggle('has-error', Boolean(message));
    field.querySelector('.error-message').textContent = message;
    input.setAttribute('aria-invalid', Boolean(message));
  }

  function validatePersonalInfo() {
    const name = document.querySelector('#name');
    const email = document.querySelector('#email');
    const phone = document.querySelector('#phone');
    const emailOkay = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());
    const phoneOkay = /^[+\d][\d\s().-]{5,}$/.test(phone.value.trim());
    setError('name', name.value.trim() ? '' : 'This field is required');
    setError('email', !email.value.trim() ? 'This field is required' : emailOkay ? '' : 'Enter a valid email');
    setError('phone', !phone.value.trim() ? 'This field is required' : phoneOkay ? '' : 'Enter a valid phone number');
    const firstInvalid = form.querySelector('.field.has-error input');
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  function validatePlan() {
    const error = document.querySelector('#plan-error');
    if (selectedPlan()) {
      error.hidden = true;
      document.querySelector('.plan-grid').removeAttribute('aria-invalid');
      return true;
    }
    error.hidden = false;
    const planGrid = document.querySelector('.plan-grid');
    planGrid.setAttribute('aria-invalid', 'true');
    planGrid.querySelector('input').focus();
    return false;
  }

  function renderSummary() {
    const planKey = selectedPlan();
    if (!planKey) return;
    const plan = planInfo[planKey];
    const cadencePrice = plan[state.yearly ? 'yearly' : 'monthly'];
    const addons = selectedAddons();
    const total = cadencePrice + addons.reduce((sum, key) => sum + addonInfo[key][state.yearly ? 'yearly' : 'monthly'], 0);
    const cadence = state.yearly ? 'year' : 'month';
    summary.innerHTML = `
      <div class="summary-plan">
        <div class="summary-plan-title"><strong>${plan.name} (${state.yearly ? 'Yearly' : 'Monthly'})</strong><button type="button" data-edit-step="2">Change</button></div>
        <span class="summary-plan-price">${money(cadencePrice)}</span>
      </div>
      <div class="summary-addons">${addons.length ? addons.map((key) => `<div class="summary-addon"><button type="button" data-edit-step="3">${addonInfo[key].name}</button><span>+${money(addonInfo[key][state.yearly ? 'yearly' : 'monthly'])}</span></div>`).join('') : '<span class="summary-addon"><span>No add-ons selected</span><span>—</span></span>'}</div>
    `;
    const totalRow = document.createElement('div');
    totalRow.className = 'summary-total';
    totalRow.innerHTML = `<span>Total (per ${cadence})</span><strong>${money(total)}</strong>`;
    summary.append(totalRow);
  }

  function updateBilling() {
    const billingName = state.yearly ? 'yearly' : 'monthly';
    document.body.classList.toggle('is-yearly', state.yearly);
    billingSwitch.setAttribute('aria-checked', String(state.yearly));
    document.querySelectorAll('[data-billing-label]').forEach((label) => label.classList.toggle('is-current', label.dataset.billingLabel === billingName));
    document.querySelectorAll('[data-monthly][data-yearly]').forEach((price) => { price.textContent = price.dataset[billingName]; });
    if (state.step === 4) renderSummary();
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (state.step === 1 && validatePersonalInfo()) showStep(2);
    else if (state.step === 2 && validatePlan()) showStep(3);
    else if (state.step === 3) showStep(4);
    else if (state.step === 4) {
      state.confirmed = true;
      showStep(5);
      document.querySelector('.mobile-step-dots').hidden = true;
    }
  });

  backButton.addEventListener('click', () => { if (state.step > 1) showStep(state.step - 1); });
  billingSwitch.addEventListener('click', () => { state.yearly = !state.yearly; updateBilling(); });

  form.addEventListener('change', (event) => {
    if (event.target.matches('input[name="plan"]')) {
      document.querySelectorAll('.plan-card').forEach((card) => card.classList.toggle('is-selected', card.contains(event.target) && event.target.checked));
      document.querySelector('.plan-grid').removeAttribute('aria-invalid');
      document.querySelector('#plan-error').hidden = true;
    }
    if (event.target.matches('input[name="addon"]')) event.target.closest('.addon-card').classList.toggle('is-selected', event.target.checked);
    if (state.step === 4) renderSummary();
  });

  form.addEventListener('input', (event) => {
    const input = event.target;
    if (!input.matches('#name, #email, #phone')) return;
    const id = input.id;
    const error = document.querySelector(`[data-field="${id}"] .error-message`);
    if (error.textContent) setError(id, '');
  });

  summary.addEventListener('click', (event) => {
    const editButton = event.target.closest('[data-edit-step]');
    if (editButton) showStep(Number(editButton.dataset.editStep));
  });

  updateBilling();
  showStep(1);
})();
