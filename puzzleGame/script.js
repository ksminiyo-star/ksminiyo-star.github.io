document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('puzzle-board');
    const piecesPool = document.getElementById('pieces-pool');
    const btnReset = document.getElementById('btn-reset');
    const btnHint = document.getElementById('btn-hint');
    const successModal = document.getElementById('success-modal');
    const btnModalClose = document.getElementById('btn-modal-close');
    const hintOverlay = document.getElementById('hint-overlay');

    const ROWS = 3;
    const COLS = 3;
    const TOTAL_PIECES = ROWS * COLS;

    // Image source
    const imgObj = new Image();
    imgObj.src = 'dog_puzzle.png';

    let pieces = [];
    let isDragging = false;
    let draggedPiece = null;

    imgObj.onload = () => {
        initGame();
    };

    function initGame() {
        // Clear containers
        board.innerHTML = '';
        piecesPool.innerHTML = '';
        pieces = [];

        // Determine piece size based on board size (fixed in CSS for simplicity, but we can compute)
        // For simplicity, we assume the image is square or we crop it square.
        // We will set the background size/position of divs.

        const boardWidth = board.clientWidth;
        const boardHeight = board.clientHeight;
        const pieceWidth = boardWidth / COLS;
        const pieceHeight = boardHeight / ROWS;

        // Create Grid Cells
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.dataset.index = r * COLS + c;

                // Allow Drop
                cell.addEventListener('dragover', handleDragOver);
                cell.addEventListener('dragleave', handleDragLeave);
                cell.addEventListener('drop', handleDrop);

                board.appendChild(cell);
            }
        }

        // Create Pieces
        for (let i = 0; i < TOTAL_PIECES; i++) {
            const piece = document.createElement('div');
            piece.classList.add('puzzle-piece');
            piece.draggable = true;
            piece.id = `piece-${i}`;
            piece.dataset.correctIndex = i;

            // Set background
            const row = Math.floor(i / COLS);
            const col = i % COLS;

            piece.style.backgroundImage = `url('${imgObj.src}')`;
            piece.style.backgroundSize = `${boardWidth}px ${boardHeight}px`; // Scale image to board size
            piece.style.backgroundPosition = `-${col * pieceWidth}px -${row * pieceHeight}px`;

            // Drag Events
            piece.addEventListener('dragstart', handleDragStart);
            piece.addEventListener('dragend', handleDragEnd);

            pieces.push(piece);
        }

        // Shuffle and add to Pool
        shuffleArray(pieces);
        pieces.forEach(p => piecesPool.appendChild(p));
    }

    // Drag & Drop Handlers
    function handleDragStart(e) {
        draggedPiece = this;
        // Use timeout to hide the element while keeping the drag image visible
        setTimeout(() => this.classList.add('hide'), 0);
        e.dataTransfer.effectAllowed = 'move';
        // e.dataTransfer.setData('text/plain', this.id); // Not strictly needed if we use closure variable
    }

    function handleDragEnd(e) {
        this.classList.remove('hide');
        draggedPiece = null;

        // Clean up any drag-over states
        document.querySelectorAll('.grid-cell').forEach(cell => cell.classList.remove('drag-over'));
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        this.classList.add('drag-over');
    }

    function handleDragLeave(e) {
        this.classList.remove('drag-over');
    }

    function handleDrop(e) {
        e.preventDefault();
        this.classList.remove('drag-over');

        if (!draggedPiece) return;

        // If cell already has a child, move that child back to pool? Or Swap?
        // Let's implement: If occupied, swap. If not, place.
        // Actually simpler: If occupied, don't drop? Or return existing to pool.

        // Let's try "Return existing to pool" approach for simplicity.
        if (this.children.length > 0) {
            const existingPiece = this.children[0];
            piecesPool.appendChild(existingPiece);
        }

        this.appendChild(draggedPiece);
        checkWin();
    }

    // Also allow dropping back to pool
    piecesPool.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    });

    piecesPool.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedPiece) {
            piecesPool.appendChild(draggedPiece);
        }
    });

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function checkWin() {
        const cells = document.querySelectorAll('.grid-cell');
        let correctCount = 0;

        cells.forEach(cell => {
            if (cell.children.length === 0) return;
            const piece = cell.children[0];
            const cellIndex = parseInt(cell.dataset.index);
            const pieceIndex = parseInt(piece.dataset.correctIndex);

            if (cellIndex === pieceIndex) {
                correctCount++;
            }
        });

        if (correctCount === TOTAL_PIECES) {
            // Slight delay to allow DOM to update
            setTimeout(() => {
                successModal.classList.remove('hidden');
            }, 300);
        }
    }

    // Buttons
    btnReset.addEventListener('click', initGame);

    btnHint.addEventListener('click', () => {
        hintOverlay.classList.remove('hidden');
    });

    hintOverlay.addEventListener('click', () => {
        hintOverlay.classList.add('hidden');
    });

    btnModalClose.addEventListener('click', () => {
        successModal.classList.add('hidden');
        initGame(); // Optional: restart after closing modal
    });
});
