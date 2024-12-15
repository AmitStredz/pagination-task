import { useState, useEffect } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import { ThreeDots } from "react-loader-spinner";
import { Button } from "primereact/button";

interface Data {
  id: string | number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: string;
  date_end: string;
}

export default function TablePage() {
  const [data, setData] = useState<Data[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [selectedRows, setSelectedRows] = useState<Record<string, Data>>(() => {
    const savedSelections = localStorage.getItem("selectedRows");
    return savedSelections ? JSON.parse(savedSelections) : {};
  });

  const [currentPage, setCurrentPage] = useState<number>(
    parseInt(localStorage.getItem("currentPage") || "1", 10)
  );
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [autoSelectCount, setAutoSelectCount] = useState<number>(0);
  const [remainingAutoSelect, setRemainingAutoSelect] = useState<number>(0);
  const [popupVisible, setPopupVisible] = useState(false);

  const rowsPerPage = 12;

  const fetchData = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `https://api.artic.edu/api/v1/artworks?page=${page}&limit=${rowsPerPage}`
      );

      if (response) {
        const fetchedData = response?.data?.data;
        setData(fetchedData);
        setTotalRecords(response?.data?.pagination?.total || 0);

        let newSelections = { ...selectedRows };

        if (remainingAutoSelect > 0) {
          const selectCount = Math.min(remainingAutoSelect, fetchedData.length);

          fetchedData.slice(0, selectCount).forEach((row: any) => {
            if (!newSelections[row.id]) {
              newSelections[row.id] = row;
            }
          });

          setRemainingAutoSelect(
            Math.max(0, remainingAutoSelect - selectCount)
          );

          setSelectedRows(newSelections);

          localStorage.setItem("selectedRows", JSON.stringify(newSelections));
        }
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (event: any) => {
    const nextPage = event.page + 1;
    setCurrentPage(nextPage);
    fetchData(nextPage);
  };

  useEffect(() => {
    fetchData(currentPage);
    localStorage.setItem("currentPage", currentPage.toString());
  }, [currentPage]);

  const handleSelectionChange = (e: any) => {
    const newSelectedRows = { ...selectedRows };

    const currentPageSelectedIds = new Set(e.value.map((row: Data) => row.id));

    data.forEach((row) => {
      if (currentPageSelectedIds.has(row.id)) {
        newSelectedRows[row.id] = row;
      } else {
        delete newSelectedRows[row.id];
      }
    });

    setSelectedRows(newSelectedRows);

    localStorage.setItem("selectedRows", JSON.stringify(newSelectedRows));
  };

  const getSelectedRowsForCurrentPage = () =>
    data.filter((row) => selectedRows[row.id]);

  const handleAutoSelect = () => {
    setRemainingAutoSelect(autoSelectCount || 0);

    setPopupVisible(false);
    setAutoSelectCount(0);
    fetchData(currentPage);
  };

  return (
    <div className="card flex flex-col p-5 px-10 text-[14px]">
      <span className="text-5xl mb-5 font-bold font-mono">Pagination</span>
      <div className="relative">
        <DataTable
          value={data}
          selectionMode="multiple"
          selection={getSelectedRowsForCurrentPage()}
          onSelectionChange={handleSelectionChange}
          dataKey="id"
          rows={rowsPerPage}
          totalRecords={totalRecords}
          currentPageReportTemplate="{first} to {last} of {totalRecords}"
          emptyMessage="No data found"
          className="border-2 border-separate"
        >
          <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
          <Column field="title" header="Title" />
          <Column field="place_of_origin" header="Place of Origin" />
          <Column field="artist_display" header="Artist Display" />
          <Column field="inscriptions" header="Inscriptions" />
          <Column field="date_start" header="Date Start" />
          <Column field="date_end" header="Date End" />
        </DataTable>

        {/* Dropdown for row selection */}
        <div className="absolute top-8 left-10">
          <div className="relative card flex justify-content-center">
            <Button onClick={() => setPopupVisible(!popupVisible)}>
              <i className="pi pi-angle-down text-xl"></i>
            </Button>
            <div
              className={`absolute top-10 left-0 bg-white rounded-md p-3 border-2 ${
                popupVisible ? "flex flex-col items-center gap-3" : "hidden"
              }`}
            >
              <input
                type="number"
                value={autoSelectCount || 0}
                onChange={(e) => setAutoSelectCount(Number(e.target.value))}
                placeholder="No. of rows to auto-select"
                className="outline-none border p-2"
              />
              <Button
                className="border p-2 hover:bg-slate-200"
                onClick={handleAutoSelect}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="w-full flex justify-center">
          <ThreeDots
            visible={true}
            height="80"
            width="80"
            color="#4fa94d"
            radius="9"
            ariaLabel="three-dots-loading"
          />
        </div>
      )}

      <Paginator
        first={(currentPage - 1) * rowsPerPage}
        rows={rowsPerPage}
        totalRecords={totalRecords}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
