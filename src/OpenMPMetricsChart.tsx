import React from 'react';
import {
    Chart as ChartJS,
    BarElement,
    LineElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { OpenMPMetricsChartProps } from './types';

ChartJS.register(BarElement, LineElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const OpenMPMetricsChart: React.FC<OpenMPMetricsChartProps> = ({ metrics }) => {
    const labels = metrics.map((_, index) => `Task ${index + 1}`);
    const analyzeLogsTime = metrics.map((m) => m.tasks_time.analyze_logs_time);
    const categorizeLogsTime = metrics.map((m) => m.tasks_time.categorize_logs_time);
    const keywordCountTime = metrics.map((m) => m.tasks_time.keyword_count_time);
    const checksumTime = metrics.map((m) => m.tasks_time.checksum_time);
    const numThreadsUsed = metrics.map((m) => m.num_threads_used);

    const data = {
        labels,
        datasets: [
            {
                label: 'Analyze Logs Time',
                data: analyzeLogsTime,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                type: 'bar' as const,
            },
            {
                label: 'Categorize Logs Time',
                data: categorizeLogsTime,
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                type: 'bar' as const,
            },
            {
                label: 'Keyword Count Time',
                data: keywordCountTime,
                backgroundColor: 'rgba(255, 159, 64, 0.6)',
                type: 'bar' as const,
            },
            {
                label: 'Checksum Time',
                data: checksumTime,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                type: 'bar' as const,
            },
            {
                label: 'Threads Used',
                data: numThreadsUsed,
                type: 'line' as const,
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.3)',
                borderWidth: 2,
                fill: true,
                yAxisID: 'threads',
            },
        ],
    };

    const options = {
        responsive: true,
        scales: {
            y: {
                type: 'linear' as const,
                beginAtZero: true,
                title: { display: true, text: 'Task Time (seconds)' },
            },
            threads: {
                type: 'linear' as const,
                position: 'right' as const,
                title: { display: true, text: 'Threads Used' },
                grid: { drawOnChartArea: false },
            },
        },
    };

    return (
        <div className='card w-50'>
            <h3 className="text-start">OpenMP Metrics</h3>
            <Chart type="bar" data={data} options={options} />
        </div>
    );
};

export default OpenMPMetricsChart;
