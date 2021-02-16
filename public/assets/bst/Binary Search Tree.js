const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ROOTX = canvas.width / 2, ROOTY = 100, MOVEMENT = 50, HEIGHT = 80, HEIGHTDELTA = 0.0125;
const CIRCLERADIUS = 25, CIRCLECOLOR = '#6d6875', LINECOLOR = '#e5989b', TEXTCOLOR = '#fff', FONTSIZE = 20;
const CIRCLECOLORONTRAVERSAL = '#b5838d', LINEWIDTH = 4;

let timeAtWhichAnimationStarts = 0, areAllDeltasZero = false, isAlreadyThere = true, replacementNode = null;
let areAllHeightDeltasZero = true, isLeafNode = false, isLeftLeafNode = false, isRightLeafNode = false, isLeftSubtree = false, isRightSubtree = false;

// class to draw a line(edges connecting two nodes)
class Line {
    constructor(startX, startY, endX, endY, color, lineWidth) {
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
        this.color = color;
        this.lineWidth = lineWidth;
    }

    draw() {
        c.beginPath();
        c.moveTo(this.startX, this.startY);
        c.lineTo(this.endX, this.endY);
        c.lineWidth = this.lineWidth;
        c.strokeStyle = this.color;
        c.stroke();
    }
}

// class to draw a circle(nodes)
class Circle {
    constructor(startX, startY, radius, colorCircle, colorFont, text, fontSize) {
        this.startX = startX;
        this.startY = startY;
        this.radius = radius;
        this.colorCircle = colorCircle;
        this.colorFont = colorFont;
        this.text = text;
        this.fontSize = fontSize;
    }

    draw() {
        c.beginPath();
        c.arc(this.startX, this.startY, this.radius, 0, 2 * Math.PI);
        c.fillStyle = this.colorCircle;
        c.fill();

        c.font = `${this.fontSize}px Calibri`;
        c.fillStyle = this.colorFont;
        c.textAlign = 'center';
        c.fillText(this.text, this.startX, this.startY + 5);
    }
}

// node of Binary Search Tree
class Node {
    constructor(data) {
        this.data = data;
        this.left = null;
        this.right = null;
        this.parent = null;
        this.x = null;
        this.y = null;
        this.height = 0;
        this.delta = 0;
        this.heightDelta = 0;
    }
}

// Binary Search Tree class
class BinarySearchTree {
    constructor() {
        this.root = null;
    }

    insert(data, node, parent) {
        if (!node) {
            isAlreadyThere = false;
            const newNode = new Node(data);
            newNode.parent = parent;
            if (this.root === null) {
                newNode.x = ROOTX;
                newNode.y = ROOTY;
            }
            else {
                newNode.height = newNode.parent.height + 1;
                newNode.y = ROOTY + newNode.height * HEIGHT;
                if (newNode.parent.data > newNode.data)
                    newNode.x = newNode.parent.x - MOVEMENT;
                else
                    newNode.x = newNode.parent.x + MOVEMENT;
            }
            return newNode;
        }
        else if (data < node.data) {
            node.left = this.insert(data, node.left, node);
        }
        else if (data > node.data) {
            node.right = this.insert(data, node.right, node);
        }
        return node;
    }

    deleteNode(node, data) {
        if (!node)
            return null;
        if (data < node.data)
            node.left = this.deleteNode(node.left, data);
        else if (data > node.data)
            node.right = this.deleteNode(node.right, data);
        else {
            isAlreadyThere = true;
            if (!node.right && !node.left) {
                replacementNode = node.parent;
                isLeafNode = true;
                if (node.parent && node.parent.data > data)
                    isLeftLeafNode = true;
                else
                    isRightLeafNode = true;
                node = null;
            }
            else if (!node.right) {
                const temp = node.parent;
                node = node.left;
                node.parent = temp;
                replacementNode = node;
                isLeftSubtree = true;
            }
            else if (!node.left) {
                const temp = node.parent;
                node = node.right;
                node.parent = temp;
                replacementNode = node;
                isRightSubtree = true;
            }
            else {
                let nodeToBeDeleted = node.right;
                while (nodeToBeDeleted.left)
                    nodeToBeDeleted = nodeToBeDeleted.left;
                node.data = nodeToBeDeleted.data;
                node.right = this.deleteNode(node.right, nodeToBeDeleted.data);
            }
        }
        return node;
    }

