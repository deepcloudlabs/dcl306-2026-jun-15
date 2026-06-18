export default function getUserService(user_id) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                id: user_id,
                fullname: "jack bauer",
                age: 55
            })
        }, 5_000);
    })
}

export function saveLike(nextLiked) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() < 0.7)
                resolve(nextLiked);
            else
                reject("Rest call has failed!");
        }, 5_000);
    })
}