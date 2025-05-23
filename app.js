import React from "https://esm.sh/react@18";
        import ReactDOM from "https://esm.sh/react-dom@18";

        const GameCanvas = () => {
            const canvasRef = React.useRef(null);
            const [blocks, setBlocks] = React.useState([]);
            const [level, setLevel] = React.useState(0);
            const levels = [
                [
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
            ];

            const loadLevel = () => {
                const newBlocks = [];
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
                                newBlocks.push({ x, y, type: "player" });
                                break;
                            case "m":
                                newBlocks.push({ x, y, type: "movable" });
                                break;
                            case "o":
                                newBlocks.push({ x, y, type: "portal" });
                                break;
                        }
                    }
                }
                setBlocks(newBlocks);
            };

            React.useEffect(() => {
                loadLevel();
            }, [level]);

            React.useEffect(() => {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext("2d");

                const draw = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    blocks.forEach((block) => {
                        switch (block.type) {
                            case "normal":
                                ctx.fillStyle = "black";
                                ctx.fillRect(block.x, block.y, 40, 40);
                                break;
                            case "player":
                                ctx.fillStyle = "red";
                                ctx.fillRect(block.x, block.y, 40, 40);
                                break;
                            case "movable":
                                ctx.fillStyle = "blue";
                                ctx.fillRect(block.x, block.y, 40, 40);
                                break;
                            case "portal":
                                ctx.fillStyle = "purple";
                                ctx.fillRect(block.x, block.y, 40, 40);
                                break;
                        }
                    });
                };

                draw();
            }, [blocks]);

            const handleKeyDown = (event) => {
                console.log(event.key); // Add key handling logic
            };

            React.useEffect(() => {
                window.addEventListener("keydown", handleKeyDown);
                return () => {
                    window.removeEventListener("keydown", handleKeyDown);
                };
            }, [blocks]);

            return <canvas ref={canvasRef} width="400" height="400" style={{ border: "1px solid black" }} />;
        };

        const App = () => (
            <div>
                <h1>React Game</h1>
                <GameCanvas />
            </div>
        );

        ReactDOM.createRoot(document.getElementById("root")).render(<App />);
