function setPool(pos) {
  var rollResult = turnDice[pos - 1];
  var picPool = document.getElementsByName("dicePool")[pos - 1];
  var picScore = document.getElementsByName("diceScore")[pos - 1];

  picPool.setAttribute("src", "pics/dice" + rollResult + ".png");
  picScore.setAttribute("src", "pics/dice0.png");
}

function setScore(pos) {
  var rollResult = diceRecord[pos - 1];
  var picPool = document.getElementsByName("dicePool")[pos - 1];
  var picScore = document.getElementsByName("diceScore")[pos - 1];

  picScore.setAttribute("src", "pics/dice" + rollResult + ".png");
  picPool.setAttribute("src", "pics/dice0.png");
}

//roll 1 die
function rollDie(pos) {
  var pip = Math.ceil(Math.random() * 6); //roll a die
  turnDice[pos - 1] = pip;
  setPool(pos);
}

/* EXAMPLE of locking a die (LOCK 1,1,1,1)
BEFORE LOCK     --AFTER LOCK
pool [1,2,1,1,1] => [2,0,0,0,0]
score [0,0,0,0,0] => [1,1,1,1,0] */

//when click to a specific die in POOL, die locks(move itself to KEEPER spot), not being rolled in dice pool.
function lockDie(pos) {
  var dp = document.getElementsByName("dicePool");
  if (num != 0 && dp[pos - 1].getAttribute("src") != "pics/dice0.png") {
    diceRecord[pos - 1] = turnDice[pos - 1];
    turnDice[pos - 1] = 0;
    setScore(pos);
  } else {
    return;
  }
}

//when click to a specific die in KEEPER , locked die stop locking, returning itself back to POOL.
function unlockDie(pos) {
  var ds = document.getElementsByName("diceScore");
  if (num != 0 && ds[pos - 1].getAttribute("src") != "pics/dice0.png") {
    turnDice[pos - 1] = diceRecord[pos - 1];
    diceRecord[pos - 1] = 0;
    setPool(pos);
  } else {
    return;
  }
}

//class of score for each type, depending on difference combination of dice (as array)
class Score {
  constructor(dice) {
    this.dice = [...dice]; //clone
    this.sum = this.dice.reduce((acc, val) => acc + val, 0);
    this.a = [0, 0, 0, 0, 0, 0];
    dice.forEach((e) => this.a[e - 1]++);
  }

  //upper section
  aces() {
    return this.a[0];
  }
  twos() {
    return this.a[1] * 2;
  }
  threes() {
    return this.a[2] * 3;
  }
  fours() {
    return this.a[3] * 4;
  }
  fives() {
    return this.a[4] * 5;
  }
  sixes() {
    return this.a[5] * 6;
  }

  //lower section
  triple() {
    return this.a.filter((e) => e >= 3).length > 0 ? this.sum : 0;
  }
  quad() {
    return this.a.filter((e) => e >= 4).length > 0 ? this.sum : 0;
  }
  fullhouse() {
    return this.a.filter((e) => e >= 3).length > 0 &&
      this.a.filter((e) => e >= 2).length > 1
      ? this.sum
      : 0;
  }
  smallStraight() {
    var count = 0,
      temp = this.a.forEach((e) => {
        if (count == 4) return;
        count += e == 0 ? -count : 1;
      });
    return count >= 4 ? 30 : 0;
  }
  largeStraight() {
    var d = this.dice.sort((a, b) => a - b).join("");
    return d == "12345" || d == "23456" ? 40 : 0;
  }
  yahtzee() {
    return this.sum / 5 == this.dice[0] ? 50 : 0;
  }
  chance() {
    return this.sum;
  }

  possibleScore() {
    return [
      this.aces(),
      this.twos(),
      this.threes(),
      this.fours(),
      this.fives(),
      this.sixes(),
      this.triple(),
      this.quad(),
      this.fullhouse(),
      this.smallStraight(),
      this.largeStraight(),
      this.yahtzee(),
      this.chance(),
    ];
  }
}

