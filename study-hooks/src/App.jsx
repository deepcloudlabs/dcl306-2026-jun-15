import {Suspense} from "react";
import getUserService from "./service.js";
import UserProfile from "./UserProfile.jsx";
import LikeButton from "./LikeButton.jsx";

const userPromise = getUserService("123456789");

function App() {
    return (
        <>
            <Suspense fallback={<p>Loading...</p>}>
                <UserProfile userPromise={userPromise}/>
            </Suspense>
            <ul>
                <li>Test 1</li>
                <li>Test 2</li>
                <li>Test 3</li>
            </ul>
            <LikeButton></LikeButton>
        </>
    )
}

export default App
