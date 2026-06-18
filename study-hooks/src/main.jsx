import {createRoot} from 'react-dom/client'
import App from './App.jsx'
import StudyUseTransition from "./StudyUseTransition.jsx";

createRoot(document.getElementById('root')).render(
    <>
        <App/>
        <StudyUseTransition/>
    </>
)
