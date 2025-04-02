import p5 from 'p5';
import { useRef, useEffect } from 'react';

export default function P5Component () {
    const canvasRef = useRef(null);

    useEffect(() => {
        const sketch = (p) => {
          p.setup = () => {
            p.createCanvas(400, 400).parent(canvasRef.current);
          };
    
          p.draw = () => {
            p.background(220);
            p.ellipse(200, 200, 50, 50);
          };
        };
    
        const p5Instance = new p5(sketch);
    
        return () => {
          p5Instance.remove(); // Cleanup on unmount
        };
      }, []);

    return <div ref={canvasRef}></div>;
}