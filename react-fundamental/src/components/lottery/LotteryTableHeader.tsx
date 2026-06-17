// stateless component
// state -> parent component: properties
// properties? --> contract --> ts? interface
interface LotteryTableHeaderProps {
    columns: number;
}

export default function LotteryTableHeader({columns}: LotteryTableHeaderProps) {
    return (
        <thead>
        <tr>
            {
                Array.from({length: columns}).map((_, i) =>
                    <th key={i}>Column {i + 1}</th>)
            }
        </tr>
        </thead>
    );
}