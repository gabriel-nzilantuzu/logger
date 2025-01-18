import React, { useState, useEffect } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useTable, Column, Row, Cell } from 'react-table';
import { CategoryScale, Chart as ChartJS, Title, Tooltip, Legend, BarElement, ArcElement, LineElement, Filler, PointElement, LinearScale } from 'chart.js';

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  PointElement
);

// Type definitions
interface Log {
  log_id: number;
  log: string;
  category: string;
  checksum: number;
  rank: number;
}

interface KeywordCount {
  keyword: string;
  count: number;
  rank: number;
}

interface Category {
  log_id: number;
  category: string;
  rank: number;
}

interface WebSocketData {
  content: {
    all_tasks: {
      rank: number;
      tasks: {
        analyzed_logs: Log[];
        categories: Category[];
        keyword_count: KeywordCount;
        checksums: {
          log_id: number;
          checksum: number;
          rank: number;
        }[];
      };
    }[];
  };
}

function VisualizationApp() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [keywordCounts] = useState<KeywordCount[]>([]);
  const [categories] = useState<Record<string, number>>({});

  // const [keywordCounts, setKeywordCounts] = useState<KeywordCount[]>([]);
  // const [categories, setCategories] = useState<Record<string, number>>({});

  let socket: WebSocket;

  const createSocket = () => {
    socket = new WebSocket('wss://log-analytics.ns.namespaxe.com/logger');

    socket.onmessage = (event) => {
      const newData: WebSocketData = JSON.parse(event.data);
      console.log("newData", JSON.stringify(newData));

      const newLogs = newData.content.all_tasks.flatMap((task) => task.tasks.analyzed_logs);
      const newKeywordCounts = newData.content.all_tasks.map((task) => task.tasks.keyword_count);
      const newCategories = newData.content.all_tasks.flatMap((task) => task.tasks.categories);

      console.log("newKeywordCounts", newKeywordCounts)
      console.log("newLogs", newLogs)
      console.log("newCategories", newCategories)

      setLogs((prev) => [...prev, ...newLogs]);
      // setKeywordCounts((prev) => {
      //   const updatedKeywordCounts = prev.slice();
      //   newKeywordCounts.forEach((k: KeywordCount) => {
      //     const existing = updatedKeywordCounts.find((kw) => kw.keyword === k.keyword);
      //     if (existing) {
      //       existing.count += k.count;
      //     } else {
      //       updatedKeywordCounts.push(k);
      //     }
      //   });
      //   return updatedKeywordCounts;
      // });

      // setCategories((prev) => {
      //   const updatedCategories = { ...prev };
      //   newCategories.forEach((cat: Category) => {
      //     updatedCategories[cat.category] = (updatedCategories[cat.category] || 0) + 1;
      //   });
      //   return updatedCategories;
      // });
    };


    socket.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    socket.onclose = (event) => {
      if (event.wasClean) {
        console.log(`Closed cleanly: code=${event.code}, reason=${event.reason}`);
      } else {
        console.error("WebSocket closed unexpectedly.");
      }
    };

    return socket;
  };

  useEffect(() => {
    const ws = createSocket();
    return () => {
      ws.close();
    };
  }, []);

  const columns: Column<Log>[] = [
    { Header: 'Log ID', accessor: 'log_id' },
    { Header: 'Log', accessor: 'log' },
    { Header: 'Category', accessor: 'category' },
    { Header: 'Checksum', accessor: 'checksum' },
  ];

  const data = React.useMemo(() => logs, [logs]);
  const tableInstance = useTable({ columns, data });

  return (
    <div className="container mt-4">
      <h1>Real-Time Log Visualization</h1>

      <h3>Logs Table</h3>
      <table {...tableInstance.getTableProps()} className="table table-striped">
        <thead>
          {tableInstance.headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...tableInstance.getTableBodyProps()}>
          {tableInstance.rows.map((row: Row<Log>) => {
            tableInstance.prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell: Cell<Log>) => (
                  <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      <h3>Category Distribution</h3>
      <Bar
        data={{
          labels: Object.keys(categories),
          datasets: [
            {
              label: 'Log Categories',
              data: Object.values(categories),
              backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0'],
            },
          ],
        }}
      />

      <h3>Keyword Count</h3>
      <Pie
        data={{
          labels: keywordCounts.map((k) => k.keyword),
          datasets: [
            {
              data: keywordCounts.map((k) => k.count),
              backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0'],
            },
          ],
        }}
      />

      <h3>Checksum Trends</h3>
      <Line
        data={{
          labels: logs.map((l) => `Log ${l.log_id}`),
          datasets: [
            {
              label: 'Checksums',
              data: logs.map((l) => l.checksum),
              borderColor: '#4bc0c0',
              fill: false,
            },
          ],
        }}
      />
    </div>
  );
}

export default VisualizationApp;
