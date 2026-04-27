import React from "react";

const SocketStatus = ({ isConnected }) => {
  const statusClass = isConnected ? "status-success" : "status-warning";

  return (
    <div className="flex items-center gap-2">
      <div className="inline-grid *:[grid-area:1/1]">
        <div className={`status ${statusClass} ${isConnected ? "animate-ping" : ""}`}></div>
        <div className={`status ${statusClass}`}></div>
      </div>
      <span className={isConnected ? "text-success" : "text-warning"}>
        {isConnected ? "Realtime: Connected" : "Realtime: Unavailable"}
      </span>
    </div>
  );
};

export default SocketStatus;
