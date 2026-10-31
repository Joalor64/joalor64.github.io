(function () {
    const FALLBACK_WORDS = [
        "apple", "beach", "bread", "cloud", "dance", "eagle", "flame", "grape", "happy", "hello",
        "jolly", "knock", "lemon", "mango", "night", "ocean", "party", "queen", "river", "smile",
        "stone", "sweet", "torch", "valor", "water", "world", "yacht", "zebra", "alien", "baker",
        "cabin", "daisy", "ember", "frost", "grace", "honey", "ivory", "joker", "laser", "mount",
        "noble", "olive", "pearl", "quake", "robin", "siren", "tease", "unite", "vivid", "wagon"
    ];

    const WORD_LIST_URL = "/data/wordle.json";
    const KEY_ROWS = [
        ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
        ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
        ["enter", "z", "x", "c", "v", "b", "n", "m", "backspace"]
    ];

    const MAX_GUESSES = 6;
    const WORD_LENGTH = 5;

    const boardEl = document.getElementById("gameBoard");
    const messageEl = document.getElementById("message");
    const resetButton = document.getElementById("resetButton");
    const keyboardEl = document.getElementById("keyboard");

    let answerWords = [...FALLBACK_WORDS];
    let validWords = new Set(FALLBACK_WORDS);
    let secretWord = "";
    let board = [];
    let currentRow = 0;
    let currentCol = 0;
    let gameOver = false;
    let letterStatus = {};
    let guessedWords = new Set();
    let evaluatedRows = {};

    function setMessage(text, isError = false) {
        messageEl.textContent = text;
        messageEl.classList.toggle("error", isError);
    }

    function buildBoard() {
        boardEl.innerHTML = "";

        for (let row = 0; row < MAX_GUESSES; row++) {
            for (let col = 0; col < WORD_LENGTH; col++) {
                const tile = document.createElement("div");
                tile.className = "tile";
                tile.dataset.row = row;
                tile.dataset.col = col;
                tile.setAttribute("aria-label", `Row ${row + 1}, column ${col + 1}`);
                boardEl.appendChild(tile);
            }
        }
    }

    function buildKeyboard() {
        keyboardEl.innerHTML = "";

        KEY_ROWS.forEach((rowKeys) => {
            const row = document.createElement("div");
            row.className = "keyboard-row";

            rowKeys.forEach((key) => {
                const button = document.createElement("button");
                button.type = "button";
                button.className = "key" + (key === "enter" || key === "backspace" ? " wide" : "");
                button.dataset.key = key;
                button.textContent = key === "backspace" ? "⌫" : key === "enter" ? "Enter" : key.toUpperCase();
                button.addEventListener("click", () => handleKeyPress(key));
                row.appendChild(button);
            });

            keyboardEl.appendChild(row);
        });

        updateKeyboardState();
    }

    function updateKeyboardState() {
        keyboardEl.querySelectorAll(".key").forEach((button) => {
            const key = button.dataset.key;
            if (!key || key === "enter" || key === "backspace") {
                button.classList.remove("correct", "present", "absent");
                return;
            }

            const status = letterStatus[key.toLowerCase()] || "";
            button.classList.remove("correct", "present", "absent");
            if (status) {
                button.classList.add(status);
            }
        });
    }

    function syncBoard() {
        const tiles = boardEl.querySelectorAll(".tile");
        tiles.forEach((tile) => {
            const row = Number(tile.dataset.row);
            const col = Number(tile.dataset.col);
            const rowState = evaluatedRows[row];
            const value = rowState ? rowState.guess[col] : (board[row][col] || "");
            const result = rowState ? rowState.result[col] : "";

            tile.textContent = value || "";
            tile.classList.toggle("filled", value !== "");
            tile.classList.remove("correct", "present", "absent", "revealed");

            if (rowState) {
                tile.classList.add(result, "revealed");
            }
        });
    }

    function evaluateGuess(guess) {
        const result = Array(WORD_LENGTH).fill("absent");
        const secretChars = secretWord.split("");
        const guessChars = guess.split("");

        for (let i = 0; i < WORD_LENGTH; i++) {
            if (guessChars[i] === secretChars[i]) {
                result[i] = "correct";
                secretChars[i] = null;
            }
        }

        for (let i = 0; i < WORD_LENGTH; i++) {
            if (result[i] !== "correct") {
                const indexInSecret = secretChars.indexOf(guessChars[i]);
                if (indexInSecret !== -1) {
                    result[i] = "present";
                    secretChars[indexInSecret] = null;
                }
            }
        }

        return result;
    }

    function updateLetterStatus(guess, result) {
        const guessChars = guess.split("");

        guessChars.forEach((letter, index) => {
            const newStatus = result[index];
            const existingStatus = letterStatus[letter];

            if (newStatus === "correct") {
                letterStatus[letter] = "correct";
                return;
            }

            if (newStatus === "present" && existingStatus !== "correct") {
                letterStatus[letter] = "present";
                return;
            }

            if (newStatus === "absent" && !existingStatus) {
                letterStatus[letter] = "absent";
            }
        });

        updateKeyboardState();
    }

    function revealRow(row, guess, result) {
        for (let i = 0; i < guess.length; i++) {
            board[row][i] = guess[i];
        }

        evaluatedRows[row] = { guess, result };
        const tiles = boardEl.querySelectorAll(`.tile[data-row="${row}"]`);

        tiles.forEach((tile, index) => {
            tile.textContent = guess[index];
            tile.classList.add(result[index], "revealed");
            tile.classList.remove("filled");
        });
    }

    function handleKeyPress(key) {
        const actualKey = String(key).toLowerCase();

        if (actualKey === "enter") {
            submitGuess();
            return;
        }

        if (actualKey === "backspace") {
            removeLetter();
            return;
        }

        if (/^[a-z]$/.test(actualKey)) {
            addLetter(actualKey);
        }
    }

    function addLetter(letter) {
        if (gameOver) return;
        if (currentCol >= WORD_LENGTH) return;

        board[currentRow][currentCol] = letter;
        currentCol += 1;
        syncBoard();
    }

    function removeLetter() {
        if (gameOver) return;
        if (currentCol === 0) return;

        currentCol -= 1;
        board[currentRow][currentCol] = "";
        syncBoard();
    }

    function submitGuess() {
        if (gameOver) return;

        const guess = board[currentRow].join("");
        if (guess.length < WORD_LENGTH) {
            setMessage("Not enough letters.", true);
            return;
        }

        if (!validWords.has(guess)) {
            setMessage("Not in the word list.", true);
            return;
        }

        if (guessedWords.has(guess)) {
            setMessage("You already guessed that word.", true);
            return;
        }

        guessedWords.add(guess);

        const result = evaluateGuess(guess);
        updateLetterStatus(guess, result);
        revealRow(currentRow, guess.split(""), result);

        if (guess === secretWord) {
            gameOver = true;
            setMessage("You win! Press reset to play again.");
            return;
        }

        currentRow += 1;
        currentCol = 0;

        if (currentRow >= MAX_GUESSES) {
            gameOver = true;
            setMessage(`Out of guesses! The word was ${secretWord.toUpperCase()}.`);
            return;
        }

        setMessage("");
    }

    async function loadWordList() {
        try {
            const data = await fetchJSON(WORD_LIST_URL);
            const clean = (list) => (list || []).map((w) => String(w).toLowerCase()).filter((w) => /^[a-z]{5}$/.test(w));
            const answers = clean(data.answers);
            if (!answers.length) throw new Error("No answers in word list");

            answerWords = answers;
            validWords = new Set([...answers, ...clean(data.guesses), ...FALLBACK_WORDS]);
        } catch (error) {
            console.warn("Using the built-in word list:", error);
        }

        resetGame();
    }

    function resetGame() {
        secretWord = answerWords[Math.floor(Math.random() * answerWords.length)];
        board = Array.from({ length: MAX_GUESSES }, () => Array(WORD_LENGTH).fill(""));
        currentRow = 0;
        currentCol = 0;
        gameOver = false;
        letterStatus = {};
        guessedWords = new Set();
        evaluatedRows = {};
        setMessage("");
        buildBoard();
        syncBoard();
        updateKeyboardState();
    }

    document.addEventListener("keydown", (event) => {
        if (event.ctrlKey || event.metaKey || event.altKey) return;
        if (event.target.closest("input, textarea, select, [contenteditable]")) return;

        const key = event.key;
        let action = null;
        if (/^[a-z]$/i.test(key)) action = key;
        else if (key === "Backspace") action = "backspace";
        else if (key === "Enter") action = "enter";
        if (!action) return;
        if (action === "enter" && event.target.id === "resetButton") return;

        event.preventDefault();
        handleKeyPress(action);
    });

    resetButton.addEventListener("click", () => {
        resetGame();
    });

    buildBoard();
    buildKeyboard();
    loadWordList();
})();