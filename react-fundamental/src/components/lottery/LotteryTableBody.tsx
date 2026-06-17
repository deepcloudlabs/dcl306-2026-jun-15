interface LotteryTableBodyProps {
    lotteryNumbers: number[][];
}
export default function LotteryTableBody({lotteryNumbers} : LotteryTableBodyProps) {
    return (
        <tbody>
        {
            lotteryNumbers.map((numbers, i) => (
                <tr key={i}>
                    {numbers.map((number) => (
                        <td key={number}>{number}</td>
                    ))}
                </tr>
            ))
        }
        </tbody>
    );
}