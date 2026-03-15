import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { initDb } from "./services/db";

const Root = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initDb()
      .then(() => {
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to initialize database:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">初始化数据库中...</p>
        </div>
      </div>
    );
  }

  return <App />;
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
