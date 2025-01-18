import { useMemo } from "react";
import { Column, useTable, Row, Cell } from "react-table";
import { Log } from "./types";

export const LogsTable: React.FC<{ logs: Log[] }> = ({ logs }) => {
    const columns: Column<Log>[] = useMemo(() => [
        { Header: 'Log ID', accessor: 'log_id' },
        { Header: 'Log', accessor: 'log' },
        { Header: 'Category', accessor: 'category' },
        { Header: 'Checksum', accessor: 'checksum' },
        { Header: 'Rank', accessor: 'rank' }
    ], []);

    const data = useMemo(() => logs, [logs]);
    const tableInstance = useTable({ columns, data });

    return (
        <table {...tableInstance.getTableProps()} className="table table-striped">
            <thead>
                {tableInstance.headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.getHeaderGroupProps().key}>
                        {headerGroup.headers.map(column => (
                            <th {...column.getHeaderProps()} key={column.getHeaderProps().key}>{column.render('Header')}</th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody {...tableInstance.getTableBodyProps()}>
                {tableInstance.rows.map((row: Row<Log>) => {
                    tableInstance.prepareRow(row);
                    return (
                        <tr {...row.getRowProps()} key={row.getRowProps().key}>
                            {row.cells.map((cell: Cell<Log>) => (
                                <td {...cell.getCellProps()} key={cell.getCellProps().key}>{cell.render('Cell')}</td>
                            ))}
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};