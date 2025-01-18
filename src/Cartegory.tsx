import { Bar } from "react-chartjs-2";

export const CategoryDistributionChart: React.FC<{ categories: Record<string, number> }> = ({ categories }) => {
    return (
        <div className="card w-50">
            <h3 className="text-start">Category Distribution</h3>
            <Bar
                data={{
                    labels: Object.keys(categories),
                    datasets: [{
                        label: 'Log Categories',
                        data: Object.values(categories),
                        backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0'],
                    }],
                }}
            />
        </div>

    );
};