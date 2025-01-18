import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { CategoryScale, Chart as ChartJS, Title, Tooltip, Legend, BarElement, ArcElement, LineElement, Filler, PointElement, LinearScale } from 'chart.js';
import { Log, KeywordCount, WebSocketData, OpenMPMetrics } from './types';
import { LogsTable } from './Logs';
import { CategoryDistributionChart } from './Cartegory';
import { ChecksumTrendsChart } from './CheckSome';
import { KeywordCountChart } from './KeywordCount';
import OpenMPMetricsChart from './OpenMPMetricsChart';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.css";

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

  const [openMPMetrics, setOpenMPMetrics] = useState<OpenMPMetrics[]>([]);

  const createSocket = () => {
    const socket = new WebSocket('wss://log-analytics.ns.namespaxe.com/logger');
    socket.onmessage = (event) => {
      const newData: WebSocketData = JSON.parse(event.data);

      const newMetrics = newData.content.all_tasks.map((task) => ({
        num_threads_used: task.tasks.openmp_metrics.num_threads_used,
        tasks_time: task.tasks.openmp_metrics.tasks_time,
      }));

      setOpenMPMetrics((prevMetrics) => [...prevMetrics, ...newMetrics]);

      const newLogs = newData.content.all_tasks.flatMap((task) => task.tasks.analyzed_logs);
      const newKeywordCounts = newData.content.all_tasks.flatMap((task) => task.tasks.keyword_count);
      const newCategories = newData.content.all_tasks.flatMap((task) => task.tasks.categories);
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
      setKeywordCounts((prevKeywordCounts) => {
        const keywordMap = new Map(prevKeywordCounts.map((k) => [k.keyword, k]));
        newKeywordCounts.forEach((newKeywordCount) => {
          if (keywordMap.has(newKeywordCount.keyword)) {
            keywordMap.get(newKeywordCount.keyword)!.count += newKeywordCount.count;
          } else {
            keywordMap.set(newKeywordCount.keyword, newKeywordCount);
          }
        });
        return Array.from(keywordMap.values());
      });

      setCategories((prevCategories) => {
        const updatedCategories = { ...prevCategories };
        newCategories.forEach((category) => {
          updatedCategories[category.category] = (updatedCategories[category.category] || 0) + 1;
        });
        return updatedCategories;
      });
    };

    return socket;
  };


  useEffect(() => {
    const ws = createSocket();
    return () => ws.close();
  }, []);

  return (
    <div className='w-100 d-flex align-items-center'>
      <div className="container mt-4">
        <h1 className="text-center mb-4">Real-Time Log Visualization</h1>

        <div className="row gap-1">
          <div className="mb-4 gap-4 d-flex w-100">
            <ChecksumTrendsChart logs={logs} />
            <OpenMPMetricsChart metrics={openMPMetrics} />
          </div>
          <div className="mb-4 gap-4 d-flex w-100">
            <CategoryDistributionChart categories={categories} />
            <KeywordCountChart keywordCounts={keywordCounts} />
          </div>
          <div className="col-12 mb-4 card p-2 w-100">
            <LogsTable logs={logs} />
          </div>
        </div>
      </div>
    </div>




  );

};

export default App;
