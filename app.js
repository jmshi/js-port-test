const GameCanvas = () => {
            const canvasRef = React.useRef(null);
            const [blocks, setBlocks] = React.useState([]);
            const [level, setLevel] = React.useState(0);
            const [isGameFinished, setIsGameFinished] = React.useState(false); 
            const levels = [
                [ // Level 1
                    "bbbbbbbbbb",
                    "b        b",
                    "b   o    b",
                    "b        b",
                    "b        b",
                    "b        b",
                    "b        b",
                    "b   m    b",
                    "b   @    b",
                    "bbbbbbbbbb",
                ],
                [ // Level 2
                    "bbbbbbbbbb",
                    "b @      b",
                    "b m o    b",
                    "b        b",
                    "b        b",
                    "b        b",
                    "b        b",
                    "b        b",
                    "b        b",
                    "bbbbbbbbbb",
                ],
                [ // Revised Level 3
                    "bbbbbbbbbb",
                    "b @ m  o b",
                    "bbbbbb   b",
                    "b o m    b",
                    "b   bbbbbb",
                    "b m      b",
                    "b o      b",
                    "b   bbbbbb",
                    "b        b",
                    "bbbbbbbbbb"
                ],
                [ // Level 4
                    "bbbbbbbbbb",
                    "b@       b",
                    "b m      b",
                    "b o      b",
                    "b   bbbb b",
                    "b b m  o b",
                    "b b      b",
                    "b   m  o b",
                    "b        b",
                    "bbbbbbbbbb"
                ]
            ];

            const loadLevel = () => {
                const currentLevelData = levels[level];
                if (!currentLevelData) {
                    console.error("Level data not found for level:", level);
                    setIsGameFinished(true); 
                    return;
                }
                const newBlocks = [];
                let playerPlaced = false; 
                for (let i = 0; i < levels[level].length; i++) {
                    for (let j = 0; j < levels[level][i].length; j++) {
                        const char = levels[level][i][j];
                        const x = j * 40;
                        const y = i * 40;
                        switch (char) {
                            case "b":
                                newBlocks.push({ x, y, type: "normal" });
                                break;
                            case "@":
                                if (!playerPlaced) {
                                    newBlocks.push({ x, y, type: "player" });
                                    playerPlaced = true;
                                }
                                break;
                            case "m":
                                newBlocks.push({ x, y, type: "movable", id: `movable-${level}-${i}-${j}` });
                                break;
                            case "o":
                                newBlocks.push({ x, y, type: "portal" });
                                break;
                        }
                    }
                }
                setBlocks(newBlocks);
                setIsGameFinished(false); 
            };

            React.useEffect(() => {
                loadLevel();
            }, [level]); 

            React.useEffect(() => {
                const canvas = canvasRef.current;
                if (!canvas) return;
                const ctx = canvas.getContext("2d");

                const draw = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    blocks.forEach((block) => {
                        switch (block.type) {
                            case "normal": ctx.fillStyle = "black"; break;
                            case "player": ctx.fillStyle = "red"; break;
                            case "movable": ctx.fillStyle = "blue"; break;
                            case "portal": ctx.fillStyle = "purple"; break;
                            default: ctx.fillStyle = "grey"; 
                        }
                        ctx.fillRect(block.x, block.y, 40, 40);
                    });
                };
                draw();
            }, [blocks]);

            const checkWinCondition = (currentBlocks) => {
                if (currentBlocks.length === 0) return false; // Not a win if blocks are empty (e.g. during load)
                const playerExists = currentBlocks.some(b => b.type === "player");
                if (!playerExists && level < levels.length) return false; // Not a win if player somehow removed mid-level

                const remainingMovables = currentBlocks.filter(b => b.type === "movable").length;
                if (remainingMovables === 0) {
                    if (level + 1 < levels.length) {
                        setLevel(level + 1);
                    } else {
                        setIsGameFinished(true);
                    }
                    return true; 
                }
                return false; 
            };

            const handleKeyDown = (event) => {
                if (isGameFinished) return; 

                const player = blocks.find(block => block.type === "player");
                if (!player) return;

                let currentBlocksState = [...blocks]; 
                let playerX = player.x;
                let playerY = player.y;
                let dx = 0; 
                let dy = 0;

                switch (event.key) {
                    case "ArrowUp": playerY -= 40; dy = -40; break;
                    case "ArrowDown": playerY += 40; dy = 40; break;
                    case "ArrowLeft": playerX -= 40; dx = -40; break;
                    case "ArrowRight": playerX += 40; dx = 40; break;
                    default: return;
                }

                if (playerX < 0 || playerX >= 400 || playerY < 0 || playerY >= 400) return;

                const targetBlockInOriginalState = currentBlocksState.find(block => block.x === playerX && block.y === playerY);
                let nextBlocksState = [...currentBlocksState]; 

                if (targetBlockInOriginalState) {
                    if (targetBlockInOriginalState.type === "normal") {
                        return; 
                    } else if (targetBlockInOriginalState.type === "movable") {
                        const movableNewX = targetBlockInOriginalState.x + dx;
                        const movableNewY = targetBlockInOriginalState.y + dy;

                        if (movableNewX < 0 || movableNewX >= 400 || movableNewY < 0 || movableNewY >= 400) return;

                        const obstacleForMovable = currentBlocksState.find(block => block.x === movableNewX && block.y === movableNewY && block.id !== targetBlockInOriginalState.id);

                        if (obstacleForMovable && obstacleForMovable.type === "portal") {
                            nextBlocksState = currentBlocksState
                                .filter(b => b.id !== targetBlockInOriginalState.id) 
                                .filter(b => !(b.type === "portal" && b.x === movableNewX && b.y === movableNewY))
                                .map(b => b.type === "player" ? { ...b, x: playerX, y: playerY } : b);
                            // Win condition must be checked on the *final* state of blocks after this operation.
                            // The setBlocks will trigger the useEffect for win condition, or we check it immediately.
                            // For immediate check after portal:
                            if (checkWinCondition(nextBlocksState)) {
                                // setBlocks is implicitly handled by setLevel or setIsGameFinished if win condition met
                                return; 
                            }
                        } else if (obstacleForMovable && (obstacleForMovable.type === "normal" || obstacleForMovable.type === "movable")) {
                            return; 
                        } else { // Movable block moves to an empty space
                            nextBlocksState = currentBlocksState.map(b => {
                                if (b.type === "player") return { ...b, x: playerX, y: playerY };
                                if (b.id === targetBlockInOriginalState.id) return { ...b, x: movableNewX, y: movableNewY };
                                return b;
                            });
                        }
                    }
                } else { // Player moves into an empty space
                    nextBlocksState = currentBlocksState.map(b => 
                        b.type === "player" ? { ...b, x: playerX, y: playerY } : b
                    );
                }
                
                setBlocks(nextBlocksState);
                // Check win condition after any player move that results in setBlocks
                // This is a common place, but checkWinCondition is also called from portal logic for immediate effect.
                // To avoid duplicate calls if portal logic already handled it, ensure checkWinCondition is idempotent or flow control prevents it.
                // The current structure where portal logic returns if win is met is good.
                // However, if player just moves and that move *itself* doesn't trigger portal but somehow clears last block (not typical for this game), this would catch it.
                // Let's rely on the portal logic's checkWinCondition for portal-clears, and a general check can be added via useEffect if needed,
                // but the current direct call in portal logic is more immediate.
                // For now, let's assume the explicit call in the portal interaction path is sufficient.
            };

            React.useEffect(() => {
                window.addEventListener("keydown", handleKeyDown);
                return () => window.removeEventListener("keydown", handleKeyDown);
            }, [blocks, level, isGameFinished]); // Rerun if blocks, level, or game status change

            const handleRestart = () => {
                setLevel(0); 
            };

            if (isGameFinished) {
                return (
                    <div>
                        <h1>Congratulations! All levels complete!</h1>
                        <button onClick={handleRestart}>Restart Game</button>
                    </div>
                );
            }

            return (
                <div>
                    <canvas ref={canvasRef} width="400" height="400" style={{ border: "1px solid black" }} />
                </div>
            );
        };

        const App = () => (
            <div>
                <h1>React Game</h1> 
                <GameCanvas />
            </div>
        );

        ReactDOM.createRoot(document.getElementById("root")).render(<App />);
