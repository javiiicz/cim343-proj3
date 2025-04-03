import { useState, useEffect, useRef } from 'react'
import './App.css'
import P5Component from './components/P5Component'
import bg from "./assets/pattern.webp"
import Tutorial from './components/Tutorial';
import lobbyMusic from "./assets/lobby.mp3";
import { Music } from 'lucide-react';
import NavTab from './components/NavTab';
import TestCamera from './components/TestCamera';

function App() {
    const bpm = 110;
    const [index, setIndex] = useState(0);
    const [tutorial, setTutorial] = useState(false);
    const [test, setTest] = useState(true);
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

    const toggleTest = () => {
        setTest(!test);
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
            {!test && <TestCamera toggle={toggleTest}/>}
                
            <div className='h-20'>
                <h1 className={`text-white text-center ${sizes[index % sizes.length]} font-bold p-4 transition-all`}>{emojis[(index * 23) % emojis.length]} Tune It! {emojis[(index * 17) % emojis.length]}</h1>
            </div>
            
            {/* Navbar */}
            <div className='bg-gray-50/70 flex flex-row w-fit gap-8 m-5 py-3 px-4 rounded-2xl drop-shadow-xl backdrop-blur-md'>
                <NavTab name="Show Tutorial" func={toggleTutorial}/>
                <NavTab name="Test Camera" func={toggleTest}/>
                <NavTab name="Start Game"/>
                <NavTab name="Scoreboard"/>
            </div>

            <div className='flex flex-col items-center'>
                {/* <P5Component/> */}
            </div>

            </div>
    )
}

export default App
