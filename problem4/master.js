import readlineSync from "readline-sync";

//<editor-fold desc="Helper Functions">

/**
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function generateNumberInRange(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * @param {number} value
 * @param {number} percentage
 * @returns {number}
 */
function subtractPercentage(value, percentage) {
	return value * (100 - percentage) / 100;
}

//</editor-fold>

// <editor-fold desc="Actor Prototypes">

/**
 * @typedef {object} Move
 * @property {string} name
 * @property {number} physicalDmg
 * @property {number} magicDmg
 * @property {number} physicArmorPercents
 * @property {number} magicArmorPercents
 * @property {number} cooldown
 */

/**
 * @typedef {object} ActorPrototype
 * @property {number} maxHealth
 * @property {string} name
 * @property {Move[]} moves
 */

/**
 * @typedef {object} Actor
 * @property {number} health
 * @property {number} chosenMove
 * @property {object} cooldowns
 * @property {ActorPrototype} prototype
 */

/** @type {ActorPrototype} */
const monsterPrototype = {
	maxHealth: 10,
	name: "Лютый",
	moves: [
		{
			"name": "Удар когтистой лапой",
			"physicalDmg": 3, // физический урон
			"magicDmg": 0,    // магический урон
			"physicArmorPercents": 20, // физическая броня
			"magicArmorPercents": 20,  // магическая броня
			"cooldown": 0     // ходов на восстановление
		},
		{
			"name": "Огненное дыхание",
			"physicalDmg": 0,
			"magicDmg": 4,
			"physicArmorPercents": 0,
			"magicArmorPercents": 0,
			"cooldown": 3
		},
		{
			"name": "Удар хвостом",
			"physicalDmg": 2,
			"magicDmg": 0,
			"physicArmorPercents": 50,
			"magicArmorPercents": 0,
			"cooldown": 2
		},
	]
};

/** @type {ActorPrototype} */
const playerPrototype = {
	maxHealth: 10,
	name: "Маг Евстафий",
	moves: [
		{
			"name": "Удар боевым кадилом",
			"physicalDmg": 2,
			"magicDmg": 0,
			"physicArmorPercents": 0,
			"magicArmorPercents": 50,
			"cooldown": 0
		},
		{
			"name": "Вертушка левой пяткой",
			"physicalDmg": 4,
			"magicDmg": 0,
			"physicArmorPercents": 0,
			"magicArmorPercents": 0,
			"cooldown": 4
		},
		{
			"name": "Каноничный фаербол",
			"physicalDmg": 0,
			"magicDmg": 5,
			"physicArmorPercents": 0,
			"magicArmorPercents": 0,
			"cooldown": 3
		},
		{
			"name": "Магический блок",
			"physicalDmg": 0,
			"magicDmg": 0,
			"physicArmorPercents": 100,
			"magicArmorPercents": 100,
			"cooldown": 4
		},
	]
};

//</editor-fold>

// <editor-fold desc="Game Logic">

/**
 * @param {Actor} attacker
 * @param {Actor} defender
 * @returns {number}
 */
function calculateDamage(attacker, defender) {
	const attack = {
		physical: attacker.prototype.moves[attacker.chosenMove].physicalDmg,
		magic: attacker.prototype.moves[attacker.chosenMove].magicDmg,
	};

	const defend = {
		physical: defender.prototype.moves[defender.chosenMove].physicArmorPercents,
		magic: defender.prototype.moves[defender.chosenMove].magicArmorPercents,
	};

	return subtractPercentage(attack.physical, defend.physical) + subtractPercentage(attack.magic, defend.magic);
}

/**
 * @param {Actor} actor
 * @returns {void}
 */
function updateCooldowns(actor) {
	for (const key in actor.cooldowns) {
		if (actor.cooldowns[key] === 1) {
			delete actor.cooldowns[key];
		} else {
			actor.cooldowns[key]--;
		}
	}

	const chosenMoveCooldown = actor.prototype.moves[actor.chosenMove].cooldown;
	if (chosenMoveCooldown !== 0) {
		actor.cooldowns[actor.chosenMove] = chosenMoveCooldown;
	}
}

