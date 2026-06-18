import {use} from "react";

export default function UserProfile({userPromise}) {
    const user = use(userPromise);

    return (
        <>
            ID: {user.id}<br/>
            Full Name: {user.fullname}<br/>
            Age: {user.age}<br/>
        </>
    )

}