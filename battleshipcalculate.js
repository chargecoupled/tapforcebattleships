// We will add our JavaScript code here
const grid = document.querySelector('.grid');
let markingMode = 'E';  // Variable to store the current marking mode
let shipLengths = [4, 4, 3, 3, 2];
let simulations = 10000;
let statusMessages = [];
let remainingLengths = [];
// Define boardState globally
let boardState = Array(8).fill(null).map(() => Array(8).fill("E"));

// Function to set the marking mode
function setMarkingMode(mode) {
    markingMode = mode;
}
    
// Function to mark a cell with the current marking mode
// function markCell(event) {
    // let cell = event.target;
    // let [x, y] = cell.id.split('-').slice(1).map(Number);
    
    // cell.textContent = markingMode;
    // cell.dataset.status = markingMode;
    // cell.dataset.state = markingMode;  // Update the data-state attribute
    // boardState[x][y] = markingMode;
// }

// let currentSunkState = 0;

function markCell(event) {
    let stateToSet = markingMode;
    
    // Get the coordinates of the clicked cell and access its current state from boardState
    let [x, y] = event.target.id.split('-').slice(1).map(Number);
    let currentState = boardState[x][y];

    if (markingMode.startsWith("S")) {
        let currentSunkState = parseInt(currentState.replace("S", ""));
        if (isNaN(currentSunkState)) {
            currentSunkState = 0;
        }
        stateToSet = `S${(currentSunkState % 5) + 1}`;
    }
    
    event.target.textContent = stateToSet;
    event.target.dataset.status = stateToSet;
    event.target.dataset.state = stateToSet;
    
    // Update the boardState
    boardState[x][y] = stateToSet;
    
    // Call the function to update the board display
    displayBoardState();
}

function displayBoardState() {
    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            let cell = document.getElementById(`cell-${x}-${y}`);
            let state = boardState[x][y];
            
            cell.textContent = state;
            cell.style.fontWeight = 'normal'; // reset the font weight
			cell.style.color = 'black';
            
            // Set the background color based on the state
            if (state === 'E' || state === '') {
                cell.style.backgroundColor = 'white';
            } else if (state === 'M') {
                cell.style.backgroundColor = 'lightgrey';
            } else if (state === 'S1') {
                cell.style.backgroundColor = 'rgb(185,196,223)';
            } else if (state === 'S2') {
                cell.style.backgroundColor = 'rgb(98,117,160)';
            } else if (state === 'S3') {
                cell.style.backgroundColor = 'rgb(46,66,114)';
				cell.style.color = 'white';
            } else if (state === 'S4') {
                cell.style.backgroundColor = 'rgb(13,29,68)';
				cell.style.color = 'white';
            } else if (state === 'S5') {
                cell.style.backgroundColor = 'rgb(1,7,21)';
				cell.style.color = 'white';
            } else if (state === 'H') {
                cell.style.backgroundColor = 'orange';
            }
        }
    }
}

	




	
// function determineRemainingShips(board, shipLengths) {
    // let shipCount = new Array(5).fill(0);
    // for (let i = 0; i < 8; i++) {
        // for (let j = 0; j < 8; j++) {
            // for (let k = 0; k < 5; k++) {
                // if (board[i][j] === `S${k + 1}`) {
                    // shipCount[k] += 1;
                // }
            // }
        // }
    // }
    
    // let remainingLengths = [...shipLengths];

    // for (let i = 0; i < shipCount.length; i++) {
        // let count = shipCount[i];
        // if (count > 0) {
            // let index = remainingLengths.indexOf(count);
            // if (index !== -1) {
                // remainingLengths.splice(index, 1);
				// console.log('ship OK');
            // } else {
                //If the ship count does not match any of the expected ship lengths, add an error message
				// console.log('ship bad');
                // statusMessages.push(`Error: Invalid ship count. Found a ship of length ${count} which is not in the predefined ship lengths.`);
                // return { error: true, remainingLengths: [] };
            // }
        // }
    // }
    // console.log('remainingLengths:', remainingLengths);
    // return { error: false, remainingLengths };
// }

