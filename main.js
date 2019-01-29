const formValidation = {};

function init() {
    const form = document.getElementById('form');
    form.onsubmit = submit;

    
    
}



function isFormValid() {
    for (key in formValidation) {
        if (formValidation[key] === false) {
            return false;
        }
    }

    return true;
}

function submit() {
    event.preventDefault();
    
    if (!isFormValid()) {
        console.log('asd');
        return;
    }

    resetServerResponse();

    const url = 'https://actum-form-ulcrunoxba.now.sh/api/submit';

    const name = document.getElementById('formName').value;
    const surname = document.getElementById('formSurname').value;
    const date = document.getElementById('formDateOfBirth').value;
    const email = document.getElementById('formEmail').value;

    const genderMale = document.getElementById('formGenderMale');
    const gender = genderMale.checked ? true : false;
    const childrens = document.getElementById('formNumberChildren').value;

    const data = { name, surname, date, email, gender, childrens };

    fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(response => showResponseMessage(response));
}

function showResponseMessage(response) {
    const messageContainer = document.getElementById('serverResponse');

    if (response.success) {
        messageContainer.classList.add("alert-success");
    } else {
        messageContainer.classList.add('alert-danger');
    }
    messageContainer.innerHTML = response.message;
}

function resetServerResponse() {
    const messageContainer = document.getElementById('serverResponse');

    messageContainer.innerHTML = "";
    messageContainer.className = "alert";

}

window.onload = init;