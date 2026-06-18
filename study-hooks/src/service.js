const USER_SERVICE_DELAY_MS = 3_000;
const SAVE_LIKE_DELAY_MS = 3_000;
const SAVE_LIKE_SUCCESS_RATE = 0.75;
const PRODUCT_COUNT = 150_000;

function delay(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export async function getUserService(userId) {
    await delay(USER_SERVICE_DELAY_MS);

    return {
        id: userId,
        fullname: "Jack Bauer",
        age: 55,
    };
}

export async function saveLike(nextLiked) {
    await delay(SAVE_LIKE_DELAY_MS);

    const isSuccessful = Math.random() < SAVE_LIKE_SUCCESS_RATE;

    if (!isSuccessful) {
        throw new Error("REST call failed.");
    }

    return nextLiked;
}

export const PRODUCTS = Array.from({length: PRODUCT_COUNT}, (_, index) => {
    const id = index + 1;

    return {
        id,
        name: `Product ${id}`,
    };
});