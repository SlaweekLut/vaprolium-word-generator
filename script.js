import { alert } from "./alerts.js";
import Modal from "./modals.js";

const CONSONANTS = 'bcdfghjklmnpqrstvwxz'
const VOWELS = 'aeiouy'
const syllableRegex = /[^aeiouy]*[aeiouy]+(?:[^aeiouy]*$|[^aeiouy](?=[^aeiouy]))?/gi;

function splitIntoSyllables(words) {
	if(words.indexOf('Нет правил перевода') > -1) return ['Нет правил перевода'];
	return words.match(syllableRegex);
}
function checkLastLetter(word) {
	if(CONSONANTS.indexOf(word[word.length - 1]) > -1) {
		return word += 'is'
	}
	else if(VOWELS.indexOf(word[word.length - 1]) > -1) {
		return word += 'nom'
	}
}
function upperFirstLetter(word) {
	word = word.toLowerCase();
	return word.charAt(0).toUpperCase() + word.slice(1);
}
function compareSyllables(firstWord, secondWord) {
	var firstSyllables = splitIntoSyllables(firstWord);
	var secondSyllables = splitIntoSyllables(secondWord);
	if(firstSyllables.length !== secondSyllables.length || firstSyllables[0] !== secondSyllables[0]) {
		return false;
	}
	var longerSyllables = firstSyllables.length > secondSyllables.length ? firstSyllables : secondSyllables;
	var comparisonResult = longerSyllables.map(function(syllable, index) {
			var syllable1 = firstSyllables[index];
			var syllable2 = secondSyllables[index];
			return syllable1 === syllable2;
	});

	return comparisonResult;
}
function reverseWord(word) {
	return word.toLowerCase().split('').reverse().join('');
}
function deleteLastSyllable(word) {
	return splitIntoSyllables(word).slice(0, -1).join('');
}
function removeLastNonMatchingChars(firstWord, secondWord) {
	let firstLength = firstWord.length;
	let secondLength = secondWord.length;
	let result = '';
	let minLength = firstLength < secondLength ? firstLength : secondLength;

	for(let i = 0; i < minLength; i++) {
		if(firstWord[i] === secondWord[i]) {
			result += firstWord[i];
		}
	}
	return result;
}
function getLastLetters(word, length) {
	return word.slice(word.length - length, word.length);
}
function getFirstLetters(word, length) {
	return word.slice(0, length);
}
function checkCVCLetters(word) {
	let wordFragment = getLastLetters(word, 3);
	if(CONSONANTS.indexOf(wordFragment[0]) > -1 && VOWELS.indexOf(wordFragment[1]) > -1 && CONSONANTS.indexOf(wordFragment[2]) > -1) {
		return true
	}
	return false
}
function replaceLettersToCVCFormat(word) {
	let wordFragment = getLastLetters(word, 3);

  if (
    wordFragment.split('').filter(letter => VOWELS.includes(letter)).length < 1 ||
    wordFragment.split('').filter(letter => CONSONANTS.includes(letter)).length < 2
  ) {
    return wordFragment;
  }

  let consonantsArr = [];
  let vowelsArr = [];

  for (let i = 0; i < wordFragment.length; i++) {
    if (CONSONANTS.includes(wordFragment[i])) {
      consonantsArr.push(wordFragment[i]);
    } else if (VOWELS.includes(wordFragment[i])) {
      vowelsArr.push(wordFragment[i]);
    }
  }

  return consonantsArr[0] + vowelsArr[0] + consonantsArr[1];
}

