require('dotenv').config();
const mondayService = require('../services/monday-service');
const transformationService = require('../services/transformation-service');
const { TRANSFORMATION_TYPES } = require('../constants/transformation');
const mondaySdk = require("monday-sdk-js");
const NodeCache = require( "node-cache" );
const axios = require('axios');

const monday = mondaySdk();

const tokenCache = new NodeCache({ stdTTL: 3600 }); // this cache is valid for one hour.

const getAccessToken = async () => {
    let token = tokenCache.get('zoho-token');
    if(!token){
        return refreshToken();
    }
    else{
        return token;
    }
}

const refreshToken = async () => {
    const token_response = await axios.post(`https://accounts.zoho.in/oauth/v2/token?refresh_token=${process.env.REFRESH_TOKEN}&client_id=${process.env.CLIENT_APP_ID}&client_secret=${process.env.CLIENT_SECRET_ID}&redirect_uri=https://reactmondaytesting.netlify.app/&grant_type=refresh_token`)
    if(token_response.data.access_token){
        tokenCache.set('zoho-token', token_response.data.access_token)
        return token_response.data.access_token;
    }
}


async function getAllZohoCustomer(req, res){
  let token = tokenCache.get('zoho-token');
  if(!token){
    token = await refreshToken()
  }
  // console.log("Zoho-token:", token)
  await axios.get(`https://www.zohoapis.in/books/v3/contacts?organization_id=${process.env.ZOHO_ORGANIZATION_ID}`, {
  headers: { 
    Authorization: `Zoho-oauthtoken ${token}` 
  }
  })
  .then(response => {
    let contactsArray = [];
    let n = response.data.contacts.length;
    for(let i=0; i<n; i++){
      let contactObject = {};
      contactObject.id = response.data.contacts[i].contact_id
      contactObject.name = response.data.contacts[i].contact_name
      contactsArray.push(contactObject)
    }
    res.send({"contacts":contactsArray}); // Use response.data, not body
  })
  .catch(err => {
    console.error('Zoho API Error:', err);
    res.status(500).send({ 
      status: "error", 
      message: err.message || 'Failed to fetch contacts' 
    });
  });
}

async function executeAction(req, res) {
  const { shortLivedToken } = req.session;
  const { payload } = req.body;

  try {
    const { inputFields } = payload;
    const { boardId, itemId, sourceColumnId, targetColumnId, transformationType } = inputFields;

    const text = await mondayService.getColumnValue(shortLivedToken, itemId, sourceColumnId);
    if (!text) {
      return res.status(200).send({});
    }
    const transformedText = transformationService.transformText(
      text,
      transformationType ? transformationType.value : 'TO_UPPER_CASE'
    );

    await mondayService.changeColumnValue(shortLivedToken, boardId, itemId, targetColumnId, transformedText);

    return res.status(200).send({});
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: 'internal server error' });
  }
}

async function getRemoteListOptions(req, res) {
  try {
    return res.status(200).send(TRANSFORMATION_TYPES);
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: 'internal server error' });
  }
}