    // function to draw nodes by bfs traversal. BFS is being because 
    // we first have to draw the lines and then circles lateron to cover
    // a part of them. This wont be possible in any other traversals
    bfsDrawNode(node, nodeToBeHighlighted) {
        if (!node)
            return;
        const queue = [node];
        while (queue.length !== 0) {
            if (queue[0].left) {
                const line = new Line(queue[0].x, queue[0].y, queue[0].left.x, queue[0].left.y, LINECOLOR, LINEWIDTH);
                line.draw();
            }
            if (queue[0].right) {
                const line = new Line(queue[0].x, queue[0].y, queue[0].right.x, queue[0].right.y, LINECOLOR, LINEWIDTH);
                line.draw();
            }
            const circle = new Circle(queue[0].x, queue[0].y, CIRCLERADIUS,
                ((queue[0] === nodeToBeHighlighted) ? CIRCLECOLOR : CIRCLECOLORONTRAVERSAL), TEXTCOLOR, queue[0].data, FONTSIZE);
            circle.draw();
            if (queue[0].left) {
                queue.push(queue[0].left);
            }
            if (queue[0].right) {
                queue.push(queue[0].right);
            }
            queue.shift();
        }
    }

    moveSubtreeRight(node) {
        if (!node)
            return;
        this.moveSubtreeRight(node.left);
        if (node.delta > 0) {
            node.x++;
            node.delta--;
            areAllDeltasZero = false;
        }
        if (node.heightDelta > 0) {
            --node.heightDelta;
            --node.y;
            areAllHeightDeltasZero = false;
        }
        this.moveSubtreeRight(node.right);
    }

    moveSubtreeLeft(node) {
        if (!node)
            return;
        this.moveSubtreeLeft(node.left);
        if (node.delta < 0) {
            node.x--;
            node.delta++;
            areAllDeltasZero = false;
        }
        if (node.heightDelta > 0) {
            --node.heightDelta;
            --node.y;
            areAllHeightDeltasZero = false;
        }
        this.moveSubtreeLeft(node.right);
    }

    setPositiveDelta(node) {
        if (!node)
            return;
        this.setPositiveDelta(node.left);
        node.delta += MOVEMENT;
        this.setPositiveDelta(node.right);
    }

    setNegativeDelta(node) {
        if (!node)
            return;
        this.setNegativeDelta(node.left);
        node.delta -= MOVEMENT;
        this.setNegativeDelta(node.right);
    }

    // function to set the appropriate deltas when we are inserting in right side of root
    rightSubtreeInsertion(node, data) {
        if (node.parent && data < node.data) {
            node.delta += MOVEMENT;
            this.setPositiveDelta(node.right);
        }
        if (node.data === data) {
            if (node.parent.left === node)
                node.delta += MOVEMENT;
        }
        else if (data < node.data)
            this.rightSubtreeInsertion(node.left, data);
        else
            this.rightSubtreeInsertion(node.right, data);
    }

    // function to set the appropriate deltas when we are deleting in right side of root
    rightSubtreeDeletion(node, data) {
        if (node.parent && data < node.data) {
            node.delta -= MOVEMENT;
            this.setNegativeDelta(node.right);
        }
        if (node.data === data)
            return;
        else if (data < node.data)
            this.rightSubtreeDeletion(node.left, data);
        else
            this.rightSubtreeDeletion(node.right, data);
    }

    // function to set the appropriate deltas when we are inserting in left side of root
    leftSubtreeInsertion(node, data) {
        if (node.parent && data > node.data) {
            node.delta -= MOVEMENT;
            this.setNegativeDelta(node.left);
        }
        if (node.data === data) {
            if (node.parent.right === node)
                node.delta -= MOVEMENT;
            return;
        }
        else if (data < node.data)
            this.leftSubtreeInsertion(node.left, data);
        else
            this.leftSubtreeInsertion(node.right, data);
    }

    // function to set the appropriate deltas when we are deleting in left side of root
    leftSubtreeDeletion(node, data) {
        if (node.parent && data > node.data) {
            node.delta += MOVEMENT;
            this.setPositiveDelta(node.left);
        }
        if (node.data === data)
            return;
        else if (data < node.data)
            this.leftSubtreeDeletion(node.left, data);
        else
            this.leftSubtreeDeletion(node.right, data);
    }

    setAllDeltasToZero(node) {
        if (!node)
            return;
        this.setAllDeltasToZero(node.left);
        node.delta = 0;
        node.heightDelta = 0;
        this.setAllDeltasToZero(node.right);
    }

    moveNodesUp(node) {
        if (!node)
            return;
        this.moveNodesUp(node.left);
        node.heightDelta = HEIGHT;
        --node.height;
        this.moveNodesUp(node.right);
    }

