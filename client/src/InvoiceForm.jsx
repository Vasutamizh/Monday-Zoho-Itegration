import React, { useEffect, useState } from 'react';
import { validateDate, validateInvoiceId, validateTax, validateNotes } from './validation';
import axios from 'axios';
import {
  TextField,
  Dropdown,
  Button,
  Text,
  Toast,
  Loader
} from '@vibe/core';
import '@vibe/core/tokens'; // Vibe styles

const InvoiceForm = () => {
  const [customerType, setCustomerType] = useState('');
  const [invoiceNum, setInvoiceNum] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [tax, setTax] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([{quantity: '1', rate: '0.00' }]);
  const [contacts, setContacts] = useState([]); 
  const [zohoitems, setZohoItems] = useState([]);
  const [errors, setErrors] = useState('');
  const [message, setMessage] = useState("Invoice Created")
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  

  let zohoCreateInvoiceRequestJson = {
    customer_id:"",
    invoice_number:"",
    date:"",
    due_date:"",
    notes:"",
    line_items:[]
  }

  useEffect(()=>{
          axios.get('https://2e12fc174ad2.apps-tunnel.monday.app/zoho/customers')
          .then(res=>{setContacts(res.data.contacts); console.log(res.data.contacts)})
          .catch(err=>console.log(err));

          axios.get('https://2e12fc174ad2.apps-tunnel.monday.app/zoho/items')
          .then(response=>{
            let data = response.data.recieved.items;
            let ItemsArray = [];
            data.forEach((item)=>{
                ItemsArray.push({id: item.item_id, name: item.item_name, rate: item.rate})
            })
            setZohoItems(ItemsArray);
            console.log(ItemsArray)
          })
          .catch(err=> console.log(err));
    },[]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    let total = 0;
    // setCustomerType((prev)=> parseInt(prev))
    zohoCreateInvoiceRequestJson.customer_id = customerType;
    zohoCreateInvoiceRequestJson.line_items = items;
    zohoCreateInvoiceRequestJson.date = invoiceDate;
    zohoCreateInvoiceRequestJson.due_date = dueDate;
    zohoCreateInvoiceRequestJson.notes = notes
    zohoCreateInvoiceRequestJson.invoice_number = invoiceNum
    console.log(zohoCreateInvoiceRequestJson)

    setLoading(true)
    
    await axios.post('https://2e12fc174ad2.apps-tunnel.monday.app/zoho/create/invoice',zohoCreateInvoiceRequestJson)
    .then(res => {
        console.log(res.body)
        setMessage("Invoice Created");
        setLoading(false)
        setShow(true) 
    })
    .catch(err => {
        console.log(err)
        setMessage("Error while creating invoice...");
        setLoading(false)
        setShow(true) 
    })

    setLoading(false)

  };

  const handleChange = (index, field, value) => {
    console.log(value)
    const newItems = [...items];
    let values = value.value.split('$-$');
    newItems[index][field] = values[0];
    newItems[index].rate = values[1];
    setItems(newItems);
  };

  const addNewRow = () => {
    setItems([...items, {quantity: '1', rate: '0.00' }]);
  };

  const deleteRow = (index) => {
    if(items.length === 0){
        return;
    }
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };


  return (
    <>
     { loading && (
        <div className="overlay">
          <Loader size="medium" color="primary" />
        </div>
    )}
    <div className="container">
      {show && (
      <Toast
        open
        type="positive"
        autoHideDuration={3000}
        className="monday-storybook-toast_wrapper"
        onClose={()=>setShow(false)}
      > 
      { message }
      </Toast>
      )}
        <form onSubmit={handleSubmit} style={{ padding: 20, maxWidth: 800 }}>
        <h1>Add new invoice here</h1>
        <div>
            <label>Customer Name</label>
            <Dropdown
            placeholder="Select Customer"
            options={contacts.map(item => ({ label: item.name, value: item.id}))}
            onChange={(option) => setCustomerType(option.value)}
            />
        </div>

        <TextField
            title={"Invoice Number"}
            placeholder="Enter invoice number"
            value={invoiceNum}
            required={true}
            onChange={(value) => setInvoiceNum(value)}
        />
        {errors.invoice && <Text type="text2" ellipsis={false} className='errorMsg'>
            {errors.invoice}
        </Text>}

        <TextField
            title="Invoice Date"
            type="date"
            value={invoiceDate}
            required={true}
            onChange={(value) => setInvoiceDate(value)}
            className='dateField'
        />
        {errors.date && <Text type="text2" ellipsis={false} className='errorMsg'>
            {errors.date}
        </Text>}

        <TextField
            title="Due Date"
            type="date"
            value={dueDate}
            required={true}
            onChange={(value) => setDueDate(value)}
        />
        {errors.date && <Text type="text2" ellipsis={false} className='errorMsg'>
            {errors.date}
        </Text>}

        <div style={{ marginTop: 10 }}>
            <h4>Item List</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10 }}>
            <thead>
                <tr style={{ borderBottom: '1px solid #ccc' }}>
                <th width={250}>Item Details</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Action</th>
                </tr>
            </thead>
            <tbody>
                {items.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                    <td>
                    {/* <TextField
                        required={true}
                        placeholder="Item"
                        value={item.itemDetails}
                        onChange={(e) => handleChange(index, 'itemDetails', e.target.value)}
                    /> */}
                    <Dropdown
                        placeholder="Select Items"
                        // value={item.name}
                        options={zohoitems.map(item => ({ label: item.name, value: `${item.id}$-$${item.rate}` }))}
                        onChange={(value) => handleChange(index, 'item_id', value)}
                        />
                    </td>
                    <td>
                    <TextField
                        required={true}
                        type="number"
                        step="1"
                        value={item.quantity}
                        onChange={(e) => handleChange(index, 'quantity', e.target.value)}
                    />
                    </td>
                    <td>
                    <TextField
                        required={true}
                        type="number"
                        step="1"
                        value={item.rate}
                        onChange={(e) => handleChange(index, 'rate', e.target.value)}
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
            </table>
            <Button kind='primary' type='button' onClick={addNewRow} rightIcon={true}>
                Add new row
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 red blue">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
            </Button>
        </div>

        <TextField
            required={true}
            title="Tax"
            type="number"
            placeholder="Enter tax amount"
            value={tax}
            onChange={(value) => setTax(value)}
        />
        {errors.tax && <Text type="text2" ellipsis={false} className='errorMsg'>
            {errors.tax}
        </Text>}

        <TextField
            required={true}
            title="Notes"
            placeholder="Enter any notes"
            value={notes}
            onChange={(value) => setNotes(value)}
        />
        {errors.tax && <Text type="text2" className='errorMsg'>
            {errors.tax}
        </Text>}

        <Button kind="primary" type="submit" style={{ marginTop: 20 }}>
            Submit
        </Button>
        </form>
    </div>
    </>
  );
};

export default InvoiceForm;
