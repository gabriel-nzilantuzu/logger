import { Pie } from "react-chartjs-2";
import { KeywordCount } from "./types";

export const KeywordCountChart: React.FC<{ keywordCounts: KeywordCount[] }> = ({ keywordCounts }) => {
    return (
        <Pie
            data={{
                labels: keywordCounts.map(k => k.keyword),
                datasets: [{
                    data: keywordCounts.map(k => k.count),
                    backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0'],
                }],
            }}
        />
    );
};