    // searching animation on nodes
    searchAnimate(data, node) {
        if (!node)
            return;

        setTimeout(() => {

            c.clearRect(0, 0, canvas.width, canvas.height);
            this.bfsDrawNode(this.root, node);

        }, timeAtWhichAnimationStarts);
        timeAtWhichAnimationStarts += 300;

        if (node.data === data)
            return;
        else if (data < node.data)
            this.searchAnimate(data, node.left);
        else
            this.searchAnimate(data, node.right);
    }
}

const BST = new BinarySearchTree();

function animateNodesMovingRight() {
    const request = requestAnimationFrame(animateNodesMovingRight);

    c.clearRect(0, 0, canvas.width, canvas.height);

    BST.bfsDrawNode(BST.root, null);

    areAllDeltasZero = true;
    areAllHeightDeltasZero = true;

    BST.moveSubtreeRight(BST.root);

    if (areAllDeltasZero && areAllHeightDeltasZero)
        cancelAnimationFrame(request);
}

function animateNodesMovingLeft() {
    const request = requestAnimationFrame(animateNodesMovingLeft);

    c.clearRect(0, 0, canvas.width, canvas.height);

    BST.bfsDrawNode(BST.root, null);

    areAllDeltasZero = true;
    areAllHeightDeltasZero = true;

    BST.moveSubtreeLeft(BST.root);

    if (areAllDeltasZero && areAllHeightDeltasZero)
        cancelAnimationFrame(request);
}

function insertWrapper(data) {

    timeAtWhichAnimationStarts = 0;
    isAlreadyThere = true;

    BST.setAllDeltasToZero(BST.root);

    BST.searchAnimate(data, BST.root);

    setTimeout(() => {

        BST.root = BST.insert(data, BST.root);
        BST.bfsDrawNode(BST.root, null);

        if (isAlreadyThere)
            return;

        if (data > BST.root.data) {
            BST.rightSubtreeInsertion(BST.root, data);
            animateNodesMovingRight();
        }
        else if (data < BST.root.data) {
            BST.leftSubtreeInsertion(BST.root, data);
            animateNodesMovingLeft();
        }
    }, timeAtWhichAnimationStarts);
}

function deleteWrapper(data) {

    timeAtWhichAnimationStarts = 0;
    isAlreadyThere = false;
    replacementNode = null;
    areAllHeightDeltasZero = true;
    isLeafNode = false;
    isLeftSubtree = false;
    isRightSubtree = false;
    isRightLeafNode = false;
    isLeftLeafNode = false;

    BST.setAllDeltasToZero(BST.root);

    BST.searchAnimate(data, BST.root);

    setTimeout(() => {

        BST.root = BST.deleteNode(BST.root, data);

        if (!isAlreadyThere)
            return;
        if (replacementNode) {
            if (replacementNode.data > BST.root.data) {
                BST.rightSubtreeDeletion(BST.root, replacementNode.data);
                if (!isLeafNode)
                    BST.moveNodesUp(replacementNode);
                if (isLeftLeafNode)
                    BST.setNegativeDelta(replacementNode);
                if (isRightSubtree)
                    BST.setNegativeDelta(replacementNode);
                animateNodesMovingLeft();
            }
            else if (replacementNode.data < BST.root.data) {
                BST.leftSubtreeDeletion(BST.root, replacementNode.data);
                if (!isLeafNode)
                    BST.moveNodesUp(replacementNode);
                if (isRightLeafNode)
                    BST.setPositiveDelta(replacementNode);
                if (isLeftSubtree)
                    BST.setPositiveDelta(replacementNode);
                animateNodesMovingRight();
            }
            else {
                if (!isLeafNode)
                    BST.moveNodesUp(replacementNode);
                if (isRightSubtree) {
                    BST.setNegativeDelta(replacementNode);
                    animateNodesMovingLeft();
                }
                if (isLeftSubtree) {
                    BST.setPositiveDelta(replacementNode);
                    animateNodesMovingRight();
                }
            }
            timeAtWhichAnimationStarts += 1000;
        }

    }, timeAtWhichAnimationStarts);

    setTimeout(() => {
        c.clearRect(0, 0, canvas.width, canvas.height);
        BST.bfsDrawNode(BST.root, null);
    }, timeAtWhichAnimationStarts);
}

const insertButton = document.querySelector("#insert");
const insertInput = document.querySelector("#number");

insertButton.addEventListener('click', (event) => {
    event.preventDefault();
    const textValue = parseInt(insertInput.value);
    insertWrapper(textValue);
    insertInput.value = "";
});

const deleteButton = document.querySelector("#delete");
const deleteInput = document.querySelector("#numberDelete");

deleteButton.addEventListener('click', (event) => {
    event.preventDefault();
    const textValue = parseInt(deleteInput.value);
    deleteWrapper(textValue);
    deleteInput.value = "";
});