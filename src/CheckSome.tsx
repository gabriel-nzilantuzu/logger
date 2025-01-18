import { Line } from "react-chartjs-2";
import { Log } from "./types";

export const ChecksumTrendsChart: React.FC<{ logs: Log[] }> = ({ logs }) => {
    return (
        <div className="card w-50">
            <h3 className="text-start">Checksum Trends</h3>
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
        </div>

    );
};