function getHitCoords(board) {
    let hitCoords = [];
    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            if (board[x][y] === "H") {
                hitCoords.push([x, y]);
            }
        }
    }
    return hitCoords;
}


function updateBoardWithResults(frequencyBoard) {
    let maxProb = 0;
    let minProb = 1;
    let maxProbCoords = [0, 0];
    
    // Get the state of the diagonal skew checkbox
    const diagonalSkew = document.getElementById('diagonalSkewCheckbox').checked;

    // Check if there are any hits on the board
    let anyHitsOnBoard = boardState.flat().includes('H');

    // Apply the diagonal skew if the checkbox is checked and there are no hits on the board
    if (diagonalSkew && !anyHitsOnBoard) {
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                if ((x + y) % 2 === 0) {
                    frequencyBoard[x][y] *= 0.85;
                }
            }
        }
    }

    // Find the max and min probability and its coordinates
    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            if (frequencyBoard[x][y] > maxProb) {
                maxProb = frequencyBoard[x][y];
                maxProbCoords = [x, y];
            }
            if (frequencyBoard[x][y] > 0 && frequencyBoard[x][y] < minProb) {
                minProb = frequencyBoard[x][y];
            }
        }
    }

    const lambda = 8;  // Adjust this value to control the rate of decay

    // Update the board with the results
    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            let cell = document.getElementById(`cell-${x}-${y}`);
			let state = boardState[x][y];
            cell.style.fontWeight = 'normal';
			if (!["H", "M", "S1", "S2", "S3", "S4", "S5"].includes(boardState[x][y])) {
                let frequency = frequencyBoard[x][y];
                cell.textContent = (frequency * 100).toFixed(2) + "%";
                let scaledFrequency = Math.exp(-lambda * (1 - frequency / maxProb));
                cell.style.backgroundColor = `rgba(255, 0, 0, ${scaledFrequency})`; // Heatmap effect
            } else if (state === 'M') {
                cell.style.backgroundColor = 'lightgrey';
            } else if (state === 'S1') {
                cell.style.backgroundColor = 'rgb(185,196,223)';
            } else if (state === 'S2') {
                cell.style.backgroundColor = 'rgb(98,117,160)';
            } else if (state === 'S3') {
                cell.style.backgroundColor = 'rgb(46,66,114)';
				cell.style.color = 'white';
            } else if (state === 'S4') {
                cell.style.backgroundColor = 'rgb(13,29,68)';
				cell.style.color = 'white';
            } else if (state === 'S5') {
                cell.style.backgroundColor = 'rgb(1,7,21)';
				cell.style.color = 'white';
            } else if (state === 'H') {
                cell.style.backgroundColor = 'orange';
            }
				
        }
    }
    
    // Highlight the cell with the highest probability
    let cell = document.getElementById(`cell-${maxProbCoords[0]}-${maxProbCoords[1]}`);
    cell.style.fontWeight = 'bold';
}




function highlightHighestProbabilityCell(frequencyBoard) {
    let maxProb = 0;
    let maxProbCoords = [0, 0];

    // Find the max probability and its coordinates
    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            if (frequencyBoard[x][y] > maxProb) {
                maxProb = frequencyBoard[x][y];
                maxProbCoords = [x, y];
            }
        }
    }

    // Highlight the cell with the highest probability
    let cell = document.getElementById(`cell-${maxProbCoords[0]}-${maxProbCoords[1]}`);
    cell.style.border = "2px solid red"; // Set border color to red
}




// function validPlacement(board, length, orientation, x, y) {
	// if (orientation === "H") {
		// if (y + length - 1 >= 8) return false;
		// for (let i = y; i < y + length; i++) {
			// if (!["E", "H"].includes(board[x][i])) return false;
		// }
	// } else {
		// if (x + length - 1 >= 8) return false;
		// for (let i = x; i < x + length; i++) {
			// if (!["E", "H"].includes(board[i][y])) return false;
		// }
	// }
	// return true;
// }

