import { useState, useEffect } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import { ReactSVG } from "react-svg";
import * as XLSX from "xlsx";
import FileViewer from "react-file-viewer";

// Định nghĩa các loại tệp và kiểu MIME tương ứng
const FileType = {
    JPG: ".jpg",
    PNG: ".png",
    JPEG: ".jpeg",
    SVG: ".svg",
    PDF: ".pdf",
    EXCEL: ".xlsx",
    DOC: ".doc",
    DOCX: ".docx",
    BPMN: ".bpmn",
    HEIC: ".heic",
    MP4: ".mp4",
};

// Component để hiển thị PDF
const PdfViewer = ({ url }) => {
    const [numPages, setNumPages] = useState(null);

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
    }

    return (
        <div>
            <Document
                file={url}
                onLoadSuccess={onDocumentLoadSuccess}
                options={{ workerSrc: pdfjs.getWorkerSrc() }}
            >
                {Array.from(new Array(numPages), (el, index) => (
                    <Page key={`page_${index + 1}`} pageNumber={index + 1} />
                ))}
            </Document>
        </div>
    );
};

// Component để hiển thị SVG
const SvgViewer = ({ url }) => {
    return (
        <div>
            <ReactSVG src={url} />
        </div>
    );
};

// Component để hiển thị Excel
const ExcelViewer = ({ url }) => {
    const [data, setData] = useState([]);

    const handleFile = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const workbook = XLSX.read(e.target.result, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(sheet);
            setData(json);
        };
        reader.readAsBinaryString(file);
    };

    useEffect(() => {
        fetch(url)
            .then((response) => response.blob())
            .then(handleFile);
    }, [url]);

    return (
        <div>
            <table>
                <thead>
                    <tr>
                        {data[0] &&
                            Object.keys(data[0]).map((key) => (
                                <th key={key}>{key}</th>
                            ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index}>
                            {Object.values(row).map((value, idx) => (
                                <td key={idx}>{value}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Component chính
const App = () => {
    const [fileType, setFileType] = useState("");
    const [fileUrl, setFileUrl] = useState("");
    const [loadingText, setLoadingText] = useState("Processing file...");

    useEffect(() => {
        const url =
            "https://static-uat.affina.com.vn/affina/0GWV62GJBYH2D.svg.enc"; // Thay đổi URL theo yêu cầu
        const fileExtension = url.split(".").pop().split("?")[0]; // Lấy phần mở rộng của tệp

        if (url.endsWith(".enc")) {
            // Xử lý tệp mã hóa
            // TODO: Thêm logic để giải mã tệp và cập nhật fileUrl và fileType
            setLoadingText("Decrypting file...");
            // Ví dụ: setFileUrl(decryptedUrl);
        } else {
            // Cập nhật fileType và fileUrl theo phần mở rộng
            switch (`.${fileExtension}`) {
                case FileType.JPG:
                case FileType.PNG:
                case FileType.JPEG:
                    setFileType("image");
                    break;
                case FileType.SVG:
                    setFileType("svg");
                    break;
                case FileType.PDF:
                    setFileType("pdf");
                    break;
                case FileType.EXCEL:
                    setFileType("xlsx");
                    break;
                case FileType.DOC:
                case FileType.DOCX:
                    setFileType("doc");
                    break;
                case FileType.BPMN:
                    setFileType("bpmn");
                    break;
                case FileType.HEIC:
                    setFileType("heic");
                    break;
                case FileType.MP4:
                    setFileType("mp4");
                    break;
                default:
                    setFileType("");
            }
            setFileUrl(url);
        }
    }, []);

    const renderContent = () => {
        switch (fileType) {
            case "pdf":
                return <PdfViewer url={fileUrl} />;
            case "svg":
                return <SvgViewer url={fileUrl} />;
            case "xlsx":
                return <ExcelViewer url={fileUrl} />;
            case "image":
                return <img src={fileUrl} alt="Image" />;
            case "doc":
            case "bpmn":
            case "heic":
            case "mp4":
                return <FileViewer fileType={fileType} filePath={fileUrl} />;
            default:
                return <p>Unsupported file type or file not found.</p>;
        }
    };

    return (
        <div>
            <h1>File Viewer Example</h1>
            {fileUrl ? renderContent() : <p>{loadingText}</p>}
        </div>
    );
};

export default App;
