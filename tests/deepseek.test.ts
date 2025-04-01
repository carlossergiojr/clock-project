jest.setTimeout(10000)

test("POST to /api/v1/chat with FormData should return 200", async () => {
  // Create FormData with the 4 required elements
  const formData = new FormData()
  formData.append("MessageSid", "SM1234567890abcdef") // example message SID
  formData.append("From", "+15551234567") // example sender number
  formData.append("To", "+15559876543") // example recipient number
  formData.append("Body", "pizza no gauchao 350,70 reais")

  const response = await fetch("http://localhost:3000/api/v1/chat", {
    method: "POST",
    body: formData,
  })

  expect(response.status).toBe(200)
})
