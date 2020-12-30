const canvas = document.querySelector('canvas');
const WIDTH = 40, STARTX = 500, STARTY = 600, thickness = 1;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const c = canvas.getContext('2d');

window.addEventListener('resize', (event) => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

});

class Bar {
    constructor(height, x, y) {
        this.height = height;
        this.x = x;
        this.y = y;
    }

    draw() {
        c.fillStyle = 'pink';
        c.fillRect(this.x, this.y, WIDTH, this.height); 
        
        c.fillStyle = "black";
        
        c.fillText((-this.height)/10, this.x + 11 , this.y - 10 ,);
        c.font = '20px Calibri';
        
    }

    drawBorder()
    {
        c.fillStyle='#000';
        c.fillRect(this.x - (thickness) - 2 , this.y - (thickness) + 3, WIDTH + (thickness * 2) + 4, this.height + (thickness * 2) - 7);
    }
}

let finalDestinationI = null, finalDestinationIndex = null, iI = null, iIndex = null, time = 0;
const animationArray = [];

function animate() {
    let request = requestAnimationFrame(animate);
    c.clearRect(0, 0, canvas.width, canvas.height);

    if (animationArray[iI].x < finalDestinationI || animationArray[iIndex].x > finalDestinationIndex) {
        if (animationArray[iI].x < finalDestinationI) {
            animationArray[iI].x += 1;
        }
        if (animationArray[iIndex].x > finalDestinationIndex) {
            animationArray[iIndex].x -= 1;
        }
        animationArray[iI].drawBorder();
        animationArray[iIndex].drawBorder();
    }
    else {
        cancelAnimationFrame(request);
    }
    //console.log(animationArray[iI].x, finalDestinationI);
    for (let k = 0; k < animationArray.length; ++k)
        animationArray[k].draw();
}

function delay(i, index) {
    setTimeout(async function animateInLoop() {
        finalDestinationI = animationArray[index].x;
        finalDestinationIndex = animationArray[i].x;
        iI = i;
        iIndex = index;
        //console.log(iI, iIndex, finalDestinationI, finalDestinationIndex);
        animate();
        setTimeout(() => {
            //console.log(animationArray);
            const temp = animationArray[i];
            animationArray[i] = animationArray[index];
            animationArray[index] = temp;
            //console.log(animationArray);
        }, Math.abs(iI - iIndex) * 1000);
    }, time, i, index);
}

const selectionSort = async (inputArray) => {

    for (let i = 0; i < inputArray.length; ++i) {
        animationArray[i] = new Bar(-inputArray[i] * 10, STARTX + 50 * i, STARTY);
        //console.log(animationArray[i]);
        animationArray[i].draw();
    }
    //console.log(animationArray);
    for (let i = 0; i < inputArray.length; ++i) {

        let index = i;

        for (let j = i + 1; j < inputArray.length; ++j) {
            if (inputArray[j] < inputArray[index])
                index = j;
        }

        if (i === index || i >= inputArray.length || index >= inputArray.length)
            continue;

        delay(i, index);
        time += (Math.abs(i - index) * 1000 + 500);
        const temp = inputArray[i];
        inputArray[i] = inputArray[index];
        inputArray[index] = temp;

    }

    return inputArray;
}

console.log(selectionSort([10, 35, 15, 5, 50, 45, 40, 30, 25, 20, 8]));