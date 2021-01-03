const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

let finalDestinationFirstBar = null, finalDestinationSecondBar = null;
let firstBar = null, secondBar = null, timeAtWhichAnimationStarts = 0;

const WIDTH = 40, STARTX = 500, STARTY = 600;
const colorDuringSwappingAndSearching = '#9f5f80', initialColor = '#ff8e71', finalColor = '#ffba93';

const animationArray = [];

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// event listener to resize the canvas as soon as window is resized
window.addEventListener('resize', (event) => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// class defined to construct bars representing numbers
class Bar {
    constructor(height, x, y, color) {
        this.height = height;
        this.x = x;
        this.y = y;
        this.color = color;
    }

    // draws the bar, text and shadow effects
    draw() {
        c.fillStyle = this.color;
        c.fillRect(this.x, this.y, WIDTH, this.height);

        c.fillStyle = "black";
        if ((-this.height) / 10 <= 2) {
            c.fillText((-this.height) / 10, this.x + 11, this.y + this.height - 10);
        }
        else {
            c.fillText((-this.height) / 10, this.x + 11, this.y - 10);
        }
        c.font = '20px Calibri';

        c.shadowBlur = 10;
        c.shadowColor = "black";

    }

    //draws border on the bars that are being swapped
    drawBorder() {
        c.lineWidth = 2;
        c.strokeStyle = '#000';
        c.strokeRect(this.x, this.y, WIDTH, this.height);
    }
}

// animation of swapping bars is produced by this function
function animate() {
    let request = requestAnimationFrame(animate);
    c.clearRect(0, 0, canvas.width, canvas.height);

    // changing x-coordinates of first bar until it reaches the position occupied by second bar
    // and vice-versa for second bar
    if (animationArray[firstBar].x < finalDestinationFirstBar || animationArray[secondBar].x > finalDestinationSecondBar) {
        if (animationArray[firstBar].x < finalDestinationFirstBar) {
            animationArray[firstBar].x += 1;
        }
        if (animationArray[secondBar].x > finalDestinationSecondBar) {
            animationArray[secondBar].x -= 1;
        }
    }
    else {
        cancelAnimationFrame(request);
    }

    for (let i = 0; i < animationArray.length; ++i) {
        if (i !== firstBar && i !== secondBar) {
            animationArray[i].draw();
        }
    }

    // drawing the two bars being swapped after the others so that they appear over them
    animationArray[firstBar].draw();
    animationArray[firstBar].drawBorder();
    animationArray[secondBar].draw();
    animationArray[secondBar].drawBorder();
}

//executing animations after a time delay so that they do not overlap

// animation of swapping bars
function delaySwappingAnimation(i, index, lastIndex) {

    setTimeout(function animateInLoop() {

        firstBar = i;
        secondBar = index;
        finalDestinationFirstBar = animationArray[secondBar].x;
        finalDestinationSecondBar = animationArray[firstBar].x;
        animationArray[firstBar].color = colorDuringSwappingAndSearching;
        animationArray[secondBar].color = colorDuringSwappingAndSearching;
        animate();

        // swapping the bars in animationArray after animation is complete.
        // we swap bars using indices, so if we swap elements of animationArray 
        // before the animation is complete, we wont get the desired animation
        setTimeout(() => {
            [animationArray[firstBar], animationArray[secondBar]] = [animationArray[secondBar], animationArray[firstBar]];
            animationArray[firstBar].color = initialColor;
            animationArray[secondBar].color = initialColor;
        }, 1000);

    }, timeAtWhichAnimationStarts, i, index);
}

//algorithm for bubble sort
const BubbleSort = async (inputArray) => {

    for (let i = 0; i < inputArray.length; ++i) {
        animationArray[i] = new Bar(-inputArray[i] * 10, STARTX + 50 * i, STARTY, initialColor);
        animationArray[i].draw();
    }

    for (let i = 0; i < inputArray.length; ++i) {

        for (let j = 1; j < inputArray.length - i; ++j) {

            if (inputArray[j - 1] > inputArray[j]) {
                delaySwappingAnimation(j - 1, j, inputArray.length - i - 1);
                timeAtWhichAnimationStarts += 1500;
                [inputArray[j], inputArray[j - 1]] = [inputArray[j - 1], inputArray[j]];
            }
        }
        setTimeout(() => {
            c.clearRect(0, 0, canvas.width, canvas.height);
            for (let k = 0; k < animationArray.length; ++k) {
                if (k === animationArray.length - 1 - i) {
                    animationArray[k].color = finalColor;
                }
                animationArray[k].draw();
            }
        }, timeAtWhichAnimationStarts);
        timeAtWhichAnimationStarts += 50;
    }
}

BubbleSort([4, 2, 7, 56, 33, 28, 33, 2, 5]);
