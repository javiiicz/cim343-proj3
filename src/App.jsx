import { useState, useEffect, useRef } from 'react'
import './App.css'
import P5Component from './components/P5Component'
import bg from "./assets/pattern.webp"
import Tutorial from './components/Tutorial';
import lobbyMusic from "./assets/lobby.mp3";
import { Music } from 'lucide-react';

function App() {
    const bpm = 110;
    const [index, setIndex] = useState(0);
    const [tutorial, setTutorial] = useState(false);
    const audioRef = useRef(null);

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

    const togglePlay = () => {
        if (audioRef.current.paused) {
          audioRef.current.play();
        } else {
          audioRef.current.pause();
        }
      };

    return (
        <div  style={{ backgroundImage: `url(${bg})` }} className="bg-repeat h-screen flex flex-col items-center">

            <audio ref={audioRef} src={lobbyMusic} autoPlay/>
            <div className='absolute left-0 p-2'>
                <Music color='#FFFFFF' onClick={togglePlay} strokeWidth={2} size={30}/>
            </div>
        
            {!tutorial && <Tutorial toggleTutorial={toggleTutorial} colors={colors} index={index} />}
                
            <div className='h-20'>
                <h1 className={`text-white text-center ${sizes[index % sizes.length]} font-bold p-4 transition-all`}>{emojis[(index * 23) % emojis.length]} Move It! {emojis[(index * 17) % emojis.length]}</h1>
            </div>
            
            {/* Navbar */}
            <div className='bg-gray-50/90 flex flex-row w-fit gap-8 m-5 py-3 px-4 rounded-2xl drop-shadow-xl'>
                <div onClick={toggleTutorial} className='cursor-pointer hover:font-semibold transition-all'>Show Tutorial</div>
                <div className='cursor-pointer'>Test Camera</div>
                <div className='cursor-pointer'>Start Game</div>
            </div>

            <div className='flex flex-col items-center'>
                {/* <P5Component/> */}
            </div>

            </div>
    )
}

export default App
