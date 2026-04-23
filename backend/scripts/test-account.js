fetch("http://localhost:5000/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "account@college.com", password: "password" })
}).then(res => res.json().then(data => ({status: res.status, data})))
  .then(data => {
    console.log("Login data:", data);
    if(data.status === 200) {
      return fetch("http://localhost:5000/api/account/requests/pending", {
        headers: { "Authorization": "Bearer " + data.data.token }
      }).then(res => res.json().then(d => console.log("Account response:", d)));
    }
  })
  .catch(console.error);