const translateRuToEn = async (word) => {
	const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${word}`);
	const data = await response.json();
	return data[0][0][0];
};
const translateRuToLat = async (word) => {
	const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=la&dt=t&q=${word}`);
	const data = await response.json();
	return data[0][0][0];
};
const translateRuToAngliton = async (word) => {
	let {enWord, latWord} = await translateWord(word);
	if(checkWordArticle(enWord)) enWord = enWord.split(' ')[1]
	if(checkWordArticle(latWord)) latWord = latWord.split(' ')[1]
	enWord = enWord.toLowerCase();
	latWord = latWord.toLowerCase();
	let result = `${enWord} - ${latWord} - Нет правила перевода`;
	let syllableEnWord = splitIntoSyllables(enWord.toLowerCase());
	let syllableLatWord = splitIntoSyllables(latWord.toLowerCase());
	if(enWord === latWord) {
		result = reverseWord(enWord);
		result = checkLastLetter(result)
	} else if(compareSyllables(latWord, enWord) !== false && !compareSyllables(latWord, enWord)?.at(-1)) {
		result = checkLastLetter(reverseWord(removeLastNonMatchingChars(enWord, latWord)));
	} else if(syllableLatWord.length === 1 && syllableEnWord.length === 1) {
		if(enWord.length < 3 && latWord.length < 3) {
			result = `${enWord}${latWord}`
		}
		if(latWord.length < 3) {
			return `${getLastLetters(enWord, 3)}${latWord}`
		}
		if(enWord.length < 3) {
			return `${enWord}${getLastLetters(latWord, 3)}`
		}
		result = `${getFirstLetters(enWord, 3)}${replaceLettersToCVCFormat(latWord)}`
	} else if(syllableEnWord.length === 1 && enWord.length >= 3) {
		result = ''
		result = `${enWord.slice(0, 3)}${syllableLatWord.at(-1)} or `
		result += `${enWord.slice(0, 3)}${syllableLatWord.at(-2)}${syllableLatWord.at(-1)}`
	} else if(syllableLatWord.length >= 3) {
		result = ''
		if(syllableEnWord.length >= 2) {
			result = `${syllableEnWord[0]}${syllableEnWord[1]}${syllableLatWord.at(-2)}${syllableLatWord.at(-1)} or `
		} 
		result += `${syllableEnWord[0]}${syllableLatWord.at(-2)}${syllableLatWord.at(-1)}`
	} else if (syllableLatWord.length < 3 && syllableEnWord.length > 0) {
		result = `${syllableEnWord[0]}${syllableLatWord.at(-1)}`
	}
	return upperFirstLetter(result.trim());
}
const translateWord = async (word) => {
	const enWord = await translateRuToEn(word);
	const latWord = await translateRuToLat(word);
	return {enWord, latWord};
} 
const checkWordArticle = (word) => {
	return word.split(' ').length > 1
}
const createConfirmationModal = (callbackConfirm, callbackCancel) => {
	const id = getUniqueId('confirmation-modal-');
	const confirmationModal = new Modal(id);

	const actions = document.createElement('div');
	actions.classList = 'modal__actions';

	const cancelButton = document.createElement('button');
	cancelButton.classList = 'button button--danger';
	cancelButton.innerHTML = 'Отмена';
	cancelButton.addEventListener('click', () => {
		confirmationModal.delete();
		callbackCancel();
	});
	actions.append(cancelButton);

	const confirmButton = document.createElement('button');
	confirmButton.classList = 'button button--primary';
	confirmButton.innerHTML = 'Подтвердить';
	confirmButton.addEventListener('click', () => {
		confirmationModal.delete();
		callbackConfirm();
	});
	actions.append(confirmButton);
	confirmationModal.append(actions);

	confirmationModal.show();
}
const createRowModal = (row, ruWord, enWord, latWord, anglitonWord) => {
	const id = getUniqueId('modal-');
	const modal = new Modal(id);

	const actions = document.createElement('div');
	actions.classList = 'modal__actions';

	const inputRu = document.createElement('input');
	inputRu.classList = 'modal__input';
	inputRu.value = ruWord;

	const inputEn = document.createElement('input');
	inputEn.classList = 'modal__input';
	inputEn.value = enWord;

	const inputLat = document.createElement('input');
	inputLat.classList = 'modal__input';
	inputLat.value = latWord;

	const inputAngl = document.createElement('input');
	inputAngl.classList = 'modal__input';
	inputAngl.value = anglitonWord;

	modal.append(inputRu, inputEn, inputLat, inputAngl);

	const editButton = document.createElement('button');
	editButton.classList = 'button button--primary';
	editButton.innerHTML = 'Изменить';
	editButton.addEventListener('click', () => {
		modal.hide();
		updateWordInDictionary({
			ruWord: upperFirstLetter(inputRu.value),
			enWord: upperFirstLetter(inputEn.value),
			latWord: upperFirstLetter(inputLat.value),
			anglitonWord: upperFirstLetter(inputAngl.value),
			row
		});
		modal.delete();
	});
	
	const deleteButton = document.createElement('button');
	deleteButton.classList = 'button button--danger';
	deleteButton.innerHTML = 'Удалить';
	deleteButton.addEventListener('click', () => {
		modal.hide();
		createConfirmationModal(() => {
			removeWordFromDictionary(ruWord, row);
			modal.delete();
		}, 
		() => {
			modal.show();
		});
	});

	actions.append(editButton);
	actions.append(deleteButton);
	modal.append(actions);

	row.addEventListener('click', () => {
		modal.show();
	})
}
const getUniqueId = (prefix = '') => {
	let id = `${prefix}${Math.random().toString(36).substring(7)}`
	if(document.getElementById(id)) {
		id = getUniqueId(prefix)
	}
	return id
}
const deleteRowElement = (row) => {
	row.remove();
}
const checkEditedCells = (defaultTranslate, ruWord, enWord, latWord, anglitonWord) => {
	return defaultTranslate.ruWord !== ruWord || defaultTranslate.enWord !== enWord || defaultTranslate.latWord !== latWord || defaultTranslate.anglitonWord !== anglitonWord
}
const getEditedCells = (defaultTranslate, ruWord, enWord, latWord, anglitonWord) => {
	if(!checkEditedCells(defaultTranslate, ruWord, enWord, latWord, anglitonWord) || !defaultTranslate) {
		return {
			isRuEdited: false,
			isEnEdited: false,
			isLatEdited: false,
			isAngEdited: false,
		}
	}
	return {
		isRuEdited: upperFirstLetter(ruWord) !== upperFirstLetter(defaultTranslate.ruWord),
		isEnEdited: upperFirstLetter(enWord) !== upperFirstLetter(defaultTranslate.enWord),
		isLatEdited: upperFirstLetter(latWord) !== upperFirstLetter(defaultTranslate.latWord),
		isAngEdited: upperFirstLetter(anglitonWord) !== upperFirstLetter(defaultTranslate.anglitonWord),
	}
}
const updateRowElement = ({row, ruWord, enWord, latWord, anglitonWord, defaultTranslate}) => {
	const cellRu = row.children[0];
	const cellEn = row.children[1];
	const cellLat = row.children[2];
	const cellAng = row.children[3];

	const {isRuEdited, isEnEdited, isLatEdited, isAngEdited} = getEditedCells(defaultTranslate, ruWord, enWord, latWord, anglitonWord);
	
	isRuEdited ? cellRu.classList.add('table__cell--edited') : cellRu.classList.remove('table__cell--edited');
	isEnEdited ? cellEn.classList.add('table__cell--edited') : cellEn.classList.remove('table__cell--edited');
	isLatEdited ? cellLat.classList.add('table__cell--edited') : cellLat.classList.remove('table__cell--edited');
	isAngEdited ? cellAng.classList.add('table__cell--edited') : cellAng.classList.remove('table__cell--edited');
	
	cellRu.innerHTML = ruWord;
	cellEn.innerHTML = enWord;
	cellLat.innerHTML = latWord;
	cellAng.innerHTML = anglitonWord;

	createRowModal(row, ruWord, enWord, latWord, anglitonWord)
}
const addRowElement = ({ruWord, enWord, latWord, anglitonWord, wordId, defaultTranslate = {}} = {}) => {
	let id = getUniqueId('row-');
	const row = document.createElement('tr');
	row.dataset.wordId = wordId;
	const {isRuEdited, isEnEdited, isLatEdited, isAngEdited} = getEditedCells(defaultTranslate, ruWord, enWord, latWord, anglitonWord);
	row.id = id;
	const cellRu = document.createElement('td');
	const cellEn = document.createElement('td');
	const cellLat = document.createElement('td');
	const cellAng = document.createElement('td');
	
	isRuEdited ? cellRu.classList.add('table__cell--edited') : cellRu.classList.remove('table__cell--edited');
	isEnEdited ? cellEn.classList.add('table__cell--edited') : cellEn.classList.remove('table__cell--edited');
	isLatEdited ? cellLat.classList.add('table__cell--edited') : cellLat.classList.remove('table__cell--edited');
	isAngEdited ? cellAng.classList.add('table__cell--edited') : cellAng.classList.remove('table__cell--edited');

	cellRu.innerHTML = ruWord;
	cellEn.innerHTML = enWord;
	cellLat.innerHTML = latWord;
	cellAng.innerHTML = anglitonWord;

	row.append(cellRu, cellEn, cellLat, cellAng);

	createRowModal(row, ruWord, enWord, latWord, anglitonWord)

	outputDictionary.append(row);
}

