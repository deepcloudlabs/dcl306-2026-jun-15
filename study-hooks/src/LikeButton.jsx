import {startTransition, useOptimistic, useState} from "react";
import {saveLike} from "./service.js";

export default function LikeButton() {
    const [liked, setLiked] = useState(false);

    const [optimisticLiked, setOptimisticLiked] = useOptimistic(liked);

    function handleClick() {
        const nextLiked = !optimisticLiked;

        // non-urgent updates go to startTransition
        startTransition(async () => {
            setOptimisticLiked(nextLiked);
            console.log("sending the request to the backend!");
            const savedLiked = await saveLike(nextLiked);

            setLiked(savedLiked);
        });
    }
    return (
        <button onClick={handleClick}>
            {optimisticLiked ? "❤️ Liked" : "🤍 Like"}
        </button>
    );
}