import React, { useState } from 'react';
import AdminNav from '../../components/AdminPanal/AdminNav';
import AdminNavControl from '../../components/AdminPanal/AdminNavControl';
import EmployeeDetails from './RegistrationForms/EmployeeDetails';
import Security from './RegistrationForms/Security';
import Final from './RegistrationForms/Final';

function UserRegistration() {
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phoneNumber: "",
    userID: "",
    role: "",
    department: "",
    password: "",
    confirmPassword: "",
  });

  const steps = ["Employee Details", "Security", "Complete"];

  const displayStep = (step) => {
    switch (step) {
      case 1:
        return <EmployeeDetails formData={formData} setFormData={setFormData} />;
      case 2:
        return <Security formData={formData} setFormData={setFormData} />;
      case 3:
        return (
          <Final
            formData={formData}
            setFormData={setFormData}
            handleBack={() => handleClick("prev")}
          />
        );
      default:
        return null;
    }
  };

  // Validation logic
  const validateStep = () => {
    if (currentStep === 1) {
      const nameRegex = /^[A-Za-z]+$/;
      const phoneRegex = /^[0-9]{10}$/;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !formData.firstname ||
        !formData.lastname ||
        !formData.email ||
        !formData.phoneNumber ||
        !formData.userID ||
        !formData.department
      ) {
        alert("Please fill all required fields before continuing.");
        return false;
      }

      if (!nameRegex.test(formData.firstname)) {
        alert("First name should contain only English letters (A–Z or a–z).");
        return false;
      }

      if (!nameRegex.test(formData.lastname)) {
        alert("Last name should contain only English letters (A–Z or a–z).");
        return false;
      }

      if (!phoneRegex.test(formData.phoneNumber)) {
        alert("Phone number must be exactly 10 digits.");
        return false;
      }

      if (!emailRegex.test(formData.email)) {
        alert("Please enter a valid email address with '@' (e.g., user@example.com).");
        return false;
      }

      return true;
    }

    if (currentStep === 2) {
      const password = formData.password;
      const confirmPassword = formData.confirmPassword;

      // strong password regex
      const strongPasswordRegex =
        /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

      if (!password || !confirmPassword) {
        alert("Please fill both password fields.");
        return false;
      }

      if (!strongPasswordRegex.test(password)) {
        alert(
          "Weak Password!\nPassword must be at least 8 characters long and include:\n• One uppercase letter\n• One number\n• One special character"
        );
        return false;
      }

      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return false;
      }

      return true;
    }

    return true;
  };

  const handleClick = (direction) => {
    let newStep = currentStep;

    if (direction === "next") {
      if (!validateStep()) return; // stop if validation fails
      newStep++;
    } else {
      if (currentStep === 3) {
        setFormData({
          firstname: "",
          lastname: "",
          email: "",
          phoneNumber: "",
          userID: "",
          role: "",
          department: "",
          password: "",
          confirmPassword: "",
        });
        newStep = 1;
      } else {
        newStep--;
      }
    }

    if (newStep > 0 && newStep <= steps.length) {
      setCurrentStep(newStep);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl rounded-2xl bg-white pb-2 shadow-xl">
      <div className="container horizontal mt-5">
        <AdminNav steps={steps} currentStep={currentStep} />
      </div>

      <div className="my-10 p-10">{displayStep(currentStep)}</div>

      {currentStep !== steps.length && (
        <AdminNavControl
          handleClick={handleClick}
          currentStep={currentStep}
          steps={steps}
        />
      )}
    </div>
  );
}

export default UserRegistration;
