//MineSweeper Challenge

//Global variables
var time = 0;
var difficultyLevel;
var numberOfMines;
var rows, columns;
var mineLocation = [];
var flagCount;
var revealedCounter = 0;
var counterCheck = 0;
var StartClick = 1;
var disableCheck = false;
var tileCount = [];
var timeReset = 0;

// Plot the mines after first click
function plotMines(location) {
  var i = 0;
  let neigbourLists = findNeighbours(parseInt(location));
  neigbourLists.push(location);

  //Distribute mines on random locations
  while (i < numberOfMines) {
    var randomNumber = Math.floor(Math.random() * (rows * columns) + 1);

    if (
      !neigbourLists.includes(randomNumber) &&
      !document.getElementById(randomNumber).classList.contains("mine")
    ) {
      mineLocation.push(randomNumber);
      document.getElementById(randomNumber).classList.add("mine");
      i++;
    }
  }

  // Below loop will distribute numbers around the mine location
  // and count will be increased based on number of adjacent mines.
  for (let i = 0; i < mineLocation.length; i++) {
    var neigbourList = findNeighbours(mineLocation[i]);
    for (let i in neigbourList) {
      if (
        !document.getElementById(neigbourList[i]).classList.contains("mine")
      ) {
        document
          .getElementById(neigbourList[i])
          .classList.add(`tile_` + neigbouringCount(neigbourList[i]));
      }
    }
  }
}

//BuidlGrib based on difficulty level
function buildGrid() {
  mineLocation = [];

  // Fetch grid and clear out old elements.
  var grid = document.getElementById("minefield");
  grid.innerHTML = "";
  difficultyLevel = document.getElementById("difficulty");

  if (difficultyLevel.selectedIndex == 0) {
    rows = 9;
    columns = 9;
    numberOfMines = 10;
    flagCount = 10;
  } else if (difficultyLevel.selectedIndex == 1) {
    rows = 16;
    columns = 16;
    numberOfMines = 40;
    flagCount = 40;
  } else {
    rows = 30;
    columns = 16;
    numberOfMines = 99;
    flagCount = 99;
  }

  document.getElementById("flagCount").innerHTML = flagCount;

  // Build DOM Grid
  var tile;
  for (var y = 0; y < rows; y++) {
    for (var x = 0; x < columns; x++) {
      tile = createTile(x, y);
      grid.appendChild(tile);
    }
  }

  var style = window.getComputedStyle(tile);
  var width = parseInt(style.width.slice(0, -2));
  var height = parseInt(style.height.slice(0, -2));

  grid.style.width = columns * width + "px";
  grid.style.height = rows * height + "px";
}

function createTile(x, y) {
  var tile = document.createElement("div");

  tile.setAttribute("id", y * columns + x + 1);

  tile.classList.add("tile");
  tile.classList.add("hidden");

  tile.addEventListener("auxclick", function (e) {
    e.preventDefault();
  }); // Middle Click
  tile.addEventListener("contextmenu", function (e) {
    e.preventDefault();
  }); // Right Click
  tile.addEventListener("mouseup", handleTileClick); // All Clicks
  tile.addEventListener("mousedown", mouseDown);
  return tile;
}

function startGame() {
  disableCheck = false; // it will not allow to click if you lose the game
  StartClick = 1; // Variable to check if it's first click or not
  tileCount = [];
  buildGrid();
  startTimer();
}

function smileyDown() {
  var smiley = document.getElementById("smiley");
  smiley.classList.toggle("face_down");
}

function smileyUp() {
  var smiley = document.getElementById("smiley");
  smiley.classList.remove("face_win");
  smiley.classList.remove("face_lose");
  smiley.classList.remove("face_down");
}

