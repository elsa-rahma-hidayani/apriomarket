import React, { createContext, useState } from "react";

export const FileContext = createContext();

export const FileProvider = ({ children }) => {
  const [fileData, setFileData] = useState([]);

  return (
    <FileContext.Provider value={{ fileData, setFileData }}>
      {children}
    </FileContext.Provider>
  );
};
