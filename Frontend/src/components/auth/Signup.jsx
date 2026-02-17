import React, { useState } from "react";
import Card from "@mui/joy/Card";
import CardActions from "@mui/joy/CardActions";
import CardContent from "@mui/joy/CardContent";
import Checkbox from "@mui/joy/Checkbox";
import Divider from "@mui/joy/Divider";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Typography from "@mui/joy/Typography";
import Button from "@mui/joy/Button";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import LocationOn from "@mui/icons-material/LocationOn";
import EmailIcon from "@mui/icons-material/Email";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import BadgeIcon from "@mui/icons-material/Badge";
import PasswordIcon from "@mui/icons-material/Password";
import Select from "@mui/joy/Select";
import Link from "@mui/joy/Link";
import Option from "@mui/joy/Option";
import { useNavigate } from "react-router-dom";

function Signupform() {
  const [isFoodSource, setIsFoodSource] = useState(false);
  const [errors, setErrors] = useState({});

  const [registerData, setRegisterData] = useState({
    name: "",
    phone: "",
    email: "",
    location: "",
    pincode: "",
    password: "",
    isFoodSource: false,
    foodSourceName: "",
    foodSourceType: "",
    foodSourceLocation: "",
    foodSourcePinCode: "",
  });

  const navigate = useNavigate();

  const handleSourceChange = (e) => {
    setIsFoodSource(e.target.checked);
    setRegisterData({ ...registerData, isFoodSource: e.target.checked });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegisterData({ ...registerData, [name]: value });
  };

 
  const validateForm = () => {
    const newErrors = {};

    if (!registerData.name.trim()) newErrors.name = "Name is required";

    if (!registerData.phone.trim())
      newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(registerData.phone))
      newErrors.phone = "Phone must be 10 digits";

    if (!registerData.email.trim())
      newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email))
      newErrors.email = "Invalid email format";

    if (!registerData.location.trim())
      newErrors.location = "Location is required";

    if (!registerData.pincode.trim())
      newErrors.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(registerData.pincode))
      newErrors.pincode = "Pincode must be 6 digits";

    if (!registerData.password.trim())
      newErrors.password = "Password is required";
    else if (registerData.password.length < 6)
      newErrors.password = "Minimum 6 characters required";

    if (isFoodSource) {
      if (!registerData.foodSourceName.trim())
        newErrors.foodSourceName = "Food source name is required";

      if (!registerData.foodSourceType)
        newErrors.foodSourceType = "Select food source type";

      if (!registerData.foodSourceLocation.trim())
        newErrors.foodSourceLocation = "Food source location is required";

      if (!registerData.foodSourcePinCode.trim())
        newErrors.foodSourcePinCode = "Food source pincode is required";
      else if (!/^\d{6}$/.test(registerData.foodSourcePinCode))
        newErrors.foodSourcePinCode = "Pincode must be 6 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
 

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch("http://127.0.0.1:3000/api/donor/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: registerData.name,
          email: registerData.email,
          phone: registerData.phone,
          location: registerData.location,
          pincode: registerData.pincode,
          password: registerData.password,
          foodSource: isFoodSource
            ? {
                sourceType: registerData.foodSourceType,
                sourceName: registerData.foodSourceName,
                sourceLocation: registerData.foodSourceLocation,
                pincode: registerData.foodSourcePinCode,
              }
            : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful!");
        navigate("/login");
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred during registration.");
    }
  };

  return (
    <Card variant="outlined" sx={{ maxWidth: "40%", mx: "auto" }}>
      <Typography level="title-lg" startDecorator={<HowToRegIcon />}>
        Signup
      </Typography>
      <Divider />

      <CardContent
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(80px, 1fr))",
          gap: 1.5,
        }}
      >
        {/* Name */}
        <FormControl error={!!errors.name} sx={{ gridColumn: "1/-1" }}>
          <FormLabel>Name</FormLabel>
          <Input name="name" value={registerData.name} onChange={handleChange} />
          {errors.name && <Typography color="danger">{errors.name}</Typography>}
        </FormControl>

        {/* Phone */}
        <FormControl error={!!errors.phone} sx={{ gridColumn: "1/-1" }}>
          <FormLabel>Phone</FormLabel>
          <Input
            name="phone"
            value={registerData.phone}
            onChange={handleChange}
          />
          {errors.phone && (
            <Typography color="danger">{errors.phone}</Typography>
          )}
        </FormControl>

        {/* Email */}
        <FormControl error={!!errors.email} sx={{ gridColumn: "1/-1" }}>
          <FormLabel>Email</FormLabel>
          <Input
            name="email"
            value={registerData.email}
            onChange={handleChange}
          />
          {errors.email && (
            <Typography color="danger">{errors.email}</Typography>
          )}
        </FormControl>

        {/* Location */}
        <FormControl error={!!errors.location} sx={{ gridColumn: "1/-1" }}>
          <FormLabel>Location</FormLabel>
          <Input
            name="location"
            value={registerData.location}
            onChange={handleChange}
          />
          {errors.location && (
            <Typography color="danger">{errors.location}</Typography>
          )}
        </FormControl>

        {/* Pincode */}
        <FormControl error={!!errors.pincode} sx={{ gridColumn: "1/-1" }}>
          <FormLabel>Pincode</FormLabel>
          <Input
            name="pincode"
            value={registerData.pincode}
            onChange={handleChange}
          />
          {errors.pincode && (
            <Typography color="danger">{errors.pincode}</Typography>
          )}
        </FormControl>

        {/* Password */}
        <FormControl error={!!errors.password} sx={{ gridColumn: "1/-1" }}>
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            name="password"
            value={registerData.password}
            onChange={handleChange}
          />
          {errors.password && (
            <Typography color="danger">{errors.password}</Typography>
          )}
        </FormControl>

        <Checkbox
          label="Are you a Food Source?"
          checked={isFoodSource}
          onChange={handleSourceChange}
          sx={{ gridColumn: "1/-1" }}
        />

        {isFoodSource && (
          <>
            <FormControl
              error={!!errors.foodSourceName}
              sx={{ gridColumn: "1/-1" }}
            >
              <FormLabel>Food Source Name</FormLabel>
              <Input
                name="foodSourceName"
                value={registerData.foodSourceName}
                onChange={handleChange}
              />
              {errors.foodSourceName && (
                <Typography color="danger">
                  {errors.foodSourceName}
                </Typography>
              )}
            </FormControl>

            <FormControl
              error={!!errors.foodSourceType}
              sx={{ gridColumn: "1/-1" }}
            >
              <FormLabel>Food Source Type</FormLabel>
              <Select
                value={registerData.foodSourceType}
                onChange={(e, v) =>
                  setRegisterData({ ...registerData, foodSourceType: v })
                }
              >
                <Option value="Hotel">Hotel</Option>
                <Option value="Restaurant">Restaurant</Option>
                <Option value="Hall">Hall</Option>
                <Option value="Other">Other</Option>
              </Select>
              {errors.foodSourceType && (
                <Typography color="danger">
                  {errors.foodSourceType}
                </Typography>
              )}
            </FormControl>
          </>
        )}

        <CardActions sx={{ gridColumn: "1/-1" }}>
          <Button onClick={handleSubmit}>Signup</Button>
        </CardActions>
      </CardContent>
    </Card>
  );
}

export default Signupform;
