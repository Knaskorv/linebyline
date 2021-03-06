import { useRef, useEffect, useState } from 'react';

function CanvasElement({ handleCanvasClick, handleMouseUp, handleMove, setCtx, disabled }: any) {
    const canvasRef: any = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        setCtx(ctx);
    }, []);

    return (
        <canvas
            className={ !disabled ? 'enabled' : '' }
            width={ 900 }
            height={ 600 }
            ref={ canvasRef }
            onMouseDown={ handleCanvasClick }
            onMouseUp={ handleMouseUp }
            onMouseMove={ handleMove }
            onContextMenu={ (e) => e.preventDefault() }
        ></canvas>
    )
}

function Canvas({ socket, disabled }: any) {
    let startX = -1;
    let startY = -1;
    let draw = false;

    const [ctx, setCtx] = useState(null);
    const [lines, setLines] = useState([]);
    const [lineWidth, setLineWidth] = useState(3);

    useEffect(() => {
        drawLines();
    }, [ctx, lines])
    
    useEffect(() => {
        socket?.on('lines', setLines);
    }, [socket])
    
    const drawLine = (line: any) => {
        if (!ctx) return;
        const { x1, x2, y1, y2, w } = line;
        ctx.lineWidth = w;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    const drawLines = (dl:any = lines) => {
        if (!ctx) return;
        ctx.fillStyle = '#eeeeee'
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        
        dl.forEach(drawLine)
    }

    function handleCanvasClick(evt: any) {
        if (disabled) return;
        const { button, clientX, clientY } = evt;

        evt.preventDefault();

        if(button === 2) {
            startX = -1;
            startY = -1;
            draw = false;
            drawLines();
            return;
        }

        var rect = ctx.canvas.getBoundingClientRect();
        startX = clientX - rect.left
        startY = clientY - rect.top
        draw = true;
    }

    function onLineAdded(line: any) {
        setLines([...lines, line])
        socket.emit('draw-line', line)
    }
    
    function handleMouseUp(evt: any) {
        if (disabled) return;
        if (startX < 0) return;
        console.log('MOUSE UP')
        var rect = ctx.canvas.getBoundingClientRect();
        const x2 = evt.clientX - rect.left
        const y2 = evt.clientY - rect.top

        console.log('Line', { x1: startX, y1: startY, x2, y2, w: lineWidth })

        if (Math.abs(startX - x2) > 2 || Math.abs(startY - y2) > 2) {
            
            onLineAdded({ x1: startX, y1: startY, x2, y2, w: lineWidth })
            
            startX = -1;
            startY = -1;
        }

        draw = false;
        drawLines();
    }

    function handleMove(evt: any) {
        if (disabled) return;
        const { button, clientX, clientY } = evt;
        if (!draw || button) return;
        var rect = ctx.canvas.getBoundingClientRect();
        const x2 = clientX - rect.left
        const y2 = clientY - rect.top

        drawLines([ ...lines, { x1: startX, y1: startY, x2, y2, w: lineWidth }]);
    }
    return (
        <div>
            <CanvasElement
                disabled = { disabled }
                handleCanvasClick = { handleCanvasClick }
                handleMouseUp = { handleMouseUp }
                handleMove = { handleMove }
                setCtx={ setCtx }
            >
            </CanvasElement>
            { !disabled ? 
            <div className='draw-options'>
                {
                    [1, 2, 3, 4, 5].map(i => <span
                        className='pen-width'
                        style={{ fontWeight: lineWidth === i ? '900' : '300' }}
                        key={i}
                        onClick={ () => { setLineWidth(i) } }>{i}</span>)
                }
            </div> : ''
            }           
        </div>
    )
}

export default Canvas

