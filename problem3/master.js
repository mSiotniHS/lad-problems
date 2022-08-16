import readlineSync from "readline-sync";

function generateNumberInRange(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateDigit() {
	return generateNumberInRange(0, 9);
}

function generateNumberWithUniqueDigits(digitCount) {
	let number = '';

	for (let i = 0; i < digitCount; i++) {
		let digit;
		do {
			digit = generateDigit().toString();
		} while (number.includes(digit));

		number += digit;
	}

	return number;
}

const digitCount = generateNumberInRange(3, 6);
const randomNumber = generateNumberWithUniqueDigits(digitCount);

let win = false;

console.log(`Угадайте ${digitCount}-значное число за 5 попыток!`);

for (let attemptsLeft = 5; attemptsLeft > 0; attemptsLeft--) {
	console.log(`Попыток осталось: ${attemptsLeft}`);

	let guess;
	do {
		process.stdout.write("Ваша догадка:\n>> ");
		guess = readlineSync.question();
	} while (isNaN(guess) || guess.length !== digitCount);

	if (guess === randomNumber) {
		win = true;
		break;
	}

	const correctDigits = [];
	const misplacedDigits = [];

	for (let i = 0; i < digitCount; i++) {
		const char = guess[i];

		if (char === randomNumber[i]) {
			correctDigits.push(char);
		} else if (randomNumber.includes(char)) {
			misplacedDigits.push(char);
		}
	}

	console.log(`*) Правильно расположенных цифр: ${correctDigits.length} шт. (${correctDigits.join(', ')})`);
	console.log(`*) Неправильно расположенных цифр: ${misplacedDigits.length} шт. (${misplacedDigits.join(', ')})`);

	console.log();
}

if (win) {
	console.log("Вы выиграли :)");
} else {
	console.log(`Вы проиграли :(\nЗагаданное число: ${randomNumber}`);
}
