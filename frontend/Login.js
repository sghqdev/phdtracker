const handleLogin = async () => {
    try {
      const response = await axios.post("/api/auth/login", { email, password });
      localStorage.setItem("token", response.data.token);
      console.log("Login successful!");
    } catch (error) {
      console.error("Login failed", error);
    }
  };
  
  