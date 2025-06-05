import {Button, Table, Form} from 'react-bootstrap';
import { useEffect, useState } from "react";
// import Form from 'react-bootstrap/Form';
import axios from 'axios';

export default function Invoice(){

    const [date, setInvoiceDate] = useState(null);
    const [due_date, setdueDate] = useState(null);
    const [invoice_number, setInvoiceNum] = useState(null);
    const [customer_name, setcustomer_name] = useState(null);
    const [status, setStatus] = useState(null);
    const [total, setTotal] = useState(null);
    const [contacts, setContacts] = useState([]);
    const [items, setItems] = useState([
    { itemDetails: '', quantity: 1.0, rate: 0.0 },
  ]);


    useEffect(()=>{
        axios.get('https://2e12fc174ad2.apps-tunnel.monday.app/zoho/customers')
        .then(res=>{setContacts(res.data.contacts)})
        .catch(err=>console.log(err));
    },[]);

    const handleChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = field === 'quantity' || field === 'rate'
        ? parseFloat(value) || 0
        : value;
        setItems(newItems);
    };

    const addNewRow = () => {
        setItems([...items, { itemDetails: '', quantity: 1.0, rate: 0.0 }]);
    };

    const deleteRow = (index)=>{
        console.log(index)
        if(index===0){
            return;
        }
        setItems((prevArray)=>prevArray.filter((item, key)=> key!==index));
    }

    const handleSubmit = async (e) => {   
        e.preventDefault();
        let localUrl = "http://127.0.0.1:3001";
        let liveUrl = "https://monday-zoho-bridge.onrender.com";
        axios.post(`${localUrl}/zoho/create/invoice`, {invoice_number,customer_name, date, due_date, status, total}).
        then((res)=>{
            console.log(res);
        }).catch(e=>
            console.log(e)
        );
    };

    return (
        <>
            <div className="container">
                <h2>Create new invoice</h2>
                <Form onSubmit={(e)=>handleSubmit(e)}>
                    <Form.Group>
                        <Form.Label htmlFor="customerName">Customer Name</Form.Label>
                        <Form.Select id='CustomerType' onChange={(e)=>setCustomer_Type(e.target.value)}>
                            {
                                contacts.map((item)=>(
                                    <option value={item.id}>{item.name}</option>
                                ))
                            }
                        </Form.Select>
                    </Form.Group>
                    <Form.Group >
                        <Form.Label htmlFor="invoiceNum">Invoice number</Form.Label>
                        <Form.Control type="text" id="invoiceNum" placeholder="Invoice Number" onChange={(e)=>setInvoiceNum(e.target.value)}/>
                    </Form.Group>
                    <Form.Group >
                        <Form.Label htmlFor="invoiceDate">Invoice Date</Form.Label>
                        <Form.Control type="date" id='invoiceDate' placeholder="Invoice Date" onChange={(e)=>setInvoiceDate(e.target.value)}/>
                    </Form.Group>
                    <Form.Group >
                        <Form.Label htmlFor="dueDate">Due Date</Form.Label>
                        <Form.Control type="date" id="dueDate" placeholder="Due Date" onChange={(e)=>setdueDate(e.target.value)}/>
                    </Form.Group>
                    <Form.Group>
                        <Table bordered hover responsive>
                            <thead className="table-light">
                            <tr>
                                <th>Item Details</th>
                                <th>Quantity</th>
                                <th>Rate</th>
                            </tr>
                            </thead>
                            <tbody>
                            {items.map((item, index) => (
                                <tr key={index}>
                                <td>
                                    <Form.Control
                                    type="text"
                                    value={item.itemDetails}
                                    onChange={(e) =>
                                        handleChange(index, 'itemDetails', e.target.value)
                                    }
                                    placeholder="Type or click to select an item"
                                    />
                                </td>
                                <td>
                                    <Form.Control
                                    type="number"
                                    step="0.01"
                                    value={item.quantity}
                                    onChange={(e) =>
                                        handleChange(index, 'quantity', e.target.value)
                                    }
                                    />
                                </td>
                                <td>
                                    <Form.Control
                                    type="number"
                                    step="0.01"
                                    value={item.rate}
                                    onChange={(e) =>
                                        handleChange(index, 'rate', e.target.value)
                                    }
                                    />
                                </td>
                                <td>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 red" onClick={()=>deleteRow(index)}>
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9.75 14.25 12m0 0 2.25 2.25M14.25 12l2.25-2.25M14.25 12 12 14.25m-2.58 4.92-6.374-6.375a1.125 1.125 0 0 1 0-1.59L9.42 4.83c.21-.211.497-.33.795-.33H19.5a2.25 2.25 0 0 1 2.25 2.25v10.5a2.25 2.25 0 0 1-2.25 2.25h-9.284c-.298 0-.585-.119-.795-.33Z" />
                                    </svg>                                    
                                </td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                        <Button variant="primary" onClick={addNewRow}>
                            + Add New Row
                        </Button>
                    </Form.Group>
                    <Form.Group >
                        <Form.Label htmlFor="amount">Tax</Form.Label>
                        <Form.Control type="number" id='amount' placeholder="Amount" onChange={(e)=>setTotal(e.target.value)}/>
                    </Form.Group>
                    <Form.Group >
                        <Form.Label htmlFor="status">Notes</Form.Label>
                        <Form.Control type="text" id="status" placeholder="Status" onChange={(e)=>setStatus(e.target.value)}/>
                    </Form.Group>
                    <Button variant="primary" type="submit" className="submit-btn">
                    Submit
                    </Button>
                </Form>
            </div>
        </>
    );
}