import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Customer from "./Customer";
import Invoice from "./Invoice";
import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import InvoiceForm from "./InvoiceForm";

function App(){
  return (
    <>
    <Router>
      <Routes>
        <Route path="/customer" element={<Customer/>}/>
        <Route path="/invoice" element={<Invoice/>}/>
        <Route path="/invoice-form" element={<InvoiceForm/>}/>
      </Routes>
    </Router>
    </>
  );
}

export default App;
