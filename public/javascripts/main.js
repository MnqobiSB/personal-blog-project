// NAVBAR OPEN CLASS TOGGLER
$(function () {
  'use strict'

  $('[data-toggle="offcanvas"]').on('click', function () {
    $('.offcanvas-collapse').toggleClass('open')
  })
})

// PASSWORD VALIDATION
let setPasswordValue;
let confirmPasswordValue;
const registerBtn = document.getElementById('register-submit');
const setPassword = document.getElementById('set-password');
const confirmPassword = document.getElementById('re-password');
const registerValidationMessage = document.getElementById('registerValidation-message');
function registerValidatePasswords(message, add, remove) {
	registerValidationMessage.textContent = message;
	registerValidationMessage.classList.add(add);
	registerValidationMessage.classList.remove(remove);
}
confirmPassword.addEventListener('input', e => {
	e.preventDefault();
	setPasswordValue = setPassword.value;
	confirmPasswordValue = confirmPassword.value;
	if (setPasswordValue !== confirmPasswordValue) {
		registerValidatePasswords('Passwords must match.', 'color-red', 'color-green');
		registerBtn.setAttribute('disabled', true);
	} else {
		registerValidatePasswords('Passwords match.', 'color-green', 'color-red');
		registerBtn.removeAttribute('disabled');
	}
});