const TranslateForm = document.querySelector('#translateForm');
const SrcWord = document.querySelector('#srcword');
const outputEnglishWord = document.querySelector('#outputEnglishWord');
const outputLatinWord = document.querySelector('#outputLatinWord');
const outputAnglitonWord = document.querySelector('#outputAnglitonWord');

const outputEnglishSyllables = document.querySelector('#outputEnglishSyllables');
const outputLatinSyllables = document.querySelector('#outputLatinSyllables');
const outputAnglitonSyllables = document.querySelector('#outputAnglitonSyllables');

const outputFullWord = document.querySelector('#outputFullWord');

const outputDictionary = document.querySelector('#outputDictionary');

TranslateForm.addEventListener('submit', async (event) => {
	event.preventDefault();
	let ruWord = SrcWord.value
	if(checkThisWordInDictionary(ruWord)) return
	let {enWord, latWord} = await translateWord(ruWord);
	if(checkWordArticle(enWord)) enWord = enWord.split(' ')[1]
	if(checkWordArticle(latWord)) latWord = latWord.split(' ')[1]
	const anglitonWord = await translateRuToAngliton(ruWord);
	const enWordSyllables = splitIntoSyllables(enWord);
	const latWordSyllables = splitIntoSyllables(latWord);
	const anglitonWordSyllables = splitIntoSyllables(anglitonWord);
	
	outputEnglishWord.innerText = enWord;
	outputLatinWord.innerText = latWord;
	outputAnglitonWord.innerText = anglitonWord;

	outputEnglishSyllables.innerText = enWordSyllables.join(' ');
	outputLatinSyllables.innerText = latWordSyllables.join(' ');
	outputAnglitonSyllables.innerText = anglitonWordSyllables.join(' ');

	outputFullWord.innerText = `${ruWord} => ${enWord} + ${latWord} => ${anglitonWord}`

	addWordToDictionary({
		ruWord: ruWord,
		enWord: enWord,
		latWord: latWord,
		anglitonWord: anglitonWord
	})
})