// Up click
function handleTileClick(event) {
  if (disableCheck == true) {
    return;
  }

  if (parseInt(event.which) != 3) {
    document.getElementById("smiley").classList.remove("face_limbo");
  }
  // Left click
  if (event.which === 1) {
    //TODO reveal the tile

    // It will reveal the tile and if it's a mine then GameOver, otherwise it will continue to open new tiles.
    if (event.target.classList.contains("hidden")) {
      if (event.target.classList.contains("flag")) {
        return;
      }

      if (event.target.classList.contains("mine")) {
        revealMines(event, []);
      }
      if (!event.target.className.includes("_")) {
        event.target.classList.remove("hidden");
        blow(parseInt(event.target.id));
      } else {
        event.target.classList.remove("hidden");
        if (!tileCount.includes(event.target.id)) {
          tileCount.push(event.target.id);
        }
        // revealedCounter++;
      }
    }

    //This condition will check if all tiles are opened and mine are not, then it's a win condition
    if (tileCount.length + numberOfMines == rows * columns) {
      document.getElementById("smiley").classList.toggle("face_win");
    }
  }

  // Middle Click
  else if (event.which === 2) {
    //TODO try to reveal adjacent tiles
    if (event.target.classList.contains("flag")) {
      return;
    }
    let neighboursList = findNeighbours(parseInt(event.target.id));

    // Part of adjacent tiles highlighting
    for (let i in neighboursList) {
      document.getElementById(neighboursList[i]).classList.remove("clear");
    }

    let tile_id = parseInt(event.target.id);
    // if it's a number then open that particular tile
    if (document.getElementById(event.target.id).className.includes("_")) {
      document.getElementById(event.target.id).classList.remove("hidden");
      if (!tileCount.includes(tile_id)) {
        tileCount.push(tile_id);
      }
    }
    // If it's a mine then reveal all mines and GameOver
    if (
      document
        .getElementById(parseInt(event.target.id))
        .classList.contains("mine")
    ) {
      revealMines(event, []);
    }
    // If it's not a number or mine then blow all the adajacent tile which doesn't include mine
    if (!event.target.className.includes("_")) {
      event.target.classList.remove("hidden");
      if (!tileCount.includes(tile_id)) {
        tileCount.push(tile_id);
      }
      blow(parseInt(event.target.id));
    }

    // Game Win Condition
    if (tileCount.length + numberOfMines == rows * columns) {
      document.getElementById("smiley").classList.toggle("face_win");
    }
  }

  // Right Click
  else if (event.which === 3) {
    //TODO toggle a tile flag
    let location = parseInt(event.target.id);
    // It will just allow the user to place flag on the clicked position and maintains that flagCount donot exceed number of mines.
    if (
      flagCount > 0 &&
      !document.getElementById(location).className.includes("flag") &&
      document.getElementById(location).className.includes("hidden")
    ) {
      document.getElementById(location).classList.add("flag");
      flagCount--;
    } else if (document.getElementById(location).className.includes("flag")) {
      document.getElementById(location).classList.remove("flag");
      flagCount++;
    }
    document.getElementById("flagCount").innerHTML = flagCount;
  }
}

function startTimer() {
  timeValue = 0;
  clearInterval(timeReset);
  timeReset = window.setInterval(onTimerTick, 1000);
}

function onTimerTick() {
  timeValue++;
  updateTimer();
}

function updateTimer() {
  document.getElementById("timer").innerHTML = timeValue;
}

// This loop will give the number of count of adjacent tiles which which are not mine
function neigbouringCount(neigbouring) {
  if (!document.getElementById(neigbouring).classList.contains("mine")) {
    let className1 = document.getElementById(neigbouring).className;
    if (className1.includes("_")) {
      return parseInt(className1[className1.length - 1]) + 1;
    } else {
      return 1;
    }
  }
}

// This function will open all adjacent tiles which are not mine
// It is a recurisve function, so at the end, it will not all the tiles which are in the range
function blow(location) {
  location = parseInt(location);

  if (!tileCount.includes(location)) {
    tileCount.push(location);
  }

  if (
    !document.getElementById(location).classList.contains("hidden") &&
    !document.getElementById(location).classList.contains("_") &&
    !document.getElementById(location).classList.contains("mine")
  ) {
    let neigbours = findNeighbours(location);

    for (let i in neigbours) {
      if (
        !document.getElementById(neigbours[i]).className.includes("_") &&
        !document.getElementById(neigbours[i]).classList.contains("flag") &&
        document.getElementById(neigbours[i]).classList.contains("hidden")
      ) {
        if (!tileCount.includes(neigbours[i])) {
          tileCount.push(neigbours[i]);
        }

        document.getElementById(neigbours[i]).classList.remove("hidden");
        blow(neigbours[i]);
      } else if (
        !document.getElementById(neigbours[i]).classList.contains("flag") &&
        document.getElementById(neigbours[i]).classList.contains("hidden")
      ) {
        if (!tileCount.includes(neigbours[i])) {
          tileCount.push(neigbours[i]);
        }
        document.getElementById(neigbours[i]).classList.remove("hidden");
      }
    }
  }
}