function validPlacement(board, length, orientation, x, y) {
    let coversEmpty = false;

    if (orientation === "H") {
        if (y + length - 1 >= 8) return false;
        for (let i = y; i < y + length; i++) {
            if (!["E", "H"].includes(board[x][i])) return false;
            if (board[x][i] === "E") coversEmpty = true;
        }
    } else {
        if (x + length - 1 >= 8) return false;
        for (let i = x; i < x + length; i++) {
            if (!["E", "H"].includes(board[i][y])) return false;
            if (board[i][y] === "E") coversEmpty = true;
        }
    }

    return coversEmpty;
}



function monteCarlo(board, remainingLengths, hitCoords, simulations) {

	
	let frequencyBoard = Array.from({ length: 8 }, () => Array(8).fill(0));

    for (let sim = 0; sim < simulations; sim++) {
        let tempBoard = JSON.parse(JSON.stringify(board));
        let alteredCells = [];  // Array to store the coordinates of cells altered during the simulation

        for (let length of remainingLengths) {
            let placed = false;
            let attempts = 0;
            while (!placed && attempts < 1000) {
                let x = Math.floor(Math.random() * 8);
                let y = Math.floor(Math.random() * 8);
                let orientation = Math.random() < 0.5 ? "H" : "V";
                if (validPlacement(tempBoard, length, orientation, x, y)) {
                    placed = true;
                    if (orientation === "H") {
                        for (let i = y; i < y + length; i++) {
                            tempBoard[x][i] = "SHIP";
                            frequencyBoard[x][i] += 1;
                            alteredCells.push([x, i]);  // Store the coordinates of the altered cell
                        }
                    } else {
                        for (let i = x; i < x + length; i++) {
                            tempBoard[i][y] = "SHIP";
                            frequencyBoard[i][y] += 1;
                            alteredCells.push([i, y]);  // Store the coordinates of the altered cell
                        }
                    }
                }
                attempts += 1;
            }
        }

        // Reset only the altered cells to "E" state
        for (let [x, y] of alteredCells) {
            tempBoard[x][y] = "E";
        }
    }
    
    return frequencyBoard;
}


function monteCarloHit(board, remainingLengths, hitCoords, simulations) {
    let frequencyBoard = Array.from({ length: 8 }, () => Array(8).fill(0));
    let successfulSims = 0;

    while (successfulSims < simulations) {
        let tempBoard = JSON.parse(JSON.stringify(board));
        let tempFrequencyBoard = Array.from({ length: 8 }, () => Array(8).fill(0)); // Temporary frequency board
        let remainingHitCoords = [...hitCoords];
        let remainingShips = [...remainingLengths];
        
        for (let i = remainingHitCoords.length - 1; i >= 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [remainingHitCoords[i], remainingHitCoords[j]] = [remainingHitCoords[j], remainingHitCoords[i]];
        }

        let simulationFailed = false;

        while (remainingHitCoords.length > 0 && remainingShips.length > 0) {
            let length = remainingShips[Math.floor(Math.random() * remainingShips.length)];
            let [hitX, hitY] = remainingHitCoords[Math.floor(Math.random() * remainingHitCoords.length)];
            let orientation = Math.random() < 0.5 ? "H" : "V";

            let x, y, validRange;

            if (orientation === "H") {
                validRange = Array.from({length: length}, (_, i) => hitY - i).filter(i => i >= 0 && i <= 7 - length + 1);
                if (validRange.length === 0) {
                    simulationFailed = true;
                    break;
                }
                y = validRange[Math.floor(Math.random() * validRange.length)];
                x = hitX;
            } else {
                validRange = Array.from({length: length}, (_, i) => hitX - i).filter(i => i >= 0 && i <= 7 - length + 1);
                if (validRange.length === 0) {
                    simulationFailed = true;
                    break;
                }
                x = validRange[Math.floor(Math.random() * validRange.length)];
                y = hitY;
            }

            if (validPlacement(tempBoard, length, orientation, x, y)) {
                if (orientation === "H") {
                    for (let i = y; i < y + length; i++) {
                        tempBoard[x][i] = "SHIP";
                        tempFrequencyBoard[x][i] += 1; // Update to tempFrequencyBoard
                        remainingHitCoords = remainingHitCoords.filter(coord => coord[0] !== x || coord[1] !== i);
                    }
                } else {
                    for (let i = x; i < x + length; i++) {
                        tempBoard[i][y] = "SHIP";
                        tempFrequencyBoard[i][y] += 1; // Update to tempFrequencyBoard
                        remainingHitCoords = remainingHitCoords.filter(coord => coord[0] !== i || coord[1] !== y);
                    }
                }
                remainingShips = remainingShips.filter(ship => ship !== length);
            } else {
                simulationFailed = true;
                break;
            }
        }

        if (simulationFailed) continue;

        // Add the values from the tempFrequencyBoard to the main frequencyBoard only if the simulation is successful
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                frequencyBoard[i][j] += tempFrequencyBoard[i][j];
            }
        }
        
        successfulSims += 1;
    }
    console.log('Number of successful simulations:', successfulSims);
    console.table(frequencyBoard);
    return frequencyBoard;
}




