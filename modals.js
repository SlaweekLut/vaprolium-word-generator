class Modal {
	constructor(modalId) {
		this.modalId = modalId
		this.show = this.show.bind(this)
		this.hide = this.hide.bind(this)
		this.create()
		this.clickOutside()
	}
	create() {
		this.modal = document.createElement('div')
		this.modal.id = this.modalId
		this.modal.classList = 'modal'
		this.container = document.createElement('div')
		this.container.classList = 'modal__container'
		this.modal.append(this.container)
		document.body.appendChild(this.modal)
	}
	delete() {
		this.modal.remove()
	}
	show() {
		this.modal.classList.add('active')
	}
	hide() {
		this.modal.classList.remove('active')
	}
	append(...elements) {
		this.container.append(...elements)
	}
	clickOutside(callback) {
		this.modal.addEventListener('click', (event) => {
			if(event.target === this.modal) {
				if(callback) callback()
				this.hide()
			}
		})
	}
}

export default Modal