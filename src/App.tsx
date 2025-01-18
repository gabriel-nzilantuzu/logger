import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { CategoryScale, Chart as ChartJS, Title, Tooltip, Legend, BarElement, ArcElement, LineElement, Filler, PointElement, LinearScale } from 'chart.js';
import { Log, KeywordCount, WebSocketData } from './types';
import { LogsTable } from './Logs';
import { CategoryDistributionChart } from './Cartegory';
import { ChecksumTrendsChart } from './CheckSome';
import { KeywordCountChart } from './KeywordCount';

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

const App: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [keywordCounts, setKeywordCounts] = useState<KeywordCount[]>([]);
  const [categories, setCategories] = useState<Record<string, number>>({});

  const createSocket = () => {
    const socket = new WebSocket('ws://log-analytics.ns.namespaxe.com/logger');
    socket.onmessage = (event) => {
      const newData: WebSocketData = JSON.parse(event.data);
      console.log("newData", newData)
      const newLogs = newData.content.all_tasks.flatMap(task => task.tasks.analyzed_logs);
      const newKeywordCounts = newData.content.all_tasks.flatMap(task => task.tasks.keyword_count);
      const newCategories = newData.content.all_tasks.flatMap(task => task.tasks.categories);
      const newChecksums = newData.content.all_tasks.flatMap(task => task.tasks.checksums);

      const getCategoryAndChecksum = (logId: number, rank: number) => {
        const category = newCategories.find(cat => cat.log_id === logId && cat.rank === rank);
        const checksum = newChecksums.find(check => check.log_id === logId && check.rank === rank);
        return {
          category: category ? category.category : null,
          checksum: checksum ? checksum.checksum : null,
        };
      };

      const enhancedLogs = newLogs.map(log => {
        const { category, checksum } = getCategoryAndChecksum(log.log_id, log.rank);
        return {
          ...log,
          category,
          checksum,
        };
      });

      setLogs(prevLogs => [...prevLogs, ...enhancedLogs]);
      setKeywordCounts(prevKeywordCounts => {
        const keywordMap = new Map(prevKeywordCounts.map(k => [k.keyword, k]));
        newKeywordCounts.forEach(newKeywordCount => {
          if (keywordMap.has(newKeywordCount.keyword)) {
            keywordMap.get(newKeywordCount.keyword)!.count += newKeywordCount.count;
          } else {
            keywordMap.set(newKeywordCount.keyword, newKeywordCount);
          }
        });
        return Array.from(keywordMap.values());
      });

      setCategories(prevCategories => {
        const updatedCategories = { ...prevCategories };
        newCategories.forEach(category => {
          updatedCategories[category.category] = (updatedCategories[category.category] || 0) + 1;
        });
        return updatedCategories;
      });
    };


    socket.onerror = error => console.error("WebSocket Error:", error);
    socket.onclose = event => {
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
    return () => ws.close();
  }, []);

  return (
    <div className="container mt-4">
      <h1>Real-Time Log Visualization</h1>
      <h3>Logs Table</h3>
      <LogsTable logs={logs} />

      <h3>Category Distribution</h3>
      <CategoryDistributionChart categories={categories} />

      <h3>Keyword Count</h3>
      <KeywordCountChart keywordCounts={keywordCounts} />

      <h3>Checksum Trends</h3>
      <ChecksumTrendsChart logs={logs} />
    </div>
  );
};

export default App;
