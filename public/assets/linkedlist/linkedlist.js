const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

const STARTX = 500, STARTY = 300, WIDTH = 60, YSPEED = 1, XSPEED = 1, SPACING = 120;
const initialColor = "#2a9d8f", colorOfNodeBeingInserted = "#e9c46a", colorOfNodesWhosePointerIsAdjusted = "#264653";

const animationArray = [];

let elementToBeInserted = null, index = null, timeAtWhichAnimationStarts = 0;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// event listener to resize the canvas as soon as window is resized
window.addEventListener('resize', (event) => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// class defined to construct arrows
class Arrow {
    constructor(fromX, fromY, toX, toY, color = "black", width = "2") {
        this.fromX = fromX;
        this.fromY = fromY;
        this.toX = toX;
        this.toY = toY;
        this.color = color;
        this.width = width;
    }

    // draws arrows of desired length
    draw() {
        c.beginPath();
        const headlen = 10;
        const dx = this.toX - this.fromX;
        const dy = this.toY - this.fromY;
        const angle = Math.atan2(dy, dx);
        c.lineWidth = this.width;
        c.moveTo(this.fromX, this.fromY);
        c.lineTo(this.toX, this.toY);
        c.lineTo(this.toX - headlen * Math.cos(angle - Math.PI / 6), this.toY - headlen * Math.sin(angle - Math.PI / 6));
        c.moveTo(this.toX, this.toY);
        c.lineTo(this.toX - headlen * Math.cos(angle + Math.PI / 6), this.toY - headlen * Math.sin(angle + Math.PI / 6));
        c.stroke();
    }
}

// class defined to construct boxes representing numbers
class Box {
    constructor(x, y, color, text) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.text = text;
    }

    // draws boxes, numbers and shadow effects
    draw() {
        c.fillStyle = this.color;
        c.fillRect(this.x, this.y, WIDTH, -WIDTH);

        c.fillStyle = "#fff";

        c.fillText(this.text, this.x + 20, this.y - 20);
        c.font = '30px Calibri';

        c.shadowBlur = 10;
        c.shadowColor = "black";
    }
}

// class made to group together an arrow and a box
class Element {
    constructor(box = null, arrow = null) {
        this.box = box;
        this.arrow = arrow;
    }

    draw() {
        if (this.arrow)
            this.arrow.draw();
        if (this.box)
            this.box.draw();
    }
}

// animation of adjusting pointers while inserting
function adjustPointerInsert() {
    const request = requestAnimationFrame(adjustPointerInsert);

    c.clearRect(0, 0, canvas.width, canvas.height);

    for (element of animationArray)
        element.draw();

    elementToBeInserted.draw();

    if (animationArray[index - 1].arrow.toY < STARTY + SPACING - WIDTH / 2) {
        animationArray[index - 1].arrow.toY += YSPEED;
    }
    else {
        cancelAnimationFrame(request);
    }
}

// animation of insertion after adjusting pointers
function animateGoingUp() {
    const request = requestAnimationFrame(animateGoingUp);

    c.clearRect(0, 0, canvas.width, canvas.height);

    // translating all elements after the index we are inserting in
    for (let i = 0; i < animationArray.length; ++i) {
        if (i >= index) {
            animationArray[i].box.x += XSPEED;
            if (animationArray[i].arrow) {
                animationArray[i].arrow.fromX += XSPEED;
                animationArray[i].arrow.toX += XSPEED;
            }
        }
        animationArray[i].draw();
    }

    if (elementToBeInserted.box.y >= STARTY) {

        // adjusting the arrow of the element we are inserting
        elementToBeInserted.box.y -= YSPEED;
        if (elementToBeInserted.arrow) {
            elementToBeInserted.arrow.fromY = elementToBeInserted.box.y - WIDTH / 2;
            elementToBeInserted.arrow.toX = animationArray[index].box.x;
        }
        elementToBeInserted.draw();

        // adjusting the arrow of the element before the number we are inserting
        if (index - 1 >= 0) {
            animationArray[index - 1].arrow.toX = elementToBeInserted.box.x;
            animationArray[index - 1].arrow.toY = elementToBeInserted.box.y - WIDTH / 2;
        }
    }
    else {

        // insert element at correct position after the animation is complete because we are animating using index
        // and if we change it during animation, desired result wont be achieved
        animationArray.splice(index, 0, elementToBeInserted);
        c.clearRect(0, 0, canvas.width, canvas.height);
        for (let element of animationArray)
            element.draw();
        cancelAnimationFrame(request);
    }
}

function animateInsert() {

    // animate traversing the linked list
    for (let i = 0; i < index; ++i) {
        setTimeout(() => {
            if (i - 1 >= 0)
                animationArray[i - 1].box.color = initialColor;
            animationArray[i].box.color = colorOfNodesWhosePointerIsAdjusted;
            c.clearRect(0, 0, canvas.width, canvas.height);
            for (element of animationArray)
                element.draw();
        }, timeAtWhichAnimationStarts);
        timeAtWhichAnimationStarts += 500;
    }

    setTimeout(() => {
        if (index > 0 && index === animationArray.length)
            animationArray[index - 1].arrow = new Arrow(STARTX + (index - 1) * SPACING + WIDTH / 2, STARTY - WIDTH / 2, STARTX + index * SPACING, STARTY + SPACING - WIDTH / 2);
    }, timeAtWhichAnimationStarts);

    if (index - 1 >= 0 && index !== animationArray.length) {
        setTimeout(adjustPointerInsert, timeAtWhichAnimationStarts);
        timeAtWhichAnimationStarts += 2500;
        setTimeout(animateGoingUp, timeAtWhichAnimationStarts);
    }
    else {
        setTimeout(animateGoingUp, timeAtWhichAnimationStarts);
    }
    timeAtWhichAnimationStarts += 2500;
    setTimeout(() => {
        for (element of animationArray)
            element.box.color = initialColor;

        c.clearRect(0, 0, canvas.width, canvas.height);

        for (element of animationArray)
            element.draw();

        elementToBeInserted = null;
        index = null;

    }, timeAtWhichAnimationStarts);
}

