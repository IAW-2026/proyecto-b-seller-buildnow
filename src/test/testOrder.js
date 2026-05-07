fetch('http://localhost:3000/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    buyerId: "user_falso123",
    storeId: "74999235-1c77-430e-b094-745cd20f6515", 
    deliveryAddress: "Calle Falsa 123",
    items: [
      { productId: "20c35bf4-3121-46ec-b8a1-bd019b094530", quantity: 2 }
    ]
  })
})
.then(res => res.json())
.then(console.log);

