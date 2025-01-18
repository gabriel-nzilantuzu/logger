import { Line } from "react-chartjs-2";
import { Log } from "./types";

export const ChecksumTrendsChart: React.FC<{ logs: Log[] }> = ({ logs }) => {
    return (
        <Line
            data={{
                labels: logs.map((l) => `Log ${l.log_id}`),
                datasets: [{
                    label: 'Checksums',
                    data: logs.map((l) => l.checksum),
                    borderColor: '#4bc0c0',
                    fill: false,
                }],
            }}
        />
    );
};