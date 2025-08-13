import React from "react";
import {accountImageFinder} from "./Utils";

export default function PostsTable({ data }) {
    return (
        <div style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid #ddd" }}>
                <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead style={{ position: "sticky", top: 0, background: "#f9f9f9", zIndex: 1 }}>
                    <tr>
                        <th style={cellStyle}>Id</th>
                        <th style={cellStyle}>Source</th>
                        <th style={cellStyle}>Title</th>
                        <th style={cellStyle}>Created Date</th>
                    </tr>
                </thead>
                <tbody>
                {data.map((row) => (
                    <tr key={row.id}>
                        <td style={cellStyle}>{row.id}</td>
                        <td style={cellStyle}><img alt={row.socialAccount.platform} src={accountImageFinder(row.socialAccount.platform)} style={{width: 16, height: 16}}/>&nbsp;{row.socialAccount.username}</td>
                        <td style={cellStyle}>{row.title}</td>
                        <td style={cellStyle}>
                            {new Date(row.createdDate).toLocaleString()}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

const cellStyle = {
    border: "1px solid #ccc",
    padding: "8px",
    textAlign: "left",
};
