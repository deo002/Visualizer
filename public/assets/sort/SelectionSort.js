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
window.addEventListener('resize', () => {
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
function delaySwappingAnimation(i, index) {

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
            [animationArray[i], animationArray[index]] = [animationArray[index], animationArray[i]];
            animationArray[firstBar].color = finalColor;
            if (firstBar !== secondBar)
                animationArray[secondBar].color = initialColor;
        }, Math.abs(firstBar - secondBar) * 1000);

    }, timeAtWhichAnimationStarts, i, index);
}

// animation of searching the shortest bar
function delaySearchingForShortestBar(mainBar, searchBar) {
    setTimeout(() => {
        c.clearRect(0, 0, canvas.width, canvas.height);
        animationArray[mainBar].color = colorDuringSwappingAndSearching;
        animationArray[searchBar].color = colorDuringSwappingAndSearching;
        for (let bar of animationArray)
            bar.draw();
        setTimeout(() => {
            c.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < animationArray.length; ++i) {
                if (i > mainBar)
                    animationArray[i].color = initialColor;
                animationArray[i].draw();
            }
        }, 400);
    }, timeAtWhichAnimationStarts);
}

//colors the bars to be swapped before swapping for 500 milliseconds
function delayColoringTheBarsToBeSwapped(mainBar, searchBar) {
    setTimeout(() => {
        c.clearRect(0, 0, canvas.width, canvas.height);
        animationArray[searchBar].color = colorDuringSwappingAndSearching;
        for (let bar of animationArray)
            bar.draw();
    }, timeAtWhichAnimationStarts);
}

// selection sort algorithm
const selectionSort = async (inputArray) => {

    for (let i = 0; i < inputArray.length; ++i) {
        animationArray[i] = new Bar(-inputArray[i] * 10, STARTX + 50 * i, STARTY, initialColor);
        animationArray[i].draw();
    }

    for (let i = 0; i < inputArray.length; ++i) {

        let index = i;

        for (let j = i + 1; j < inputArray.length; ++j) {
            if (inputArray[j] < inputArray[index])
                index = j;
            delaySearchingForShortestBar(i, j);
            timeAtWhichAnimationStarts += 450;
        }

        delayColoringTheBarsToBeSwapped(i, index);
        timeAtWhichAnimationStarts += 500;

        if (i >= inputArray.length || index >= inputArray.length)
            continue;

        delaySwappingAnimation(i, index);
        timeAtWhichAnimationStarts += (Math.abs(i - index) * 1000 + 300);
        [inputArray[i], inputArray[index]] = [inputArray[index], inputArray[i]];
    }

    setTimeout(() => {
        c.clearRect(0, 0, canvas.width, canvas.height);
        for (let bar of animationArray) {
            if (bar.color === colorDuringSwappingAndSearching)
                bar.color = finalColor;
            bar.draw();
        }
    }, timeAtWhichAnimationStarts);
}

selectionSort([6, 2, 4, 8, 5, 1, 10, 56, 34, 33, 22, 17]);