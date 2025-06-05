import React, { useEffect } from 'react';
import mondaySdk from "monday-sdk-js";
import "@vibe/core/tokens"
import { TextField,   Toast, Loader } from "@vibe/core";
import { Button } from "@vibe/core";
import { Dropdown } from "@vibe/core";
import { useState } from "react";
import axios from "axios";

const monday = mondaySdk();
monday.setToken(null); // Important: for marketplace apps


function Customer() {
  const [contact_name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company_name, setCompany_Name] = useState('');
  const [customer_type, setCustomer_Type] = useState('');
  const [errors, setErrors] = useState('');
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("Contact Created")
  const [loading, setLoading] = useState(false);
  
  let zohoCustomerRequestJson = {
    contact_name:"",
    company_name:"",
    contact_type:"",
    contact_persons:[{first_name:"", email:"", phone:"",}]
  }

  useEffect(()=>{
    monday.get("context")
    .then(res => {
      console.log("Monday User context:", res.data);
    }).catch(err =>{
      console.log("error while getting user data", err);
    });
  },[])

  const handleSubmit = (e) => {
    // submit the details to only the zoho books, and the web trigger triger the web hook and monday.com also get the data
    e.preventDefault();
    
    zohoCustomerRequestJson.contact_name = contact_name;
    zohoCustomerRequestJson.company_name = company_name;
    zohoCustomerRequestJson.customer_type = customer_type;
    zohoCustomerRequestJson.contact_persons[0].first_name = contact_name;
    zohoCustomerRequestJson.contact_persons[0].email = email,
    zohoCustomerRequestJson.contact_persons[0].phone = phone;
  
    // console.log(zohoCustomerRequestJson);

    let localUrl = "http://127.0.0.1:3001";
    let liveUrl = "https://monday-zoho-bridge.onrender.com";
    let tunnelUrl = "https://2e12fc174ad2.apps-tunnel.monday.app";
    setLoading(true)
    axios.post(`${tunnelUrl}/zoho/create/customer`, zohoCustomerRequestJson).
    then((res)=>{
      console.log(res);

      setCompany_Name(null)
      setCustomer_Type(null)
      setEmail(null)
      setPhone(null)
      setName(null)

      setLoading(false)
      setMessage("Contact Created");
      setShow(true) 

    }).catch(e=>{
      console.log(e)
      setLoading(false)
      setMessage("Error while creating Contact");
      setShow(true) 
    }
    );
    setLoading(false)
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
      <h2>Create Customer</h2>
      <form onSubmit={(e)=>handleSubmit(e)}>
        <TextField
          title="Customer Name"
          type="text"
          onChange={(value)=>setName(value)}
          className='dateField'
          required={true}
        />
        {errors.name && <Text type="text2" ellipsis={false} className='errorMsg'>
          {errors.name}
        </Text>}

        <TextField
          title="Email"
          type="email"
          onChange={(value)=>setEmail(value)}
          className='dateField'
          required={true}
        />
        {errors.email && <Text type="text2" ellipsis={false} className='errorMsg'>
        {errors.email}
      </Text>}

        <TextField
          title="Phone"
          type="number"
          onChange={(value)=>setPhone(value)}
          className='dateField'
          required={true} 
        />
        {errors.phone && <Text type="text2" ellipsis={false} className='errorMsg'>
          {errors.phone}
        </Text>}

        <TextField
          title="Company Name"
          type="text"
          onChange={(value)=>setCompany_Name(value)}
          className='dateField'
          required={true}
        />
        {errors.name && <Text type="text2" ellipsis={false} className='errorMsg'>
        {errors.name}
        </Text>}

         <div>
            <label>Contact Type</label>
            <Dropdown
              placeholder="Select Contact type"
              options={[{label: "Customer", value: "customer"}, {label: "Buisness", value: "buisness"}]}
              onChange={(option) => setCustomer_Type(option.value)}
              required={true}
            />
          </div>
          <Button kind="primary" type="submit" style={{ marginTop: 20 }}>
            Submit
          </Button>
        </form>
    </div>
    </>
  );
}

export default Customer;