import { alert } from "./alerts.js";

const CONSONANTS = 'bcdfghjklmnpqrstvwxz'
const VOWELS = 'aeiouy'
const syllableRegex = /[^aeiouy]*[aeiouy]+(?:[^aeiouy]*$|[^aeiouy](?=[^aeiouy]))?/gi;

function splitIntoSyllables(words) {
	if(words.indexOf('No Rule For Translate') > -1) return ['No Rule For Translate'];
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
	console.log(CONSONANTS.indexOf(wordFragment[0]) > -1, VOWELS.indexOf(wordFragment[1]) > -1, CONSONANTS.indexOf(wordFragment[2]) > -1);
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
	enWord = enWord.toLowerCase();
	latWord = latWord.toLowerCase();
	let result = `${enWord} - ${latWord} - No Rule For Translate`;
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
	return upperFirstLetter(result);
}
const translateWord = async (word) => {
	const enWord = await translateRuToEn(word);
	const latWord = await translateRuToLat(word);
	return {enWord, latWord};
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
	if(checkThisWordInDictionary(SrcWord.value)) return

	const {enWord, latWord} = await translateWord(SrcWord.value);
	const anglitonWord = await translateRuToAngliton(enWord, latWord);
	const enWordSyllables = splitIntoSyllables(enWord);
	const latWordSyllables = splitIntoSyllables(latWord);
	const anglitonWordSyllables = splitIntoSyllables(anglitonWord);
	
	outputEnglishWord.innerText = enWord;
	outputLatinWord.innerText = latWord;
	outputAnglitonWord.innerText = anglitonWord;

	outputEnglishSyllables.innerText = enWordSyllables.join(' ');
	outputLatinSyllables.innerText = latWordSyllables.join(' ');
	outputAnglitonSyllables.innerText = anglitonWordSyllables.join(' ');

	outputFullWord.innerText = `${SrcWord.value} => ${enWord} + ${latWord} => ${anglitonWord}`

	addWordToDictionary(SrcWord.value, enWord, latWord, anglitonWord)
})

function getDirectionary() {
	const dictionary = JSON.parse(localStorage.getItem('vaproliumDictionary'))
	outputDictionary.innerHTML = ''
	if(dictionary === null) return
	for (let i = 0; i < dictionary.length; i++) {
		const element = dictionary[i];
		outputDictionary.innerHTML += `<tr><td>${element.ruWord}</td><td>${element.enWord}</td><td>${element.latWord}</td><td>${element.anglitonWord}</td></tr>`
	}
}
function addWordToDictionary(ruWord, enWord, latWord, anglitonWord) {
	const dictionary = JSON.parse(localStorage.getItem('vaproliumDictionary')) ?? []
	dictionary.push({ruWord, enWord, latWord, anglitonWord})
	localStorage.setItem('vaproliumDictionary', JSON.stringify(dictionary))
	outputDictionary.innerHTML += `<tr><td>${ruWord}</td><td>${enWord}</td><td>${latWord}</td><td>${anglitonWord}</td></tr>`
	alert.success(`Word ${ruWord} - ${anglitonWord} added to dictionary`)
}
function checkThisWordInDictionary(word) {
	const dictionary = JSON.parse(localStorage.getItem('vaproliumDictionary'))
	if(dictionary === null) return false
	for (let i = 0; i < dictionary.length; i++) {
		const element = dictionary[i];
		if(element.ruWord === word) {
			alert.warn('This word already in dictionary')
			return true
		}
	}
	return false
}

getDirectionary()
