fetch("http://localhost:5000/api/admin/teachers", {
  method: "GET",
  headers: {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiZGVwYXJ0bWVudF9pZCI6bnVsbCwiaXNfaG9kIjpmYWxzZSwiaWF0IjoxNzc0ODYyMTQyLCJleHAiOjE3NzU0NjY5NDJ9.Bh3UJJUEKIr5OuKW1N2F0XkNyHCZ07gzF-yP5Vub8XQ",
    "Content-Type": "application/json"
  }
}).then(res => res.json().then(data => ({status: res.status, data})))
  .then(console.log)
  .catch(console.error);