function setupBoard(boardState) {
    let board = Array(8).fill(null).map(() => Array(8).fill("E"));
    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            if (boardState[x][y]) {
                board[x][y] = boardState[x][y];
            }
        }
    }
    return board;
}

function main(boardState, shipLengths) {
    let board = setupBoard(boardState);
    
    let { error, remainingLengths } = determineRemainingShips(board, shipLengths);
    console.log(remainingLengths);
    if (error) {
        document.getElementById('status-text').textContent = "Status: " + error;
        // Stop the execution if there is an error
        return;
	} else {
		document.getElementById('status-text').textContent = "Status: Board state valid";
    }
    console.log(remainingLengths);

    let hitCoords = [];
    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            if (board[x][y] === "H") {
                hitCoords.push([x, y]);
            }
        }
    }

	// Get the number of iterations from the input box
    let iterationsInput = document.getElementById('iterations').value;
    
    // Check if the input is a valid integer
    if (!Number.isInteger(Number(iterationsInput)) || Number(iterationsInput) <= 0) {
        alert("Invalid number of iterations. Using the default value of 10000.");
        iterationsInput = 10000;
    }
	simulations = Number(iterationsInput);

    let frequencyBoard;
    
    if (hitCoords.length > 0) {
        frequencyBoard = monteCarloHit(board, remainingLengths, hitCoords, simulations);
    } else {
        frequencyBoard = monteCarlo(board, remainingLengths, hitCoords, simulations);
    }

	// Normalize the frequency board and set the frequency of HIT squares to 0
	let maxFreq = 0;
	let maxCoord = [0, 0];

	for (let x = 0; x < 8; x++) {
		for (let y = 0; y < 8; y++) {
			frequencyBoard[x][y] /= simulations;  // Normalize the frequency values here
			if (hitCoords.some(coord => coord[0] === x && coord[1] === y)) {
				frequencyBoard[x][y] = 0;
			}
			if (frequencyBoard[x][y] > maxFreq) {
				maxFreq = frequencyBoard[x][y];
				maxCoord = [x, y];
			}
		}
	}

	// Output the coordinate with the highest probability
	console.log(`The coordinate with the highest probability is (${maxCoord[0] + 1}, ${maxCoord[1] + 1}) with a probability of ${(maxFreq * 100).toFixed(2)}%.`);

	// Visualize the frequency board on the HTML board
	updateBoardWithResults(frequencyBoard);

}

function printFrequencyBoard(frequencyBoard) {
    console.log('Frequency board:');
    for (let row of frequencyBoard) {
        console.log(row.map(val => val.toFixed(2)).join(' '));
    }
}

