import LotteryTableHeader from "./LotteryTableHeader.tsx";
import LotteryTableBody from "./LotteryTableBody.tsx";

interface LotteryProperties {
    lotteryNumbers: number[][];
    columns?: number;
}

export default function LotteryTable({lotteryNumbers,columns=6}: LotteryProperties) {
    return (
        <table className={"table table-primary table-bordered table-hover table-responsive"} id={"lottery"}>
            <LotteryTableHeader columns={columns}/>
            <LotteryTableBody lotteryNumbers={lotteryNumbers}/>
        </table>
    );
}