function getDirectionary() {
	const dictionary = JSON.parse(localStorage.getItem('vaproliumDictionary'))
	outputDictionary.innerHTML = ''
	if(dictionary === null) return
	for (let i = 0; i < dictionary.length; i++) {
		const element = dictionary[i];
		addRowElement({
			ruWord: element.ruWord,
			enWord: element.enWord,
			latWord: element.latWord,
			anglitonWord: element.anglitonWord,
			wordId: element.id,
			defaultTranslate: element.defaultTranslate
		})
	}
}
function addWordToDictionary({ruWord, enWord, latWord, anglitonWord} = {}) {
	const dictionary = JSON.parse(localStorage.getItem('vaproliumDictionary')) ?? []
	const id = getUniqueId('word-')
	const defaultTranslate = {ruWord, enWord, latWord, anglitonWord}
	dictionary.push({id, ruWord, enWord, latWord, anglitonWord, defaultTranslate})
	localStorage.setItem('vaproliumDictionary', JSON.stringify(dictionary))
	addRowElement({
		ruWord,
		enWord,
		latWord,
		anglitonWord,
		wordId: id,
		defaultTranslate
	})
	alert.success(`Слово ${ruWord}(${anglitonWord}) добавлено в словарь`)
}
function checkThisWordInDictionary(word) {
	const dictionary = JSON.parse(localStorage.getItem('vaproliumDictionary'))
	if(dictionary === null) return false
	for (let i = 0; i < dictionary.length; i++) {
		const element = dictionary[i];
		if(element.ruWord === word) {
			alert.warn(`Такое слово уже есть в словаре.<br>Слово ${word} - ${element.anglitonWord}`)
			return true
		}
	}
	return false
}
function removeWordFromDictionary(word, row) {
	const dictionary = JSON.parse(localStorage.getItem('vaproliumDictionary'))
	if(dictionary === null) return
	for (let i = 0; i < dictionary.length; i++) {
		const element = dictionary[i];
		if(row.dataset.wordId === element.id) {
			dictionary.splice(i, 1)
			localStorage.setItem('vaproliumDictionary', JSON.stringify(dictionary))
			if(row) deleteRowElement(row, word)
			alert.success(`Слово ${word} удалено из словаря`)
			return
		}
	}
}
function updateWordInDictionary({ruWord, enWord, latWord, anglitonWord, row} = {}) {
	const dictionary = JSON.parse(localStorage.getItem('vaproliumDictionary'))
	if(dictionary === null) return
	for (let i = 0; i < dictionary.length; i++) {
		const element = dictionary[i];
		if(row.dataset.wordId === element.id) {
			dictionary[i] = {...dictionary[i], ruWord, enWord, latWord, anglitonWord}
			localStorage.setItem('vaproliumDictionary', JSON.stringify(dictionary))
			if(row) updateRowElement({
				row,
				ruWord,
				enWord,
				latWord,
				anglitonWord,
				defaultTranslate: element.defaultTranslate
			})
			alert.success(`Слово ${ruWord}(${anglitonWord}) обновлено`)
			return
		}
	}
}

getDirectionary()
