import MovieBox from './components/MovieBox'
import './App.css'
import { useState } from 'react'

function App() {

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div className={`pointer-events-none w-full h-full fixed block top-0 left-0 bg-gray-950 opacity-0 z-50 transition delay-50 duration-250 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
        <p className="font-semibold text-white h-screen flex justify-center items-center">Copied to clipboard!</p>
      </div>
       <MovieBox isOpen={isOpen} setIsOpen={setIsOpen} />
      
    </div>
  )
}

export default App
