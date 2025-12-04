/**
 * PhoneInput Web Component (Light DOM version)
 * A reusable web component that wraps intl-tel-input for international phone number input
 * Uses Light DOM instead of Shadow DOM for better compatibility with intl-tel-input
 */
class PhoneInput extends HTMLElement {
    constructor() {
        super();
        this._iti = null;
        this._initialized = false;

        // Error messages
        this.errorMap = [
            "Invalid number",
            "Please specify the country",
            "Too short",
            "Too long",
            "Invalid number"
        ];
    }

    static get observedAttributes() {
        return ['value', 'required', 'name', 'placeholder', 'disabled', 'label', 'initial-country'];
    }

    connectedCallback() {
        this.ensureIntlTelInputStyles();
        this.render();

        // Wait for next tick to ensure DOM is ready
        requestAnimationFrame(() => {
            this.loadIntlTelInput().then(() => {
                this.initializeIntlTelInput();
                this.attachEventListeners();
                this._initialized = true;
            }).catch(err => {
                console.error('Failed to load intl-tel-input:', err);
            });
        });
    }

    disconnectedCallback() {
        if (this._iti) {
            this._iti.destroy();
        }
    }

    ensureIntlTelInputStyles() {
        // Check if intl-tel-input CSS is already loaded
        if (!document.getElementById('intl-tel-input-styles')) {
            const link = document.createElement('link');
            link.id = 'intl-tel-input-styles';
            link.rel = 'stylesheet';
            link.href = 'https://cdn.jsdelivr.net/npm/intl-tel-input@25.12.5/build/css/intlTelInput.css';
            document.head.appendChild(link);
        }

        // Add component-specific styles
        if (!document.getElementById('phone-input-styles')) {
            const style = document.createElement('style');
            style.id = 'phone-input-styles';
            style.textContent = `
                phone-input {
                    display: block;
                }

                phone-input .form-group {
                    margin-bottom: 1rem;
                }

                phone-input label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 500;
                    color: #333;
                }

                phone-input .required-indicator {
                    color: #dc3545;
                    margin-left: 0.25rem;
                }

                phone-input .iti {
                    display: block;
                    width: 100%;
                }

                phone-input input[type="tel"] {
                    width: 100%;
                    padding: 0.5rem 0.75rem;
                    font-size: 1rem;
                    line-height: 1.5;
                    color: #495057;
                    background-color: #fff;
                    background-clip: padding-box;
                    border: 1px solid #ced4da;
                    border-radius: 0.25rem;
                    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
                    box-sizing: border-box;
                }

                phone-input input[type="tel"]:focus {
                    color: #495057;
                    background-color: #fff;
                    border-color: #80bdff;
                    outline: 0;
                    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
                }

                phone-input input[type="tel"]:disabled {
                    background-color: #e9ecef;
                    opacity: 1;
                    cursor: not-allowed;
                }

                phone-input input.is-invalid {
                    border-color: #dc3545;
                }

                phone-input .form-group:has(input.is-invalid) .invalid-feedback {
                    display: block;
                }

                phone-input input.is-invalid:focus {
                    border-color: #dc3545;
                    box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
                }

                phone-input .invalid-feedback {
                    display: none;
                    width: 100%;
                    margin-top: 0.25rem;
                    font-size: 0.875rem;
                    color: #dc3545;
                }

                phone-input input.is-invalid ~ .invalid-feedback {
                    display: block;
                }
            `;
            document.head.appendChild(style);
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (!this._initialized || oldValue === newValue) return;

        switch (name) {
            case 'value':
                this.setNumber(newValue);
                break;
            case 'disabled':
                const input = this.querySelector('input[type="tel"]');
                if (input) {
                    input.disabled = this.hasAttribute('disabled');
                }
                break;
            case 'required':
                const labelEl = this.querySelector('label');
                if (labelEl) {
                    this.updateRequiredIndicator(labelEl);
                }
                break;
            case 'label':
                const label = this.querySelector('label');
                if (label) {
                    label.childNodes[0].textContent = newValue || '';
                }
                break;
        }
    }

    async loadIntlTelInput() {
        // Check if intlTelInput is already loaded
        if (window.intlTelInput) {
            return;
        }

        // Load the library if not already present
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/intl-tel-input@25.12.5/build/js/intlTelInput.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    render() {
        const name = this.getAttribute('name') || 'phone';
        const value = this.getAttribute('value') || '';
        const label = this.getAttribute('label') || '';
        const placeholder = this.getAttribute('placeholder') || '';
        const disabled = this.hasAttribute('disabled');
        const required = this.hasAttribute('required');

        this.innerHTML = `
            <div class="form-group">
                ${label ? `<label for="${name}">${label}${required ? '<span class="required-indicator">*</span>' : ''}</label>` : ''}
                <input 
                    type="tel" 
                    id="${name}"
                    name="${name}-display"
                    value="${value}"
                    placeholder="${placeholder}"
                    ${disabled ? 'disabled' : ''}
                    ${required ? 'required' : ''}
                    autocomplete="tel"
                />
                <input type="hidden" name="${name}" value="${value}" />
                <div class="invalid-feedback"></div>
            </div>
        `;
    }

    initializeIntlTelInput() {
        const input = this.querySelector('input[type="tel"]');

        if (!input) {
            console.error('Input element not found');
            return;
        }

        if (!window.intlTelInput) {
            console.error('intlTelInput library not available on window');
            return;
        }

        const countryOrder = this.getAttribute('country-order')?.split(',').map(c => c.trim()) || ['us'];
        const initialCountry = this.getAttribute('initial-country') || undefined;
        const separateDialCode = this.hasAttribute('separate-dial-code');

        try {
            this._iti = window.intlTelInput(input, {
                loadUtils: () => import("https://cdn.jsdelivr.net/npm/intl-tel-input@25.12.5/build/js/utils.js"),
                separateDialCode: separateDialCode,
                autoPlaceholder: "off",
                countryOrder: countryOrder,
                validationNumberTypes: null,
                initialCountry: initialCountry,
            });

            console.log('intl-tel-input initialized successfully');
        } catch (err) {
            console.error('Error initializing intl-tel-input:', err);
            return;
        }

        // If there's an initial value, set it
        const initialValue = this.getAttribute('value');
        if (initialValue) {
            this.setNumber(initialValue);
        }
    }

    attachEventListeners() {
        const input = this.querySelector('input[type="tel"]');
        if (!input) return;

        const changeEvents = ['change', 'blur', 'keyup', 'paste', 'input', 'countrychange'];

        changeEvents.forEach(eventType => {
            input.addEventListener(eventType, () => {
                this.clearValidation();
                this.updateHiddenInput();

                // Dispatch custom event
                this.dispatchEvent(new CustomEvent('phone-change', {
                    detail: {
                        value: input.value,
                        number: this.getNumber(),
                        isValid: this.isValid(),
                        country: this._iti?.getSelectedCountryData()
                    },
                    bubbles: true,
                    composed: true
                }));
            });
        });

        input.addEventListener('blur', () => {
            this.dispatchEvent(new CustomEvent('phone-blur', {
                detail: {
                    value: input.value,
                    number: this.getNumber(),
                    isValid: this.isValid()
                },
                bubbles: true,
                composed: true
            }));
        });
    }

    updateHiddenInput() {
        const hiddenInput = this.querySelector('input[type="hidden"]');
        if (hiddenInput) {
            hiddenInput.value = this.getNumber();
        }
    }

    updateRequiredIndicator(labelEl) {
        const indicator = labelEl.querySelector('.required-indicator');
        if (this.hasAttribute('required') && !indicator) {
            labelEl.insertAdjacentHTML('beforeend', '<span class="required-indicator">*</span>');
        } else if (!this.hasAttribute('required') && indicator) {
            indicator.remove();
        }
    }

    clearValidation() {
        const input = this.querySelector('input[type="tel"]');
        if (input) {
            input.classList.remove('is-invalid');
        }
    }

    showValidationError(message) {
        const input = this.querySelector('input[type="tel"]');
        const feedback = this.querySelector('.invalid-feedback');

        if (input && feedback) {
            input.classList.add('is-invalid');
            feedback.textContent = message;
        }
    }

    // Public API methods

    isValid() {
        if (!this._iti) return false;
        const input = this.querySelector('input[type="tel"]');
        const value = input?.value.trim();

        if (!value) {
            return !this.hasAttribute('required');
        }

        if (/[a-zA-Z]/.test(value)) {
            return false;
        }

        return this._iti.isValidNumber();
    }

    getNumber() {
        return this._iti?.getNumber() || '';
    }

    getNumberFormatted() {
        const input = this.querySelector('input[type="tel"]');
        return input?.value || '';
    }

    getValidationError() {
        return this._iti?.getValidationError() || null;
    }

    getSelectedCountryData() {
        return this._iti?.getSelectedCountryData() || null;
    }

    setNumber(number) {
        if (!this._iti) return;

        const input = this.querySelector('input[type="tel"]');
        if (input) {
            this._iti.setNumber(number);
            this.updateHiddenInput();
        }
    }

    validate() {
        const input = this.querySelector('input[type="tel"]');
        const value = input?.value.trim();

        if (!value && this.hasAttribute('required')) {
            this.showValidationError('This field is required');
            this.dispatchValidEvent(false, 'This field is required');
            return false;
        }

        if (!value) {
            this.clearValidation();
            this.dispatchValidEvent(true, null);
            return true;
        }

        if (/[a-zA-Z]/.test(value)) {
            this.showValidationError('Phone number cannot contain letters');
            this.dispatchValidEvent(false, 'Phone number cannot contain letters');
            return false;
        }

        if (!this._iti.isValidNumber()) {
            const errorCode = this._iti.getValidationError();
            const msg = this.errorMap[errorCode] || 'Invalid number';
            this.showValidationError(msg);
            this.dispatchValidEvent(false, msg);
            return false;
        }

        this.clearValidation();
        this.dispatchValidEvent(true, null);
        return true;
    }

    dispatchValidEvent(isValid, error) {
        this.dispatchEvent(new CustomEvent('phone-valid', {
            detail: {
                isValid,
                error,
                number: this.getNumber()
            },
            bubbles: true,
            composed: true
        }));
    }

    reset() {
        const input = this.querySelector('input[type="tel"]');
        const initialValue = this.getAttribute('value') || '';

        if (input) {
            input.value = initialValue;
            this.setNumber(initialValue);
            this.clearValidation();
        }
    }

    focus() {
        const input = this.querySelector('input[type="tel"]');
        input?.focus();
    }

    get value() {
        return this.getNumber();
    }

    set value(val) {
        this.setNumber(val);
    }
}

// Define the custom element
customElements.define('phone-input', PhoneInput);
