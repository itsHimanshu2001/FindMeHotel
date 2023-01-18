const registerForm = document.getElementById("register-form");

const displayError = (message) => {
	let alertDiv = document.getElementById("flashMessages-alert");

	if (!alertDiv) {
		const flashMessageDiv = document.getElementById("flashMessages");

		alertDiv = document.createElement("div");
		alertDiv.classList.add("alert");
		alertDiv.classList.add("alert-danger");
		alertDiv.classList.add("alert-dismissible")
		alertDiv.classList.add("fade");
		alertDiv.classList.add("show");

		alertDiv.id = "flashMessages-alert";

		flashMessageDiv.appendChild(alertDiv);
	}

	alertDiv.innerHTML = `
	${message}
	<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
};

registerForm.addEventListener("submit", async function (event) {
	try {
		event.preventDefault();
		const formData = new FormData(registerForm);

		const body = {};

		for (var [key, value] of formData.entries()) {
			body[key] = value;
		}

		const response = await fetch('/register', {
			method: "POST",
			body: JSON.stringify(body),
			headers: {
					"Content-Type": "application/json"
			},
		});

		if (response.ok) {
			window.location = "/hotels";
			return;
		}

		const resJson = await response.json();
		displayError(resJson.message || 'Something went wrong!');
	} catch(err) {
		displayError('Something went wrong!');
	}
});
