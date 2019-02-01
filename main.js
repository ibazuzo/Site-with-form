const formValidation = {};

function init() {
    const form = document.getElementById('form');
    // form.onsubmit = submit;


    document.addEventListener('blur', event => {

        formValidation[event.target.id] = event.target.validity.valid;

        let error = hasError(event.target);

        if (error) {
            showError(event.target, error);
            return;
        }

        removeError(event.target);

    }, true);

    document.addEventListener('submit', event => {

        // Get all of the form elements
        let fields = event.target.elements;
        resetServerResponse();

        // Validate each field
        // Store the first field with an error to a variable so we can bring it into focus later
        let error, hasErrors;
        for (let i = 0; i < fields.length; i++) {
            error = hasError(fields[i]);
            if (error) {
                showError(fields[i], error);
                if (!hasErrors) {
                    hasErrors = fields[i];
                }
            }
        }

        // If there are errors, don't submit form and focus on first element with error
        if (hasErrors) {
            event.preventDefault();
            hasErrors.focus();
        } 
        // Otherwise, check server response
        else checkServer();

    }, false);
}

// Validate the field
function hasError(field) {

    // Don't validate submits, buttons, file and reset inputs, and disabled fields
    if (field.disabled || field.type === 'file' || field.type === 'reset' || field.type === 'submit' || field.type === 'button') return;

    // Get validity
    let validity = field.validity;

    // If valid, return null
    if (validity.valid) return;

    // If field is required and empty
    if (validity.valueMissing) return 'Please fill out this field.';

    // If not the right type
    if (validity.typeMismatch) {

        // Email
        if (field.type === 'email') return 'Please enter an email address.';


    }

    // If too short
    if (validity.tooShort) return `Please lengthen this text to ${field.getAttribute('minLength')} characters or more. You are currently using ${field.value.length} characters.`;

    // If too long
    if (validity.tooLong) return `Please shorten this text to no more than ${field.getAttribute('maxLength')} characters. You are currently using ${field.value.length} characters.`;

    // If number input isn't a number
    if (validity.badInput) return 'Please enter a number.';

    // If a number value doesn't match the step interval
    if (validity.stepMismatch) return 'Please select a valid value.';

    // If a number field is over the max
    if (validity.rangeOverflow) return `Please select a value that is no more than ${field.getAttribute('max')}.`;

    // If a number field is below the min
    if (validity.rangeUnderflow) return `Please select a value that is no less than ${field.getAttribute('min')}.`;

    // If pattern doesn't match
    if (validity.patternMismatch) {

        // If pattern info is included, return custom error
        if (field.hasAttribute('title')) return field.getAttribute('title');

        // Otherwise, generic error
        return 'Please match the requested format.';

    }

    // If all else fails, return a generic catchall error
    return 'The value you entered for this field is invalid.';

};

function showError(field, error) {

    // Add error class to field
    field.classList.add('error');

    // If the field is a radio button and part of a group, error all and get the last item in the group
    if (field.type === 'radio' && field.name) {
        let group = document.getElementsByName(field.name);
        if (group.length > 0) {
            for (let i = 0; i < group.length; i++) {
                // Only check fields in current form
                if (group[i].form !== field.form) continue;
                group[i].classList.add('error');
            }
            field = group[group.length - 1];
        }
    }

    // Get field id or name
    let id = field.id || field.name;
    if (!id) return;

    // Check if error message field already exists
    // If not, create one
    let message = field.form.querySelector(`.error-message#error-for-${id}`);
    if (!message) {
        message = document.createElement('div');
        message.className = 'error-message';
        message.id = `error-for-${id}`;

        // If the field is a radio button or checkbox, insert error after the label
        let label;
        if (field.type === 'radio' || field.type === 'checkbox') {
            label = field.form.querySelector(`label[for="${id}"]`) || field.parentNode;
            if (label) {
                label.parentNode.insertBefore(message, label.nextSibling);
            }
        }

        // Otherwise, insert it after the field
        if (!label) {
            field.parentNode.insertBefore(message, field.nextSibling);
        }
    }

    // Add aria role to the field for screen readers
    field.setAttribute('aria-describedby', `error-for-${id}`);

    // Update error message
    message.innerHTML = error;

    // Show error message
    message.style.display = 'block';
    message.style.visibility = 'visible';

}

// Remove error message
function removeError(field) {

    // Remove error class to field
    field.classList.remove('error');

    // If the field is a radio button and part of a group, remove error from all and get the last item in the group
    if (field.type === 'radio' && field.name) {
        let group = document.getElementsByName(field.name);
        if (group.length > 0) {
            for (let i = 0; i < group.length; i++) {
                // Only check fields in current form
                if (group[i].form !== field.form) continue;
                group[i].classList.remove('error');
            }
            field = group[group.length - 1];
        }
    }

    // Remove aria role from the field
    field.removeAttribute('aria-describedby');

    // Get field id or name
    let id = field.id || field.name;
    if (!id) return;

    // Check if an error message is in the DOM
    let message = field.form.querySelector(`.error-message#error-for-${id}`);
    if (!message) return;

    // If error message is found, hide it
    message.innerHTML = '';
    message.style.display = 'none';
    message.style.visibility = 'hidden';
}

function checkServer() {
    event.preventDefault();

    // API location
    const url = 'https://actum-form-ulcrunoxba.now.sh/api/submit';

    const name = document.getElementById('formName').value;
    const surname = document.getElementById('formSurname').value;
    const date = document.getElementById('formDateOfBirth').value;
    const email = document.getElementById('formEmail').value;

    const genderMale = document.getElementById('formGenderMale');
    const gender = genderMale.checked ? true : false;
    const childrens = document.getElementById('formNumberChildren').value;

    const data = { name, surname, date, email, gender, childrens };

    // Get the response from server
    fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(response => showResponseMessage(response));
}

// Display Server response
function showResponseMessage(response) {
    const messageContainer = document.getElementById('serverResponse');

    // Add the coresponding class for the submition status message
    if (response.success) {
        messageContainer.classList.add("alert-success");
    } else {
        messageContainer.classList.add('alert-danger');
    }

    // Set the submition status message
    messageContainer.innerHTML = response.message;
}

// Reset the server response that was displayed on screen
function resetServerResponse() {
    const messageContainer = document.getElementById('serverResponse');

    messageContainer.innerHTML = "";
    messageContainer.className = "alert";

}

window.onload = init;