// animation of box to be deleted going down
function animateGoingDown() {
    const request = requestAnimationFrame(animateGoingDown);

    c.clearRect(0, 0, canvas.width, canvas.height);

    for (element of animationArray)
        element.draw();

    if (animationArray[index].box.y < STARTY + SPACING) {
        animationArray[index].box.y += YSPEED;
        animationArray[index].arrow.fromY += YSPEED;

        if (index - 1 >= 0)
            animationArray[index - 1].arrow.toY += YSPEED;
    }
    else {
        if (index - 1 < 0)
            animationArray.splice(index, 1);
        cancelAnimationFrame(request);
    }
}

// animation of adjusting pointers while deleting
function adjustPointerDelete() {
    const request = requestAnimationFrame(adjustPointerDelete);

    c.clearRect(0, 0, canvas.width, canvas.height);

    for (element of animationArray)
        element.draw();

    if (animationArray[index - 1].arrow.toY > STARTY - WIDTH / 2) {
        animationArray[index - 1].arrow.toX += XSPEED;
        animationArray[index - 1].arrow.toY -= YSPEED;
    }
    else {
        animationArray.splice(index, 1);
        cancelAnimationFrame(request);
    }
}

// function to scale back the enlarged arrow to its normal size
function shiftBack() {
    const request = requestAnimationFrame(shiftBack);

    c.clearRect(0, 0, canvas.width, canvas.height);

    for (element of animationArray)
        element.draw();

    if (animationArray[index].box.x > STARTX + SPACING * index) {
        for (let i = index; i < animationArray.length; ++i) {
            animationArray[i].box.x -= XSPEED;
            if (animationArray[i].arrow) {
                animationArray[i].arrow.fromX -= XSPEED;
                animationArray[i].arrow.toX -= XSPEED;
            }
        }
        if (index - 1 >= 0)
            animationArray[index - 1].arrow.toX -= XSPEED;
    }
    else {
        cancelAnimationFrame(request);
    }
}

function animateDelete() {

    // animate traversing the linked list
    for (let i = 0; i < index; ++i) {
        setTimeout(() => {
            if (i - 1 >= 0)
                animationArray[i - 1].box.color = initialColor;
            animationArray[i].box.color = colorOfNodesWhosePointerIsAdjusted;
            c.clearRect(0, 0, canvas.width, canvas.height);
            for (element of animationArray)
                element.draw();
        }, timeAtWhichAnimationStarts);
        timeAtWhichAnimationStarts += 500;
    }
    if (index === animationArray.length - 1) {
        setTimeout(() => {
            if (index > 0)
                animationArray[index - 1].arrow = null;
            animationArray.splice(index, 1);
            c.clearRect(0, 0, canvas.width, canvas.height);
            for (element of animationArray) {
                element.box.color = initialColor;
                element.draw();
            }
        }, timeAtWhichAnimationStarts);
        return;
    }

    setTimeout(animateGoingDown, timeAtWhichAnimationStarts);
    timeAtWhichAnimationStarts += 2500;
    if (index - 1 >= 0) {
        setTimeout(adjustPointerDelete, timeAtWhichAnimationStarts);
        timeAtWhichAnimationStarts += 2500;
        setTimeout(shiftBack, timeAtWhichAnimationStarts);
    }
    else {
        setTimeout(shiftBack, timeAtWhichAnimationStarts);
    }

    timeAtWhichAnimationStarts += 2500;
    setTimeout(() => {
        for (element of animationArray)
            element.box.color = initialColor;

        c.clearRect(0, 0, canvas.width, canvas.height);

        for (element of animationArray)
            element.draw();

        elementToBeInserted = null;
        index = null;

    }, timeAtWhichAnimationStarts);
}

// insert function is called as soon as insert button is pressed
const insert = (number, ind) => {
    index = parseInt(ind);
    timeAtWhichAnimationStarts = 0;
    const box = new Box(STARTX + index * SPACING, STARTY + SPACING, colorOfNodeBeingInserted, number);
    if (index === animationArray.length) {
        const element = new Element(box);
        elementToBeInserted = element;
    }
    else {
        const arrow = new Arrow(STARTX + index * SPACING + WIDTH / 2, STARTY + SPACING - WIDTH / 2, STARTX + index * SPACING, STARTY - WIDTH / 2);
        const element = new Element(box, arrow);
        elementToBeInserted = element;
    }
    animateInsert();
}

// deleteElement function is called as soon as delete button is pressed
const deleteElement = (ind) => {
    index = parseInt(ind);
    timeAtWhichAnimationStarts = 0;
    animateDelete();
}

const insertInput = document.querySelector("#number");
const insertButton = document.querySelector("#insert");
const indexInput = document.querySelector("#index");

insertButton.addEventListener('click', (event) => {
    event.preventDefault();
    const textValue = insertInput.value;
    const textIndex = indexInput.value;
    insert(textValue, textIndex);
    insertInput.value = "";
    indexInput.value = "";
});

const deleteInput = document.querySelector("#indexDelete");
const deleteButton = document.querySelector("#delete");

deleteButton.addEventListener('click', (event) => {
    event.preventDefault();
    const textValue = deleteInput.value;
    deleteElement(textValue);
    deleteInput.value = "";
});