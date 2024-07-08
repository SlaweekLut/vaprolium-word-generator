function createAlert(status, info, timer) {
	let alertContainer = document.querySelector('.alert__container');

	if (alertContainer === null) {
		alertContainer = document.createElement('div');
		alertContainer.classList.add('alert__container');
		document.body.appendChild(alertContainer);
	}

	const alertBody = document.createElement('div');
	alertBody.classList.add('alert');
	alertBody.classList.add(`alert--${status}`);

	const icons = {
		success: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: rgba(255, 255, 255, 1);transform: ;msFilter:;"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path><path d="M9.999 13.587 7.7 11.292l-1.412 1.416 3.713 3.705 6.706-6.706-1.414-1.414z"></path></svg>`,
		error: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: rgba(255, 255, 255, 1);transform: ;msFilter:;"><path d="M11 7h2v7h-2zm0 8h2v2h-2z"></path><path d="m21.707 7.293-5-5A.996.996 0 0 0 16 2H8a.996.996 0 0 0-.707.293l-5 5A.996.996 0 0 0 2 8v8c0 .266.105.52.293.707l5 5A.996.996 0 0 0 8 22h8c.266 0 .52-.105.707-.293l5-5A.996.996 0 0 0 22 16V8a.996.996 0 0 0-.293-.707zM20 15.586 15.586 20H8.414L4 15.586V8.414L8.414 4h7.172L20 8.414v7.172z"></path></svg>`,
		info: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: rgba(255, 255, 255, 1);transform: ;msFilter:;"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path><path d="M11 11h2v6h-2zm0-4h2v2h-2z"></path></svg>`,
		warn: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: rgba(255, 255, 255, 1);transform: ;msFilter:;"><path d="M11.001 10h2v5h-2zM11 16h2v2h-2z"></path><path d="M13.768 4.2C13.42 3.545 12.742 3.138 12 3.138s-1.42.407-1.768 1.063L2.894 18.064a1.986 1.986 0 0 0 .054 1.968A1.984 1.984 0 0 0 4.661 21h14.678c.708 0 1.349-.362 1.714-.968a1.989 1.989 0 0 0 .054-1.968L13.768 4.2zM4.661 19 12 5.137 19.344 19H4.661z"></path></svg>`
	};

	alertBody.innerHTML = `
		<div class="alert__icon alert__icon--${status}">
			${icons[status]}
		</div>
		<p class="alert__body">
			${info}
			<p class="alert__close">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: rgba(255, 255, 255, 1);transform: ;msFilter:;"><path d="m16.192 6.344-4.243 4.242-4.242-4.242-1.414 1.414L10.535 12l-4.242 4.242 1.414 1.414 4.242-4.242 4.243 4.242 1.414-1.414L13.364 12l4.242-4.242z"></path></svg>
			</p>
		</p>
	`;

	alertContainer.appendChild(alertBody);

	alertBody.querySelector('.alert__close').addEventListener('click', () => {
		alertBody.classList.add('remove');
		setTimeout(() => {
			alertBody.remove();
		}, 1000);
	});

	if (timer === Infinity) return;
	setTimeout(() => {
		alertBody.classList.add('remove');
		setTimeout(() => {
			alertBody.remove();
		}, 1000);
	}, timer);
}

export const alert = {
	success: (e, timer = 5000, closeBtn = false) => {
		console.log('%cSucces:', 'color: greenyellow', e);
		createAlert('success', e, timer);
	},
	error: (e, timer = 5000, closeBtn = false) => {
		console.log('%cError:', 'color: red', e);
		createAlert('error', e, timer);
	},
	info: (e, timer = 5000, closeBtn = false) => {
		console.log('%cInfo:', 'color: cornflowerblue', e);
		createAlert('info', e, timer);
	},
	warn: (e, timer = 5000, closeBtn = false) => {
		console.log('%cWarn:', 'color: orange', e);
		createAlert('warn', e, timer);
	}
};