// When the mouse click is down, this function will be called.
// This function will all the user to open the first tile without any mine check.
// At middle click, this function will highlight all 8 adjacent tiles.
function mouseDown(event) {
  if (disableCheck == true) {
    return;
  }
  if (StartClick == 1) {
    if (event.which == 3) {
      return;
    }
    if (
      document
        .getElementById(parseInt(event.target.id))
        .className.includes("flag")
    ) {
      return;
    }
    plotMines(parseInt(event.target.id));
    StartClick = 0;
    return;
  }
  if (
    parseInt(event.which) != 3 &&
    document
      .getElementById(parseInt(event.target.id))
      .classList.contains("hidden")
  ) {
    document.getElementById("smiley").classList.toggle("face_limbo");
  }
  let location = parseInt(event.target.id);
  let arr = document.getElementById(location).className;
  let locationNumber = arr.substring(arr.length - 1);
  let flagCurrentCount = 0;

  if (event.which == 2) {
    let neighbourFlags = checkNeighbourFlag(parseInt(event.target.id));
    let neighboursList = findNeighbours(parseInt(event.target.id));

    let arr = [];
    if (neighbourFlags != locationNumber) {
      if (
        !document.getElementById(event.target.id).className.includes("hidden")
      ) {
        for (let i in neighboursList) {
          if (
            document
              .getElementById(neighboursList[i])
              .classList.contains("hidden") &&
            !document
              .getElementById(neighboursList[i])
              .classList.contains("flag")
          ) {
            document.getElementById(neighboursList[i]).classList.add("clear");
          }
        }
      }
    } else {
      for (let i in neighboursList) {
        if (
          document
            .getElementById(neighboursList[i])
            .classList.contains("flag") &&
          document.getElementById(neighboursList[i]).classList.contains("mine")
        ) {
          flagCurrentCount++;
        } else {
          arr.push(neighboursList[i]);
        }
      }
      // if all the adjacent tiles have flags exactly on the mines, then open all other tiles and their neighbours
      // it not, then reveal all the mines location and game overs
      if (flagCurrentCount == neighbourFlags) {
        blow(location);
      } else {
        revealMines(event, arr);
      }
    }
  }
}

// This function will check number of flags placed on the adjacent tiles.
function checkNeighbourFlag(event) {
  var location = event;
  let count = 0;
  let neigboursList = findNeighbours(parseInt(location));

  for (let i in neigboursList) {
    if (document.getElementById(neigboursList[i]).classList.contains("flag")) {
      count++;
    }
  }
  return count;
}

// This function will be called on the user click on the tile which have the mine below.
// It will reveal all the mine location and game overs after that.
function revealMines(event, arr) {
  let location = parseInt(event.target.id);
  document.getElementById(parseInt(event.target.id)).classList.add("mine_hit");
  for (let i = 0; i < mineLocation.length; i++) {
    document.getElementById(mineLocation[i]).classList.remove("hidden");
    if (!arr.includes(mineLocation[i])) {
      revealedCounter++;
      if (document.getElementById(mineLocation[i]).classList.contains("flag")) {
        document.getElementById(mineLocation[i]).classList.add("mine_marked");

        document.getElementById(mineLocation[i]).classList.remove("flag");
      }
    } else {
      document.getElementById(mineLocation[i]).classList.add("mine_hit");
    }
  }
  disableCheck = true;
  document.getElementById("smiley").classList.toggle("face_lose");
}

// This function will add all the adjacent tiles location in an array.
function findNeighbours(location) {
  var neighbours = [];
  location = parseInt(location);
  //left Tile
  if (location - 1 > 0 && (location - 1) % columns != 0) {
    neighbours.push(parseInt(location - 1));
  }
  //Right Tile
  if (location + 1 <= rows * columns && (location + 1) % columns != 1) {
    neighbours.push(parseInt(location + 1));
  }
  //TopLeft tile
  if (location - columns - 1 > 0 && (location - columns - 1) % columns != 0) {
    neighbours.push(parseInt(location - columns - 1));
  }
  //topRight Tile
  if (location - columns + 1 > 0 && (location - columns + 1) % columns != 1) {
    neighbours.push(parseInt(location - columns + 1));
  }
  //BottomRight tile
  if (
    location + columns + 1 <= rows * columns &&
    (location + columns + 1) % columns != 1
  ) {
    neighbours.push(parseInt(location + columns + 1));
  }
  //BottomLeft tile
  if (
    location + columns - 1 <= rows * columns &&
    (location + columns - 1) % columns != 0
  ) {
    neighbours.push(parseInt(location + columns - 1));
  }
  //top tile
  if (location - columns > 0) {
    neighbours.push(parseInt(location - columns));
  }
  //bottom tile
  if (location + columns <= rows * columns) {
    neighbours.push(parseInt(location + columns));
  }
  return neighbours;
}
