const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

const WIDTH = 60, STARTX = 500, STARTY = 300, STARTYINTERMEDIATE = 500, YSPEED = 5, DELAY = 2000;
const colorWhileSwapping = '#f3ca20', initialColor = '#000';

const animationArray = [];

let timeAtWhichAnimationStarts = 0, finalDestinationX = null, xSpeed = null, curBar = null;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// event listener to resize the canvas as soon as window is resized
window.addEventListener('resize', (event) => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

const inputArray = [6, 3, 6, 4, 8, 5, 2, 9];

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

// utility function to sort animationArray according to the x-coordinates
const sortAnimationArray = () => {
    animationArray.sort((a, b) => a.x - b.x);
}

// function to produce animation that takes the subarray boxes down to a temporary position
function animateGoingDown() {

    const request = requestAnimationFrame(animateGoingDown);

    c.clearRect(0, 0, canvas.width, canvas.height);

    // change x and y of boxes till they reach the intermediate designated position
    if (animationArray[curBar].y < STARTYINTERMEDIATE || Math.abs(animationArray[curBar].x - finalDestinationX) > 1) {
        if (animationArray[curBar].y < STARTYINTERMEDIATE) {
            animationArray[curBar].y += YSPEED;
        }
        if (animationArray[curBar].x > finalDestinationX) {
            animationArray[curBar].x -= xSpeed;
        }
        if (animationArray[curBar].x < finalDestinationX) {
            animationArray[curBar].x += xSpeed;
        }
    }
    else {
        cancelAnimationFrame(request);
    }

    for (bar of animationArray) {
        bar.draw();
    }
}

// this function produces animation of subarray boxes going up
function animateGoingUp() {

    const request = requestAnimationFrame(animateGoingUp);

    c.clearRect(0, 0, canvas.width, canvas.height);

    let goesUp = false;

    for (bar of animationArray) {

        if (bar.y > STARTY) {
            bar.y -= YSPEED;
            goesUp = true;
        }
        bar.draw();
    }
    if (!goesUp)
        cancelAnimationFrame(request);
}

//executing animations after a time delay so that they do not overlap
const delayGoingDown = (cur, final) => {
    setTimeout(() => {
        finalDestinationX = STARTX + 100 * final;
        curBar = cur;

        // setting xSpeed in accordance to ySpeed so that final x and y coordinate is reached simultaneously
        xSpeed = Math.abs(finalDestinationX - animationArray[curBar].x) / (STARTYINTERMEDIATE - STARTY) * YSPEED;

        animateGoingDown();

    }, timeAtWhichAnimationStarts);
}

const delayGoingUp = () => {
    setTimeout(() => {
        animateGoingUp();
        setTimeout(sortAnimationArray, DELAY / 2);
    }, timeAtWhichAnimationStarts);
}

// merge helper of mergesort function
const merge = (leftIndex, midIndex, rightIndex) => {

    const leftSize = midIndex - leftIndex + 1;
    const rightSize = rightIndex - midIndex;

    const left = inputArray.slice(leftIndex, midIndex + 1);
    const right = inputArray.slice(midIndex + 1, rightIndex + 1);

    // setting the subarray being sorted to yellow
    setTimeout(() => {
        for (let i = leftIndex; i <= rightIndex; ++i) {
            animationArray[i].color = colorWhileSwapping;
        }
    }, timeAtWhichAnimationStarts);
    timeAtWhichAnimationStarts += 50;

    let i = 0, j = 0, k = leftIndex;

    while (i < leftSize && j < rightSize) {
        if (left[i] <= right[j]) {
            inputArray[k] = left[i];

            // boxes go down to their designated positions
            delayGoingDown(i + leftIndex, k);

            timeAtWhichAnimationStarts += DELAY;
            ++i;
            ++k;
        }
        else {
            inputArray[k] = right[j];
            delayGoingDown(j + midIndex + 1, k);
            timeAtWhichAnimationStarts += DELAY;
            ++j;
            ++k;
        }
    }

    while (i < leftSize) {
        inputArray[k] = left[i];
        delayGoingDown(i + leftIndex, k);
        timeAtWhichAnimationStarts += DELAY;
        ++i;
        ++k;
    }

    while (j < rightSize) {
        inputArray[k] = right[j];
        delayGoingDown(j + midIndex + 1, k);
        timeAtWhichAnimationStarts += DELAY;
        ++j;
        ++k;
    }

    // after all the boxes have reached their designated positions move the subarray back to its position
    delayGoingUp();
    timeAtWhichAnimationStarts += DELAY;

    // change color of subarray boxes back to black
    setTimeout(() => {
        for (let i = leftIndex; i <= rightIndex; ++i) {
            animationArray[i].color = initialColor;
        }
        for (bar of animationArray)
            bar.draw();
    }, timeAtWhichAnimationStarts);
    timeAtWhichAnimationStarts += 50;
}

const mergeSortHelper = (leftIndex, rightIndex) => {

    if (rightIndex > leftIndex) {
        const midIndex = Math.floor((leftIndex + rightIndex) / 2);

        mergeSortHelper(leftIndex, midIndex);
        mergeSortHelper(midIndex + 1, rightIndex);
        merge(leftIndex, midIndex, rightIndex);
    }
}

const mergeSort = () => {

    for (let i = 0; i < inputArray.length; ++i) {
        animationArray[i] = new Box(STARTX + 100 * i, STARTY, initialColor, inputArray[i]);
        animationArray[i].draw();
    }

    mergeSortHelper(0, inputArray.length - 1);
}

mergeSort();