/* ------------------------------------------------------PROGRAM------------------------------------------------------------------------ */

const scoringType = [
  "aces",
  "twos",
  "threes",
  "fours",
  "fives",
  "sixes",
  "triple",
  "quad",
  "fh",
  "sS",
  "lS",
  "yahtzee",
  "chance",
]; //string of type of scoring

//when user start a 'new' game.
function newGame() {
  num = 0; //# of rolls
  round = 1; //no. of rounds played
  document.getElementById("countRound").innerHTML = "ROUND " + round + "/13"; //display round
  document.getElementById("countNum").innerHTML = "ROLL DICE (" + num + "/3)"; //display number of rolls in 'ROLL DICE' button

  // example of gameRecord = [ [[1,3,2,5,1],'aces',3], [*turn-2 data*],..., [*turn-13 data*]] //
  gameRecord = []; //record data of every turn (1 to 13)
  turnDice = [0, 0, 0, 0, 0]; //record data of the dice of individual 'roll' in specific position, i.e., dice in 'POOL' spot (reset at the end of the turn)
  diceRecord = [0, 0, 0, 0, 0]; //record data of the 'locked' dice, dice in a 'KEEPER' spot  (reset at the end of the turn)
  turnRecord = []; //data in the turn, will be pushed into gameRecord [dice, what type user chooses to score, score user gets]

  var upperDisplay = document.getElementsByName("upperScoring"),
    lowerDisplay = document.getElementsByName("lowerScoring");
  var scoring = Array.from(upperDisplay).concat(Array.from(lowerDisplay));

  for (let i = 0; i < scoring.length; i++) {
    scoring[i].disabled = false;
    scoring[i].value = 0;
  }

  document.getElementById("upperTotalDisplay").innerHTML = 0;
  document.getElementById("lowerTotalDisplay").innerHTML = 0;
  document.getElementById("bonusDisplay").innerHTML = 0;

  document.getElementById("totalDisplay").innerHTML = 0; //display total score
  document.getElementById("btnRestart").hidden = true; //NOT display 'NEW GAME" button
  document.getElementById("roll").disabled = false; //display 'ROLL DICE' button
}

//total score
function cumulative() {
  //total
  var cmt = 0;
  for (let i = 0; i < gameRecord.length; i++) {
    cmt += gameRecord[i][2];
  }

  //bonus from upper section
  var upper = 0;
  var pool = new Score(turnDice.concat(diceRecord).filter((elem) => elem != 0));
  for (let i = 0; i < gameRecord.length; i++) {
    for (let j = 0; j < 6; j++) {
      if (gameRecord[i][1] == scoringType[j]) {
        upper += gameRecord[i][2];
      }
    }
  }
  bonus = upper >= 63 ? 35 : 0;
  return cmt + bonus;
}

//roll dice when press a 'ROLL' button
function roll() {
  //fixed num==4 bug
  if (num < 3) {
    for (let i = 0; i < turnDice.length; i++) {
      if (num == 0 || turnDice[i] != 0) rollDie(i + 1);
      else if (turnDice[i] == 0) continue;
    }
    num += 1;
    document.getElementById("countNum").innerHTML = "ROLL DICE (" + num + "/3)";
    displayScore();
  }
}

//show score for each type in score-sheet
function displayScore() {
  var pool = new Score(turnDice.concat(diceRecord).filter((elem) => elem != 0));

  //if(pool.dice.reduce((acc,val)=>acc+val,0)*0.2 == pool.dice[0]) isYahtzee+=1;

  var upperDisplay = document.getElementsByName("upperScoring"),
    lowerDisplay = document.getElementsByName("lowerScoring");
  var scoring = Array.from(upperDisplay).concat(Array.from(lowerDisplay));

  for (let i = 0; i < scoring.length; i++) {
    if (i < 6) {
      if (scoring[i].disabled) {
        for (let j = 0; j < gameRecord.length; j++) {
          if (gameRecord[j][1] == scoringType[i]) {
            upperDisplay[i].setAttribute("value", gameRecord[j][2]);
          }
        }
      } else {
        upperDisplay[i].setAttribute("value", pool.possibleScore()[i]);
      }
    } else {
      if (scoring[i].disabled) {
        for (let j = 0; j < gameRecord.length; j++) {
          if (gameRecord[j][1] == scoringType[i]) {
            lowerDisplay[i - 6].setAttribute("value", gameRecord[j][2]);
          }
        }
      } else {
        lowerDisplay[i - 6].setAttribute("value", pool.possibleScore()[i]);
      }
    }
  }
}