/**
 * @param {Actor} actor
 * @returns {number[]}
 */
function availableMoves(actor) {
	let availableMoves = [];

	for (let i = 0; i < actor.prototype.moves.length; i++) {
		const moveNotUsed = !(i in actor.cooldowns);
		if (moveNotUsed) {
			availableMoves.push(i);
		}
	}

	return availableMoves;
}

/**
 * @param {Actor} actor1
 * @param {Actor} actor2
 * @returns {void}
 */
function performMoves(actor1, actor2) {
	if (actor1.chosenMove === -1 || actor2.chosenMove === -1) throw Error("Действия не выбраны");

	actor1.health -= calculateDamage(actor2, actor1);
	actor2.health -= calculateDamage(actor1, actor2);

	updateCooldowns(actor1);
	updateCooldowns(actor2);

	actor1.chosenMove = -1;
	actor2.chosenMove = -1;
}

/**
 * @param {Actor} actor
 * @returns {boolean}
 */
function isDead(actor) {
	return actor.health <= 0;
}

//</editor-fold>

// <editor-fold desc="Misc">

/**
 * @param {Move} move
 * @returns {string}
 */
function stringifyMove(move) {
	return `${move.name} { Атака: ${move.physicalDmg}/${move.magicDmg}, Защита: ${move.physicArmorPercents}/${move.magicArmorPercents} }`;
}

/**
 * @param {ActorPrototype} prototype
 * @param {number} healthDelta
 * @returns {Actor}
 */
function createActor(prototype, healthDelta) {
	return {
		health: prototype.maxHealth + healthDelta,
		chosenMove: -1,
		cooldowns: {},
		prototype: prototype
	};
}

// </editor-fold>

/**
 * @param {Actor} player
 * @param {Actor} monster
 */
function game(player, monster) {
	while (player.health >= 0 && monster.health >= 0) {
		console.clear();

		console.log("* Текущая ситуация");
		console.log(`${player.prototype.name}: ${player.health}  |  ${monster.prototype.name}: ${monster.health}\n`);

		const availablePlayerMoves = availableMoves(player);
		const availableMonsterMoves = availableMoves(monster);

		monster.chosenMove = availableMonsterMoves[
			generateNumberInRange(0, availableMonsterMoves.length - 1)
			];

		console.log("* Ход монстра");
		console.log(`${monster.prototype.name} решает разыграть...`);
		console.log(
			stringifyMove(
				monster.prototype.moves[monster.chosenMove]
			)
		);

		console.log("\n* Ход игрока");

		if (availablePlayerMoves.length !== player.prototype.moves.length) {
			console.log("На кулдауне:");
			for (const key in player.cooldowns) {
				console.log(`-) ${stringifyMove(player.prototype.moves[key])} (осталось ${player.cooldowns[key]} ходов)`);
			}
			console.log();
		}

		console.log("Доступные способности:");
		for (let i = 0; i < availablePlayerMoves.length; i++) {
			console.log(
				`${i + 1}) ${stringifyMove(
					player.prototype.moves[availablePlayerMoves[i]]
				)}`
			);
		}

		console.log("\nВыберите способность");
		let input;
		do {
			process.stdout.write(">> ");
			input = readlineSync.questionInt() - 1;
		} while (input < 0 || input >= availablePlayerMoves.length);

		player.chosenMove = availablePlayerMoves[input];

		performMoves(player, monster);
	}

	console.log();
	if (isDead(player) && isDead(monster)) {
		console.log("Ничья!");
	} else if (isDead(player)) {
		console.log("Вы проиграли :(");
	} else if (isDead(monster)) {
		console.log("Вы выиграли :)");
	} else {
		throw Error("Невозможное состояние игры");
	}
}

console.log(`Выберите уровень сложности:
1) Легко (10 hp)
2) Средне (9 hp)
3) Сложно (8 hp)
4) Экстремально (7 hp)`);

let input;
do {
	process.stdout.write(">> ");
	input = readlineSync.questionInt();
} while (input < 1 || input > 4);

const healthReduction = 1 - input;

const player = createActor(playerPrototype, healthReduction);
const monster = createActor(monsterPrototype, 0);

game(player, monster);
