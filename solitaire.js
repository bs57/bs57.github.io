
// //Tell the library which element to use for the table
cards.init({ table: '#card-table' });

var cardHistory = (function () 
{

	var wholeHistory = [];

	function add(historyItem) {
		wholeHistory.push(historyItem);
	}

	function undo() {
		if (wholeHistory.length <= 0) {
			return;
		}
		var item = wholeHistory.pop();
		item.sourceSlot.acceptCard(item.card);
		item.destinationSlot.card = null;
	}

	function clean() {
		wholeHistory = [];
	}

	function HistoryItem(card, sourceSlot, destinationSlot) {
		this.init(card, sourceSlot, destinationSlot);
	}

	HistoryItem.prototype = {
		init: function (card, sourceSlot, destinationSlot) {
			this.card = card;
			this.sourceSlot = sourceSlot;
			this.destinationSlot = destinationSlot;
		}

	};
	return {
		add: add,
		undo: undo,
		clean: clean,
		HistoryItem: HistoryItem
	};
})();

var slots = (function () {
	var allSlots = [];
	var cardWidth = 69;
	var cardHeight = 94;

	function Slot(index, table) {
		this.init = function (index, table) {
			this.card = null;
			this.index = index;
			this.top = -1;
			this.left = -1;
			this.el = $('<div>' + '</div>').data('number', index)
				.css({
					width: cardWidth,
					height: cardHeight,
					"background": 'transparent',
					margin: 3,
					position: 'absolute',
				})
				.appendTo(table);
			allSlots.push(this);
		};
		this.moveTo = function (w, k, speed, callback) {
			var y = 95;
			var x = 80;

			var props = { top: y * w - (cardHeight / 2), left: x * k - (cardWidth / 2) };
			this.top = props.top;
			this.left = props.left;
			$(this.el).animate(props, speed || 1, callback);
			$(this.el).droppable({
				accept: '#card-table div',
				hoverClass: 'hovered',
				drop: handleCardDrop
			});
		};
		this.acceptCard = function (card) {
			if (this.card != null) {
				console.log('acceptCard - ' + this.index + ' I am not empty!');
				return;
			}
			card.moveTo(this.left + 38, this.top + 50);
			this.card = card;
		}

		this.init(index, table);
	}

	function handleCardDrop(event, ui) {
		var slotNumber = $(this).data('number');
		var card = ui.draggable.data('card');

		var currentSlot = slots.AllSlots.find(function (a) { return a.index === slotNumber });

		if (currentSlot.card === null) {
			var previousSlot = slots.AllSlots.find(function (a) { return a.index === Math.max(0, slotNumber - 1) });

			if (previousSlot.card !== null &&
				(previousSlot.card.suit === card.suit && (previousSlot.card.rank - card.rank === -1))) {
				ui.draggable.position({ of: $(this), my: 'left top', at: 'left top' });
				ui.draggable.draggable('option', 'revert', false);

				var sourceSlot = slots.AllSlots.find(function (a) { return a.card !== null && a.card.id === card.id });
				sourceSlot.card = null;
				currentSlot.card = card;
				cardHistory.add(new cardHistory.HistoryItem(card, sourceSlot, currentSlot));
			}
		}

	}

	return {
		Slot: Slot,
		AllSlots: allSlots
	}
})();

// Create the card slots
for (var w = 0; w < 8; w++) {
	for (var k = 0; k < 14; k++) {
		var currentIndex = (w * 14) + k;
		var slot = new slots.Slot(currentIndex, '#card-slots');
		slot.moveTo(w, k);
	}
}

var aces = [];
aces.push(new cards.Card('h', 1, '#card-table'));
aces.push(new cards.Card('s', 1, '#card-table'));
aces.push(new cards.Card('d', 1, '#card-table'));
aces.push(new cards.Card('c', 1, '#card-table'));
aces.push(new cards.Card('h', 1, '#card-table'));
aces.push(new cards.Card('s', 1, '#card-table'));
aces.push(new cards.Card('d', 1, '#card-table'));
aces.push(new cards.Card('c', 1, '#card-table'));
cards.shuffle(aces);

for (var i = 0; i < 8; i++) {
	var card = aces[i];
	slots.AllSlots[i * 14].acceptCard(card);
	card.showCard();
}

var twoDecks = [];
for (var i = 2; i <= 13; i++) {
	twoDecks.push(new cards.Card('h', i, '#card-table'));
	twoDecks.push(new cards.Card('s', i, '#card-table'));
	twoDecks.push(new cards.Card('d', i, '#card-table'));
	twoDecks.push(new cards.Card('c', i, '#card-table'));
	twoDecks.push(new cards.Card('h', i, '#card-table'));
	twoDecks.push(new cards.Card('s', i, '#card-table'));
	twoDecks.push(new cards.Card('d', i, '#card-table'));
	twoDecks.push(new cards.Card('c', i, '#card-table'));
}

cards.shuffle(twoDecks);

var cardsPtr = 0;
for (var i = 0; i < 8; i++) {
	for (var j = 2; j < 14; j++) {
		console.log(cardsPtr);
		slots.AllSlots[j + i * 14].acceptCard(twoDecks[cardsPtr]);
		cardsPtr += 1;
	}
}

for (var k = 0; k < slots.AllSlots.length; k++) {
	if (slots.AllSlots[k].card !== null)
	{ console.log(slots.AllSlots[k].card.shortName); }
}
// for (var j = 0; j < 8; j++) {
// 	for (var i = 0; i < 12; i++) {
// 		var currentIndex = (j * 12) + i;
// 		console.log('current index: ' + currentIndex);
// 		var card = twoDecks[currentIndex];
// 		card.moveTo((i + 2 /* leave 2 colums for: aces and empty space for next card*/) * 80, j * 95, 100, function () { });
// 		card.showCard();
// 		console.log('current slot index: ' + ((j * 11) + (j + 2) + i));
// 		slots.AllSlots[(j * 12) + (j + 1) + i].card = card;
// 	}
// }
$('#undo').click(function () {
	cardHistory.undo();
});

$('#secondChance').click(secondChance);

$('#newGameConfirm').click(newGame);

function newGame(){
	location.reload();
}

function secondChance() {
	var startingColumns = [0, 0, 0, 0, 0, 0, 0, 0];
	var cardsToReDraw = [];
	var allSlots = slots.AllSlots;
	for (var i = 0; i < 8; i++) {
		for (var j = 1; j < 14; j++) {
			var slotIdx = i * 14 + j;
			var prev = allSlots[slotIdx - 1];
			var cur = allSlots[slotIdx]
			if (cur.card === null || !(prev.card.isBlack === cur.card.isBlack && prev.card.rank - cur.card.rank === -1)) {
				startingColumns[i] = j;
				for (var w = j; w < 14; w++) {
					if (allSlots[i * 14 + w].card !== null) {
						cardsToReDraw.push(allSlots[i * 14 + w].card);
						allSlots[i * 14 + w].card = null;
					}
				}
				break;
			}
		}
	}

	cards.shuffle(cardsToReDraw);

	for (var i = 0; i < 8; i++) {
		for (var w = startingColumns[i] + 1/* leave empty space*/; w < 14; w++) {
			allSlots[i * 14 + w].acceptCard(cardsToReDraw.pop());
		}
	}
}




