import { useState, useEffect } from 'react'
import './App.css'
import P5Component from './components/P5Component'
import myImage from "./assets/warioware.webp"
import bg from "./assets/pattern.webp"
import Tutorial from './components/Tutorial'

function App() {
    const bpm = 120;
    const [index, setIndex] = useState(0);
    const [tutorial, setTutorial] = useState(false);

    const sizes = ['text-4xl', 'text-3xl'];
    const colors = ["bg-red-500", "bg-green-500", "bg-blue-500", "bg-yellow-500", "bg-purple-500"];
    const emojis = ["🪩", "🕺", "💃", "🪭", "🚶", "🤸", "💎", "⭐", "⚡", "🚴‍♂️", "🌟"];

    useEffect(() => {
        const interval = setInterval(() => {
          setIndex(index => index + 1);
        }, (60 / bpm) * 1000);
    
        return () => clearInterval(interval);
      }, [bpm]);
    
    const toggleTutorial = () => {
        setTutorial(!tutorial);
    }

    return (
        <div  style={{ backgroundImage: `url(${bg})` }} className="bg-repeat h-screen flex flex-col items-center">
        
        {!tutorial && <Tutorial toggleTutorial={toggleTutorial} colors={colors} index={index} />}
            
            <div className='h-20'>
                <h1 className={`text-white text-center ${sizes[index % sizes.length]} font-bold p-4 transition-all`}>{emojis[(index * 23) % emojis.length]} Move It! {emojis[(index * 17) % emojis.length]}</h1>
            </div>
            
            {/* Navbar */}
            <div className='bg-gray-50 flex flex-row w-fit gap-2 m-5 py-3 px-4 rounded-2xl'>
                <div onClick={toggleTutorial}>Show Tutorial</div>
                <div>Test Camera</div>
                <div>Start Game</div>
            </div>

            <div className='flex flex-col items-center'>
                {/* <P5Component/> */}
            </div>

        </div>
    )
}

export default App
