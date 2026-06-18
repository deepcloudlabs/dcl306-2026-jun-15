import { useMemo, useState, useTransition } from "react";
import { PRODUCTS } from "./service.js";

export default function StudyUseTransition() {
    const [inputValue, setInputValue] = useState("123");
    const [searchText, setSearchText] = useState("123");

    const [isPending, startTransition] = useTransition();

    const filteredProducts = useMemo(() => {
        const normalizedSearchText = searchText.trim().toLowerCase();

        if (!normalizedSearchText) {
            return PRODUCTS;
        }

        return PRODUCTS.filter((product) =>
            product.name.toLowerCase().includes(normalizedSearchText)
        );
    }, [searchText]);

    function handleChange(event) {
        const nextValue = event.target.value;

        setInputValue(nextValue);

        startTransition(() => {
            setSearchText(nextValue);
        });
    }

    return (
        <div>
            <h2>Product Search</h2>

            <input
                value={inputValue}
                onChange={handleChange}
                placeholder="Search products..."
                aria-label="Search products"
            />

            {isPending && <p>Updating list...</p>}

            <ul aria-busy={isPending}>
                {filteredProducts.map((product) => (
                    <li key={product.id}>{product.name}</li>
                ))}
            </ul>
        </div>
    );
}