const canvas = document.querySelector('canvas');
const WIDTH = 40, STARTX = 500, STARTY = 300, STARTYINTERMEDIATE = 600, YSPEED = 5, DELAY = 2000;
const c = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', (event) => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

inputArray = [6, 3, 6, 4, 8, 5, 2, 9];

let timeAtWhichAnimationStarts = 0, finalDestinationX = null, xSpeed = null, curBar = null;

const animationArray = [];

class Bar { //class defined to construct bars representing numbers
    constructor(height, x, y) {
        this.height = height;
        this.x = x;
        this.y = y;
    }

    draw() {
        c.fillStyle = 'pink';
        c.fillRect(this.x, this.y, WIDTH, this.height);

        c.fillStyle = "black";

        c.fillText((-this.height) / 10, this.x + 11, this.y - 10);
        c.font = '20px Calibri';

    }
}

const sortAnimationArray = () => {
    animationArray.sort((a, b) => a.x - b.x);
}

function animateGoingDown() {

    const request = requestAnimationFrame(animateGoingDown);

    c.clearRect(0, 0, canvas.width, canvas.height);

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

function animateGoingUp() {

    const request = requestAnimationFrame(animateGoingUp);

    c.clearRect(0, 0, canvas.width, canvas.height);

    let goesUp = false;
    //console.log(animationArray);
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

const delayGoingDown = (cur, final) => {
    setTimeout(() => {
        finalDestinationX = STARTX + 50 * final;
        curBar = cur;
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

const merge = (leftIndex, midIndex, rightIndex) => {

    const leftSize = midIndex - leftIndex + 1;
    const rightSize = rightIndex - midIndex;

    const left = inputArray.slice(leftIndex, midIndex + 1);
    const right = inputArray.slice(midIndex + 1, rightIndex + 1);


    let i = 0, j = 0, k = leftIndex;

    while (i < leftSize && j < rightSize) {
        if (left[i] <= right[j]) {
            inputArray[k] = left[i];
            delayGoingDown(i + leftIndex, k);
            timeAtWhichAnimationStarts += DELAY;
            ++i;
            ++k;
            //if error happens first check time
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
    delayGoingUp();
    timeAtWhichAnimationStarts += DELAY;
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
        animationArray[i] = new Bar(-inputArray[i] * 10, STARTX + 50 * i, STARTY);
        animationArray[i].draw();
    }

    mergeSortHelper(0, inputArray.length - 1);
}

mergeSort();


