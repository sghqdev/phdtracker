const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to register');
    }

    toast.success('Registration successful!');
    navigate('/login');
  } catch (error) {
    toast.error(error.message || 'Failed to register');
  }
};