//-------------------------------POST-ROUND------------------------------------//

//reset the arrays of dice (prepare for the next round)
function resetDice() {
  turnDice = [0, 0, 0, 0, 0];
  diceRecord = [0, 0, 0, 0, 0];
  turnRecord = [];

  var picPool = document.getElementsByName("dicePool");
  var picScore = document.getElementsByName("diceScore");
  for (let i = 0; i < 5; i++) {
    picPool[i].setAttribute("src", "pics/dice0.png");
    picScore[i].setAttribute("src", "pics/dice0.png");
  }
}

//check if user gets bonus score (in upper section)
function checkBonus() {
  var upperDisplay = document.getElementsByName("upperScoring");

  var upper = 0;
  for (let i = 0; i < upperDisplay.length; i++) {
    upper += parseFloat(upperDisplay[i].value);
  }
  bonus = upper >= 63 ? 35 : 0;
  document.getElementById("bonusDisplay").innerHTML = bonus;
}

//record data of each turn
function recordTurn(i) {
  if (num != 0 && num <= 3) {
    var upperDisplay = document.getElementsByName("upperScoring"),
      lowerDisplay = document.getElementsByName("lowerScoring");

    (i < 6 ? upperDisplay[i] : lowerDisplay[i - 6]).setAttribute(
      "disabled",
      true
    );
    /*check 
                   if it is scored and disable one. ALSO set value to every button but disabled one.*/

    var scoring = Array.from(upperDisplay).concat(Array.from(lowerDisplay));
    var pool = new Score(
      diceRecord.concat(turnDice).filter((elem) => elem != 0)
    );

    //if(lowerDisplay[5].value!=0) isYahtzee+=1;

    turnRecord.push(pool.dice, scoringType[i], pool.possibleScore()[i]);
    gameRecord.push(turnRecord);

    //display score of 'ALL' disabled buttons
    for (let j = 0; j < scoring.length; j++) {
      if (!scoring[j].disabled) {
        (j < 6 ? upperDisplay[j] : lowerDisplay[j - 6]).setAttribute(
          "value",
          0
        );
      }
    }

    var upper = 0,
      lower = 0;
    for (let i = 0; i < upperDisplay.length; i++)
      upper += parseFloat(upperDisplay[i].value);

    for (let i = 0; i < lowerDisplay.length; i++)
      lower += parseFloat(lowerDisplay[i].value);

    document.getElementById("upperTotalDisplay").innerHTML = upper;
    document.getElementById("lowerTotalDisplay").innerHTML = lower;

    checkBonus();
    resetTurn();
  }
}

//preparation for the next turn
function resetTurn() {
  if (num <= 3) {
    resetDice();

    document.getElementById("totalDisplay").innerHTML = cumulative();

    //display new round(round=round+1) and number of roll(num=0)
    num = 0;
    round += 1;
    if (round <= 13) {
      document.getElementById("countRound").innerHTML =
        "ROUND " + round + "/13"; //display round
      document.getElementById("countNum").innerHTML =
        "ROLL DICE (" + num + "/3)"; //display number of rolls in 'ROLL DICE' button
    }

    if (round > 13) {
      alert('The game is finished. Score in "Total" row is your final score.');
      /*'NEW GAME' button appears. 'ROLL DICE' button disappears.*/
      document.getElementById("roll").disabled = true;
      document.getElementById("btnRestart").hidden = false;
    }
  }
}

/*
ppt slide outline
1. rule
2. ui (html,'css XX')
3. ***js

*/
