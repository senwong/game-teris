const canvas: HTMLCanvasElement = document.querySelector("#root");

const context = canvas.getContext("2d");
type Shape = Point[];
// xxxx
const shape1: Shape = [
	[0, 0],
	[1, 0],
	[2, 0],
	[3, 0],
];

// x
// xxx
const shape2: Shape = [
	[0, 0],
	[1, 0],
	[1, 1],
	[2, 1],
];

//   x
// xxx
const shape3: Shape = [
	[2, 0],
	[0, 1],
	[1, 1],
	[2, 1],
];

// xx
// xx
const shape4: Shape = [
	[0, 0],
	[0, 1],
	[1, 1],
	[1, 0],
];

//  x
// xxx
const shape5: Shape = [
	[1, 0],
	[0, 1],
	[1, 1],
	[2, 1],
];

// xx
//  xx
const shape6: Shape = [
	[0, 0],
	[1, 0],
	[1, 1],
	[2, 1],
];

//  xx
// xx
const shape7: Shape = [
	[0, 1],
	[1, 1],
	[1, 0],
	[2, 0],
];

const allShapes = [shape1, shape2, shape3, shape4, shape5, shape6, shape7];

const size = 10;

type Point = [number, number];

function renderBlock(x: number, y: number, color: string = "black") {
	context.fillStyle = color;
	context.fillRect(x * size + 1, y * size + 1, size - 1, size - 1);
}

function renderTet(tet: Tet) {
	tet.shape.forEach((block) => {
		const [x, y] = [block[0] + tet.point[0], block[1] + tet.point[1]];
		
		renderBlock(x, y);
	});
}



interface Tet {
	point: Point,
	shape: Shape,
}
function clearCanvas() {
	context.clearRect(0, 0, canvas.width, canvas.height);
}
const currentShape: Shape | null = null;
let blackArea: Point[] = []
function createNewTet(): Tet {
	const shapeName = Math.floor(Math.random() * allShapes.length);
	return {
		point: [0, 0],
		shape: allShapes[0],
	}
}
let currentTet = createNewTet();

function renderCurrentTet() {
	if (!currentTet) return;
	renderTet(currentTet)
}
function renderBlackArea() {
	blackArea.forEach(p => {
		renderBlock(p[0], p[1]);
	})
}
let workLoopTimer;

function workLoop() {
	workLoopTimer = setInterval(() => {
		clearCanvas();
		renderCurrentTet();
		renderBlackArea();
	}, 16);
}

function tetIsEnd(tet: Tet) {
	return tet.shape.some(b => {
		return (b[0] + tet.point[0]) * size >= canvas.width || (b[1] + tet.point[1]) * size >= canvas.height
	})
}

function autoDescend() {
	const timer = setInterval(() => {
		moveDown();
	}, 1000);
}

function isValidPoint(p: Point) {
	return p[0] >= 0
		&& (p[0] * size + size) <= canvas.width
		&& p[1] >= 0
		&& (p[1] * size + size) <= canvas.height;
}
function pointIsOverLeftOrRight(p: Point) {
	return p[0] < 0 || (p[0] * size + size) > canvas.width || blackArea.some(blackPoint => blackPoint[0] === p[0] && blackPoint[1] === p[1]);
}

function pointIsArriveBottom(p: Point) {
	return p[1] * size + size > canvas.height || blackArea.some(blackPoint => p[1] === blackPoint[1] && p[0] === blackPoint[0]);
}

function tetIsOverLeftOrRight(tet: Tet) {
	return tet.shape.some(p => pointIsOverLeftOrRight(
		[tet.point[0] + p[0], tet.point[1] + p[1]]
	));
}

function tetIsArriveBottom(tet: Tet) {
	return tet.shape.some(p => pointIsArriveBottom(
		[tet.point[0] + p[0], tet.point[1] + p[1]]
	));
}

function moveLeft() {
	const newPoint: Point = [currentTet.point[0] - 1, currentTet.point[1]];
	if (tetIsOverLeftOrRight({ point: newPoint, shape: currentTet.shape })) {
		return;
	}
	currentTet.point = newPoint
}

function moveRight() {
	const newPoint: Point = [currentTet.point[0] + 1, currentTet.point[1]];
	console.log('new Point', newPoint);
	console.log()
	if (tetIsOverLeftOrRight({ point: newPoint, shape: currentTet.shape })) {
		return;
	}
	currentTet.point = newPoint
}

function clearFilledRow() {
	let lastRowPoints = 0;
	let otherPointes = [];
	while (true) {
		
		blackArea.forEach(p => {
			if (p[1] * size + size === canvas.height) {
				lastRowPoints++;
			} else {
				otherPointes.push([ p[0], p[1] + 1 ]);
			}
		});
		if (lastRowPoints * size >= canvas.width) {
			blackArea = otherPointes;
			lastRowPoints = 0
		} else {
			return;
		}
	}
}

function moveDown() {
	if (!currentTet) return;
	const newPoint: Point = [currentTet.point[0], currentTet.point[1] + 1];
	if (tetIsArriveBottom({ point: newPoint, shape: currentTet.shape })) {
		blackArea = blackArea.concat(currentTet.shape.map(p => ([
			currentTet.point[0] + p[0], currentTet.point[1] + p[1]
		])));
		currentTet = createNewTet();
		clearFilledRow();
	} else {
		currentTet.point = newPoint
	}
}

function rotatePoint(point: Point): Point {
	return [-1 * point[1], point[0]];
}

// 顺时针旋转
function rotateTet(tet: Tet) {
	const newShape = tet.shape.map(rotatePoint)
	if (newShape.every(p => isValidPoint([p[0] + tet.point[0], p[1] + tet.point[1]]))) {
		tet.shape = newShape
	}
}

function isAtEnd(tet: Tet) {
	return tet.shape.some(p => {
		return (p[1] + tet.point[1]) + size + size === canvas.height;
	});
}


function initKeyboardEvent() {
	// ArrowRight
	// ArrowLeft
	// ArrowDown
	// ArrowUp
	document.addEventListener('keydown', ev => {
		console.log(ev.code);
		switch(ev.code) {
			case 'ArrowLeft':
				moveLeft();
				break;
			case 'ArrowRight':
				moveRight();
				break;
			case 'ArrowDown':
				moveDown();
				break;
			case 'Space':
				rotateTet(currentTet);
				break;
			default:
				break;
		}
		if (isAtEnd(currentTet)) {
			blackArea = blackArea.concat(currentTet.shape.slice())
		}
	});
}

function main() {
	initKeyboardEvent();
	workLoop();
	autoDescend();
}

function exit() {
	window.clearInterval(workLoopTimer);
}

main();