function determineRemainingShips(board, shipLengths) {
    let sunkShips = Array(5).fill(0);
    let validSunkShips = [];
    let error = null;

    for (let sunkIndex = 1; sunkIndex <= 5; sunkIndex++) {
        let shipCells = [];

        // Step 1: Find all squares with the current sunk number
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (board[i][j] === `S${sunkIndex}`) {
                    shipCells.push([i, j]);
                    sunkShips[sunkIndex - 1] += 1;
                }
            }
        }

        if (shipCells.length > 0) {
            // Step 2: Check if the sunk ship is vertically or horizontally aligned
            let isVertical = shipCells.every(cell => cell[0] === shipCells[0][0]);
            let isHorizontal = shipCells.every(cell => cell[1] === shipCells[0][1]);

            // Step 3: Check if the sunk ship squares are adjacent
            if (isVertical) {
                shipCells.sort((a, b) => a[1] - b[1]); // Sort by y-coordinate for vertical ship
                for (let i = 1; i < shipCells.length; i++) {
                    if (shipCells[i][1] !== shipCells[i - 1][1] + 1) {
                        error = `Error: Sunk ship S${sunkIndex} has non-adjacent squares`;
                        break;
                    }
                }
            } else if (isHorizontal) {
                shipCells.sort((a, b) => a[0] - b[0]); // Sort by x-coordinate for horizontal ship
                for (let i = 1; i < shipCells.length; i++) {
                    if (shipCells[i][0] !== shipCells[i - 1][0] + 1) {
                        error = `Error: Sunk ship S${sunkIndex} has non-adjacent squares`;
                        break;
                    }
                }
            } else {
                error = `Error: Sunk ship S${sunkIndex} is not aligned`;
                break;
            }

            // Step 4: Check if the length of the sunk ship matches one of the allowed lengths
            if (shipLengths.includes(shipCells.length)) {
                validSunkShips.push(shipCells.length);
            } else {
                error = `Error: Invalid sunk ship length ${shipCells.length}`;
                break;
            }
        }
    }

	// Step 5: Find remaining ship lengths
    let remainingLengths = [...shipLengths];
    let shipLengthCounts = new Map(shipLengths.map(x => [x, 0]));
    
    for (let validSunkShipLength of validSunkShips) {
        const index = remainingLengths.indexOf(validSunkShipLength);
        if (index !== -1) {
            remainingLengths.splice(index, 1);
        }
        shipLengthCounts.set(validSunkShipLength, shipLengthCounts.get(validSunkShipLength) + 1);
    }

    for (let [length, count] of shipLengthCounts.entries()) {
        if (count > shipLengths.filter(x => x === length).length) {
            error = `Error: Too many ships of length ${length} found.`;
            return { error };
        }
    }

    return { error, remainingLengths };
}





function setCellState(x, y, state) {
    if (state.startsWith("S")) {
        let currentText = document.getElementById(`cell-${x}-${y}`).innerText;
        let number = parseInt(currentText.replace("S", ""));
        if (!isNaN(number) && number < 4) {
            boardState[x][y] = "S" + (number + 1);
        } else {
            boardState[x][y] = "S0";
        }
    } else {
        boardState[x][y] = state;
    }
    
    document.getElementById(`cell-${x}-${y}`).innerText = boardState[x][y];
    console.log(boardState);
}




// Function to run the Monte Carlo simulation
function runMonteCarlo() {
    console.log('Running Monte Carlo simulation...');
    
    // Step 1: Get the current state of the board
    let boardState = [];
    for (let x = 0; x < 8; x++) {
        let row = [];
        for (let y = 0; y < 8; y++) {
            let cell = document.getElementById(`cell-${x}-${y}`);
            let cellState = cell.getAttribute('data-state');  
            row.push(cellState);
        }
        boardState.push(row);
    }

    console.log('Board state before calling main:', boardState);  // Add this line to log the board state


    main(boardState, shipLengths);

    console.log('Finished Monte Carlo simulation...');
}

    
for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
        const cell = document.createElement('div');
        cell.textContent = 'E';
        cell.setAttribute('data-state', 'E');
        cell.id = `cell-${x}-${y}`;
        cell.addEventListener('click', markCell);
        grid.appendChild(cell);
    }
}

// window.onload = () => {
    // for (let x = 0; x < 8; x++) {
        // for (let y = 0; y < 8; y++) {
            // let cell = document.getElementById(`cell-${x}-${y}`);
            // cell.addEventListener('click', () => {
                // setCellState(x, y, markingMode);  // Call setCellState with the current markingMode when the cell is clicked
            // });
        // }
    // }
// };
