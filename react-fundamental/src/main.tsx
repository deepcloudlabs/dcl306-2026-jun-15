import { createRoot } from 'react-dom/client'
import "bootstrap/dist/css/bootstrap.css";
import FunctionalApp from "./FunctionalApp.tsx";

createRoot(document.getElementById('root')!).render(
    <>
    <FunctionalApp />
    </>
,
)