async function zohoInvoice (req, res){
    let data;
    
    if(req.body){
      data = req.body;
    }
    else if(req.body.payload){
      data = req.payload
    }
    else{
      data = {}
    }

    if(!data){
      console.log("No data")
      res.status(400).send({received: "error"});
      return;
    }
    
    if(!data.invoice){
      console.log("No invoice data")
      res.status(400).send({received: "error"});
      return;
    }

    let queryJson = {};
    
    queryJson.text_mkrfqyxv =  data.invoice.customer_name
    queryJson.date_mkrf2znk =  data.invoice.date
    queryJson.date_mkrfs2qk = data.invoice.due_date
    queryJson.numeric_mkrfmp0y =  data.invoice.total.toString();
    queryJson.text_mkrf1w4t =  data.invoice.status
    queryJson.date4 = data.invoice.created_time.split('T')[0]

    queryJson = JSON.stringify(queryJson).replace(/"/g, '\\"');

    monday.api(`
      mutation{
        create_item (board_id: 2021676128, item_name:"${data.invoice.invoice_number}", column_values: "${queryJson}"){
          id
        }
      }
    `,{token: "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUxODA0MTA2MiwiYWFpIjoxMSwidWlkIjo3NjUwNzU5MywiaWFkIjoiMjAyNS0wNS0yN1QwNzoxMzoyMC4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6Mjk3MDgyMTMsInJnbiI6ImFwc2UyIn0.h_MKOJ41fE23asfUYOtFljCO8xFm5joSfIijwoLL9xE"})
    .then(response=>{
        if(response.received.data.create_itme){
          res.status(201).send({received: "ok"});
          return;
        }
        else{
          res.status(500).send({received: response});
          return;
        }
    })
    .catch(err=>{
      res.status(500).send({received:err});
      return;
    });
}

async function zohoCustomer (req, res){
    // If payload exists and is a JSON string, parse it
    let data;
    if(req.body){
      data = req.body;
    }
    else if(req.body.payload){
      data = req.payload
    }
    else{
      data = {}
    }

    let queryJson = {};

    if(!data){
      console.log("No data")
        res.send({received: "ok"});
        return;
    }
    if(!data.contact){
        console.log("No Contact data")
        res.send({received: "ok"});
        return;
    }

    queryJson.name = data.contact.contact_name;
    queryJson.text_mkrbptq8 = data.contact.email;
    queryJson.text_mkrbb6jf = data.contact.phone;
    queryJson.text_mkrbc4p = data.contact.company_name;
    queryJson.color_mkrbav4h = data.contact.contact_type;
    queryJson.date_mkrbmamt = data.contact.created_time.split('T')[0];

    // console.log(queryJson);

    queryJson = JSON.stringify(queryJson).replace(/"/g, '\\"');

    const response = await monday.api(`
        mutation{
            create_item (board_id: 2019802945, item_name:"${data.contact.contact_name}", column_values: "${queryJson}"){
                id
            }
        }
    `,{token: "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUxODA0MTA2MiwiYWFpIjoxMSwidWlkIjo3NjUwNzU5MywiaWFkIjoiMjAyNS0wNS0yN1QwNzoxMzoyMC4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6Mjk3MDgyMTMsInJnbiI6ImFwc2UyIn0.h_MKOJ41fE23asfUYOtFljCO8xFm5joSfIijwoLL9xE"})
    .then(response=>{
        if(response.received.data.create_itme){
            return res.status(201).send({received: "ok"});
        }
        else{
            return res.status(500).send({received: response});
        }
    })
    .catch(err=>{res.status(500).send({received:err})});
}



async function zohoCreateCustomer(req, res){
    let token = tokenCache.get('zoho-token');
    console.log(req.body)
    if(!token){
        console.log("Refreshing access token....");
        token = await getAccessToken();
    }
    const config = {
        headers: {
            'Authorization': `Zoho-oauthtoken ${token}`,
            'Content-Type': 'application/json'
        }
    };
    try{
        const response = await axios.post(`https://www.zohoapis.in/books/v3/contacts?organization_id=${process.env.ZOHO_ORGANIZATION_ID}`, req.body, config);
//        console.log("Response data for Customer Creation: ",response.data);
        res.json({status: "ok", recieved: response.data});
        return;
    }
    catch(err){
        res.json({ status:"error", received: err });
        return;
    }
}



async function zohoCreateInvoice(req, res){
    let token = await getAccessToken();
    console.log(req.body)
    const config = {
        headers: {
            'Authorization': `Zoho-oauthtoken ${token}`,
           'ignore_auto_number_generation': true,
            'Content-Type': 'application/json'
        }
    };
    try{
        const response = await axios.post(`https://www.zohoapis.in/books/v3/invoices?organization_id=${process.env.ZOHO_ORGANIZATION_ID}&ignore_auto_number_generation=true`, req.body, config);
        res.json({status: "ok", recieved: response.data});
        return; 
    }
    catch(err){
        console.log(err)
        res.json({ status:"error", received: err });
        return;
    }
}



async function getZohoItems(req, res){
    let token = await getAccessToken();
    await axios.get(`https://www.zohoapis.in/books/v3/items?organization_id=${process.env.ZOHO_ORGANIZATION_ID}`,{headers: {'Authorization': `Zoho-oauthtoken ${token}`,}})
    .then(response=> {
        res.json({status: "success", recieved: response.data}); 
        return;
    })
    .catch(err=> {
        res.json({status: "error", recieved: err})
        return;
    });
}

module.exports = {
  executeAction,
  getRemoteListOptions,
  zohoInvoice,
  zohoCustomer,
  getAllZohoCustomer,
  zohoCreateCustomer,
  zohoCreateInvoice,
  getZohoItems
};
