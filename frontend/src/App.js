import React from "react";
import "./App.css";
import Home from "./Pages/User/Home";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import AdminLogin from "./Pages/Admin/Login/AdminLogin";
import AdminHome from "./Pages/Admin/Home/Home";

function App() {
  return (
    < >
      <ToastContainer
      position="top-left"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover 
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<AdminLogin/>} />
          <Route path="/adminHome" element={<AdminHome/>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
