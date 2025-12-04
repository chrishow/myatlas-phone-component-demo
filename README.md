# Phone Input Web Component

A reusable Web Component for international phone number input with country code selection, built on top of [intl-tel-input](https://github.com/jackocnr/intl-tel-input).

## Features

- ✅ International phone number validation
- ✅ Country code selection with flags
- ✅ Automatic formatting
- ✅ Form integration with hidden input for E.164 format
- ✅ Custom events for change and validation
- ✅ Shadow DOM for style encapsulation
- ✅ Accessible and semantic HTML
- ✅ Full API for programmatic control

## Installation

1. Include the intl-tel-input library:
```html
<script src="https://cdn.jsdelivr.net/npm/intl-tel-input@25.12.5/build/js/intlTelInput.min.js"></script>
```

2. Include the Web Component:
```html
<script src="./phone-input.js"></script>
```

## Basic Usage

```html
<phone-input 
    name="phone" 
    label="Phone Number"
    required>
</phone-input>
```

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `name` | string | Name attribute for form submission |
| `value` | string | Initial phone number value |
| `label` | string | Label text for the input |
| `required` | boolean | Whether the field is required |
| `placeholder` | string | Placeholder text |
| `disabled` | boolean | Whether the input is disabled |
| `initial-country` | string | Initial country code (e.g., "us") |
| `country-order` | string | Comma-separated list of preferred countries |
| `separate-dial-code` | boolean | Show dial code separately from the input |

## Examples

### Pre-filled Value
```html
<phone-input 
    name="phone" 
    label="Contact Phone"
    value="+1 618-616-0134"
    required>
</phone-input>
```

### Custom Country Order
```html
<phone-input 
    name="phone" 
    label="Phone Number"
    country-order="es,gb,us"
    initial-country="es">
</phone-input>
```

### Separate Dial Code
```html
<phone-input 
    name="phone" 
    label="Phone Number"
    separate-dial-code>
</phone-input>
```

## Events

### `phone-change`
Fired when the phone number changes.

```javascript
phoneInput.addEventListener('phone-change', (e) => {
    console.log('Value:', e.detail.value);
    console.log('E.164 Number:', e.detail.number);
    console.log('Is Valid:', e.detail.isValid);
    console.log('Country:', e.detail.country);
});
```

### `phone-blur`
Fired when the input loses focus.

```javascript
phoneInput.addEventListener('phone-blur', (e) => {
    console.log('Blurred, number:', e.detail.number);
});
```

### `phone-valid`
Fired when validation is performed.

```javascript
phoneInput.addEventListener('phone-valid', (e) => {
    console.log('Is Valid:', e.detail.isValid);
    console.log('Error:', e.detail.error);
    console.log('Number:', e.detail.number);
});
```

## API Methods

### `isValid()`
Returns whether the current phone number is valid.

```javascript
const isValid = phoneInput.isValid();
```

### `getNumber()`
Returns the phone number in E.164 format (e.g., `+16186160134`).

```javascript
const number = phoneInput.getNumber();
```

### `getNumberFormatted()`
Returns the formatted phone number as displayed in the input.

```javascript
const formatted = phoneInput.getNumberFormatted();
```

### `getValidationError()`
Returns the validation error code (if any).

```javascript
const errorCode = phoneInput.getValidationError();
```

### `getSelectedCountryData()`
Returns the selected country data object.

```javascript
const country = phoneInput.getSelectedCountryData();
```

### `setNumber(number)`
Sets the phone number programmatically.

```javascript
phoneInput.setNumber('+34 657456789');
```

### `validate()`
Validates the current number and shows validation errors in the UI. Returns `true` if valid.

```javascript
const isValid = phoneInput.validate();
```

### `reset()`
Resets the input to its initial state.

```javascript
phoneInput.reset();
```

### `focus()`
Focuses the input.

```javascript
phoneInput.focus();
```

## Form Integration

The component automatically creates a hidden input with the phone number in E.164 format for form submission:

```html
<form id="myForm">
    <phone-input 
        name="contact_phone" 
        label="Phone Number"
        required>
    </phone-input>
    
    <button type="submit">Submit</button>
</form>

<script>
document.getElementById('myForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const phoneInput = document.querySelector('phone-input');
    
    // Validate before submission
    if (phoneInput.validate()) {
        const number = phoneInput.getNumber();
        console.log('Submitting:', number);
        // Submit form or make API call
    }
});
</script>
```

## Validation

The component validates:
- Empty required fields
- Phone numbers containing letters
- Invalid phone numbers (using intl-tel-input validation)
- Numbers that are too short or too long

Error messages are displayed below the input field.

## Styling

The component uses Shadow DOM for style encapsulation. It includes default Bootstrap-like styling, but you can customize it by modifying the styles in the `render()` method.

## Browser Support

Works in all modern browsers that support:
- Custom Elements (Web Components)
- Shadow DOM
- ES6 modules

## Dependencies

- [intl-tel-input](https://github.com/jackocnr/intl-tel-input) v25.12.5 or later

## License

MIT
